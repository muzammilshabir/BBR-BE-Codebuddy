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
import { InvoiceScheduleStatus, RenewalFrequency } from './invoiceSchedule.enum';
import { Cron } from '@nestjs/schedule';
import { InvoiceService } from 'src/invoice/invoice.service';
import { Invoice } from 'src/stripe/schema/invoice.schema';
import { InvoiceStatus } from 'src/stripe/enum/invoice-status.enum';

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
    private featureModel: Model<FeatureSchema>,

    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,

    private readonly invoiceService: InvoiceService
  ) {}

  @Cron('0 0 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  //   @Cron('*/30 * * * * *', {
  //     timeZone: 'America/Los_Angeles',
  //   })
  async handleMidnightTasks() {
    const startOfDayPST = dayjs().tz('Asia/Kolkata').startOf('day');
    const endOfDayPST = startOfDayPST.endOf('day');
    console.log(startOfDayPST.toDate(), endOfDayPST.toDate());

    const invoiceSchedules = await this.invoiceScheduleModel.find({
      status: InvoiceScheduleStatus.ACTIVE,
      $or: [
        { issueDate: { $gte: startOfDayPST.toDate(), $lte: endOfDayPST.toDate() } },
        {
          $and: [
            { nextInvoiceIssueDate: { $exists: true } },
            { nextInvoiceIssueDate: { $gte: startOfDayPST.toDate(), $lte: endOfDayPST.toDate() } },
          ],
        },
      ],
    });

    for (const invoiceSchedule of invoiceSchedules) {
      if (!invoiceSchedule.nextInvoiceIssueDate) {
        // create invoice
        const invoice = await this.invoiceService.createInvoiceFromSchedule(
          invoiceSchedule,
          invoiceSchedule.issueDate,
          invoiceSchedule.dueDate,
          invoiceSchedule.currentPaymentMethodId.toString()
        );
        // calculate next invoice issue date
        const nextInvoiceIssueDate = this.calculateNextInvoiceIssueDate(
          invoiceSchedule.issueDate,
          invoiceSchedule.renewalFrequency,
          invoiceSchedule.reminderDays
        );
        // update invoice schedule
        await this.invoiceScheduleModel.findByIdAndUpdate(invoiceSchedule._id, {
          nextInvoiceIssueDate,
          currentInvoiceId: invoice._id,
        });
      } else {
        // create invoice
        const dueDate = dayjs(invoiceSchedule.nextInvoiceIssueDate).add(
          invoiceSchedule.reminderDays,
          'days'
        );
        const invoice = await this.invoiceService.createInvoiceFromSchedule(
          invoiceSchedule,
          invoiceSchedule.nextInvoiceIssueDate,
          dueDate.toDate(),
          invoiceSchedule.paymentMethodId.toString()
        );
        await this.invoiceScheduleModel.findByIdAndUpdate(invoiceSchedule._id, {
          currentInvoiceId: invoice._id,
        });
        // calculate next invoice issue date
        const nextInvoiceIssueDate = this.calculateNextInvoiceIssueDate(
          invoiceSchedule.nextInvoiceIssueDate,
          invoiceSchedule.renewalFrequency,
          invoiceSchedule.reminderDays
        );
        // update invoice schedule
        await this.invoiceScheduleModel.findByIdAndUpdate(invoiceSchedule._id, {
          nextInvoiceIssueDate,
          currentInvoiceId: invoice._id,
        });
        // attempt to pay invoice
      }
    }

    const invoicesToAttemptPayment = await this.invoiceModel.find({
      status: InvoiceStatus.PENDING,
      nextAutoPaymentAttemptAt: { $gte: startOfDayPST.toDate(), $lte: endOfDayPST.toDate() },
    });

    for (const invoice of invoicesToAttemptPayment) {
      await this.invoiceService.attemptAutoPayment(invoice);
    }
  }

  calculateNextInvoiceIssueDate(
    issueDate: Date,
    renewalFrequency: RenewalFrequency,
    reminderDays: number
  ) {
    let daysToAdd;

    switch (renewalFrequency) {
      case RenewalFrequency.DAY:
        daysToAdd = 1;
        break;
      case RenewalFrequency.MONTHLY:
        daysToAdd = 30;
        break;
      case RenewalFrequency.YEARLY:
        daysToAdd = 365;
        break;
      default:
        daysToAdd = 30;
    }

    const nextInvoiceIssueDate = dayjs(issueDate)
      .add(daysToAdd, 'days')
      .subtract(reminderDays, 'days')
      .toDate();

    return nextInvoiceIssueDate;
  }

  async createInvoiceSchedule(createInvoiceScheduleDto: CreateInvoiceScheduleDto) {
    const {
      developerId,
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

    const developer = await this.userModel.findById(developerId);
    if (!developer) {
      throw new NotFoundException('Developer not found');
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
    const pstDate = dayjs.tz(issueDate, 'Asia/Kolkata');
    const todayStartPST = dayjs().tz('Asia/Kolkata').startOf('day');

    if (pstDate.isBefore(todayStartPST)) {
      throw new BadRequestException('Issue date cannot be in the past');
    }

    // Convert PST date to UTC for storage
    const utcDate = pstDate.utc().toDate();

    const dueDatePST = dayjs.tz(dueDate, 'Asia/Kolkata');
    if (dueDatePST.isBefore(pstDate, 'day')) {
      throw new BadRequestException('Due date cannot be before issue date');
    }

    const dueDateUTC = dueDatePST.utc().toDate();

    const currentPaymentMethod = await this.paymentMethodModel.findOne({
      _id: currentPaymentMethodId,
      customerId: developerId,
    });

    if (!currentPaymentMethod) {
      throw new NotFoundException('Current payment method not found');
    }

    const paymentMethod = await this.paymentMethodModel.findOne({
      _id: paymentMethodId,
      customerId: developerId,
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
      developerId: new Types.ObjectId(developerId),
      residenceId: new Types.ObjectId(residenceId),
      status: { $ne: InvoiceScheduleStatus.INACTIVE },
    });

    // Prepare the invoice schedule data
    const invoiceScheduleData = {
      developerId: new Types.ObjectId(developerId),
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

    const invoiceSchedule = await this.invoiceScheduleModel.create(invoiceScheduleData);

    // Create invoice immediately
    const dueDateObj = dayjs(invoiceSchedule.dueDate).tz('Asia/Kolkata');
    let invoice = await this.invoiceService.createInvoiceFromSchedule(
      invoiceSchedule,
      invoiceSchedule.issueDate,
      dueDateObj.toDate(),
      invoiceSchedule.paymentMethodId.toString()
    );
    invoice = await this.invoiceModel.findById(invoice._id);

    if (publish === false) {
      invoice = await this.invoiceModel.findByIdAndUpdate(
        invoice._id,
        {
          status: InvoiceStatus.DRAFT,
        },
        {
          new: true,
        }
      );
    } else {
      invoice = await this.invoiceModel.findByIdAndUpdate(
        invoice._id,
        {
          status: InvoiceStatus.PENDING,
        },
        {
          new: true,
        }
      );
    }

    // calculate next invoice issue date
    const nextInvoiceIssueDate = this.calculateNextInvoiceIssueDate(
      invoiceSchedule.issueDate,
      invoiceSchedule.renewalFrequency,
      invoiceSchedule.reminderDays
    );
    // update invoice schedule
    await this.invoiceScheduleModel.findByIdAndUpdate(invoiceSchedule._id, {
      nextInvoiceIssueDate,
      currentInvoiceId: invoice._id,
    });

    if (
      publish === true &&
      invoiceSchedule.status === InvoiceScheduleStatus.ACTIVE &&
      dayjs(invoiceSchedule.issueDate).tz('Asia/Kolkata').startOf('day').isSame(todayStartPST)
    ) {
      // Attempt to pay the invoice
      await this.invoiceService.attemptAutoPayment(invoice);
    }

    return { invoiceSchedule, invoice };
  }

  async getInvoiceSchedule(developerId: string, residenceId: string) {
    const invoiceSchedules = await this.invoiceScheduleModel.find({
      developerId: new Types.ObjectId(developerId),
      residenceId: new Types.ObjectId(residenceId),
      status: {
        $in: [InvoiceScheduleStatus.DRAFT, InvoiceScheduleStatus.ACTIVE],
      },
    });

    if (invoiceSchedules.length > 0) {
      const draft = invoiceSchedules.find(
        (schedule) => schedule.status === InvoiceScheduleStatus.DRAFT
      );
      if (draft) {
        return draft;
      } else {
        const active = invoiceSchedules.find(
          (schedule) => schedule.status === InvoiceScheduleStatus.ACTIVE
        );
        if (active) {
          return active;
        }
      }
    }
    return null;
  }

  async getInvoiceScheduleById(id: string) {
    const invoiceSchedule = await this.invoiceScheduleModel.findById(id).populate([
      {
        path: 'currentInvoice',
      },
      {
        path: 'paymentMethod',
      },
      {
        path: 'currentPaymentMethod',
      },
      {
        path: 'plan',
      },
      {
        path: 'residence',
      },
    ]);
    if (!invoiceSchedule) {
      throw new NotFoundException('Invoice schedule not found');
    }
    return invoiceSchedule;
  }
}
