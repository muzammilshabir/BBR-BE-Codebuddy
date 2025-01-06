import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateInvoiceScheduleDto, Feature } from './dto/create-invoice-schedule.dto';
import { InjectModel } from '@nestjs/mongoose';
import { InvoiceSchedule } from './invoiceSchedule.schema';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { Residence } from 'src/residences/schema/residences.schema';
import { Plan } from 'src/subscription-plan/schema/plan.schema';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { PaymentMethod } from 'src/stripe/schema/payment-method.schema';
import { Feature as FeatureSchema } from 'src/subscription-plan/schema/feature.schema';
import { InvoiceScheduleStatus } from './invoiceSchedule.enum';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class InvoiceScheduleService {
  constructor(
    @InjectModel(InvoiceSchedule.name)
    private invoiceScheduleModel: Model<InvoiceSchedule>,

    @InjectModel(User.name)
    private userModel: Model<User>,

    @InjectModel(Residence.name)
    private residenceModel: Model<Residence>,

    @InjectModel(Plan.name)
    private planModel: Model<Plan>,

    @InjectModel(PaymentMethod.name)
    private paymentMethodModel: Model<PaymentMethod>,

    @InjectModel(Feature.name)
    private featureModel: Model<FeatureSchema>
  ) {}

  async createInvoiceSchedule(createInvoiceScheduleDto: CreateInvoiceScheduleDto) {
    const {
      buyerId,
      residenceId,
      planId,
      issueDate,
      currentPaymentMethodId,
      features,
      paymentMethodId,
      publish,
      buyerEmail,
      companyName,
      dueDate,
      discountAmount,
      taxPercentage,
      notes,
      renewalFrequency,
      reminderDays,
      maxRenewalAttemptsCount,
      attemptsFrequency,
      gracePeriodDays,
    } = createInvoiceScheduleDto;

    const buyer = await this.userModel.findById(buyerId);
    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    const residence = await this.residenceModel.findById(residenceId);
    if (!residence) {
      throw new NotFoundException('Residence not found');
    }

    const plan = await this.planModel.findById(planId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Convert incoming PST date to dayjs object and validate it's not in the past
    const pstDate = dayjs.tz(issueDate, 'America/Los_Angeles');
    const todayStartPST = dayjs().tz('America/Los_Angeles').startOf('day');

    if (pstDate.isBefore(todayStartPST)) {
      throw new BadRequestException('Issue date cannot be in the past');
    }

    // Convert PST date to UTC for storage
    const utcDate = pstDate.utc().toDate();

    const dueDatePST = dayjs.tz(dueDate, 'America/Los_Angeles');
    if (dueDatePST.isBefore(pstDate, 'day')) {
      throw new BadRequestException('Due date cannot be before issue date');
    }

    const dueDateUTC = dueDatePST.utc().toDate();

    const currentPaymentMethod = await this.paymentMethodModel.findOne({
      _id: currentPaymentMethodId,
      customerId: buyerId,
    });

    if (!currentPaymentMethod) {
      throw new NotFoundException('Current payment method not found');
    }

    const paymentMethod = await this.paymentMethodModel.findOne({
      _id: paymentMethodId,
      customerId: buyerId,
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    let featureItems;
    const featureIds = features
      .filter((feature) => feature.featureId)
      .map((feature) => feature.featureId);
    if (featureIds.length > 0) {
      featureItems = await this.featureModel.find({
        _id: { $in: featureIds },
      });

      if (featureItems.length !== featureIds.length) {
        throw new NotFoundException('Some features are not found');
      }
    }

    const invoiceSchedules = await this.invoiceScheduleModel.find({
      buyerId: new Types.ObjectId(buyerId),
      residenceId: new Types.ObjectId(residenceId),
      status: { $ne: InvoiceScheduleStatus.INACTIVE },
    });

    // Prepare the invoice schedule data
    const invoiceScheduleData = {
      buyerId: new Types.ObjectId(buyerId),
      residenceId: new Types.ObjectId(residenceId),
      buyerEmail,
      companyName,
      planId: new Types.ObjectId(planId),
      issueDate: utcDate,
      dueDate: dueDateUTC,
      currentPaymentMethodId: new Types.ObjectId(currentPaymentMethodId),
      features: features.map((feature) => ({
        ...(feature.featureId ? { featureId: new Types.ObjectId(feature.featureId) } : {}),
        ...(feature.featureName
          ? { featureName: feature.featureName }
          : {
              featureName: featureItems.find((item) => item._id.toString() === feature.featureId)
                ?.name,
            }),
        unitAmount: feature.unitAmount,
        quantity: feature.quantity,
      })),
      discountAmount,
      taxPercentage,
      notes,
      renewalFrequency,
      paymentMethodId: new Types.ObjectId(paymentMethodId),
      reminderDays,
      maxRenewalAttemptsCount,
      attemptsFrequency,
      gracePeriodDays,
      status: publish ? InvoiceScheduleStatus.ACTIVE : InvoiceScheduleStatus.DRAFT,
    };

    // Find existing schedules
    const existingDraft = invoiceSchedules.find(
      (schedule) => schedule.status === InvoiceScheduleStatus.DRAFT
    );
    const existingActiveSchedules = invoiceSchedules.filter(
      (schedule) => schedule.status === InvoiceScheduleStatus.ACTIVE
    );

    // If publishing, mark existing active schedules as inactive
    if (publish && existingActiveSchedules.length > 0) {
      await this.invoiceScheduleModel.updateMany(
        { _id: { $in: existingActiveSchedules.map((schedule) => schedule._id) } },
        { status: InvoiceScheduleStatus.INACTIVE }
      );
    }

    // Update existing draft or create new schedule
    if (existingDraft) {
      return await this.invoiceScheduleModel.findByIdAndUpdate(
        existingDraft._id,
        invoiceScheduleData,
        { new: true }
      );
    }

    return await this.invoiceScheduleModel.create(invoiceScheduleData);
  }
}
