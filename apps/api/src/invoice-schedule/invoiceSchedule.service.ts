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
import { PaymentService } from 'src/stripe/payment.service';

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

    private readonly invoiceService: InvoiceService,

    private readonly paymentService: PaymentService
  ) {}

  @Cron('0 0 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  //   @Cron('*/30 * * * * *', {
  //     timeZone: 'America/Los_Angeles',
  //   })
  async handleMidnightTasks() {
    console.log(`Cron job running at ${new Date().toISOString()}`);

    const startOfDayPST = dayjs().tz('Asia/Kolkata').startOf('day');
    const endOfDayPST = startOfDayPST.endOf('day');
    console.log(startOfDayPST.toDate(), endOfDayPST.toDate());

    const invoiceSchedules = await this.invoiceScheduleModel.find({
      status: InvoiceScheduleStatus.ACTIVE,
      $and: [
        { nextInvoiceIssueDate: { $exists: true } },
        { nextInvoiceIssueDate: { $gte: startOfDayPST.toDate(), $lte: endOfDayPST.toDate() } },
      ],
    });

    for (const invoiceSchedule of invoiceSchedules) {
      try {
        const activeInvoices = await this.invoiceModel.find({
          invoiceScheduleId: invoiceSchedule._id,
          status: InvoiceStatus.ACTIVE,
        });

        for (const inv of activeInvoices) {
          const invoice = await this.invoiceModel.findByIdAndUpdate(
            inv.id,
            {
              status: InvoiceStatus.PENDING,
            },
            { new: true }
          );
          await this.invoiceService.finalizeInvoice(invoice.id);
          await this.invoiceModel.findByIdAndUpdate(invoice.id, {
            nextAutoPaymentAttemptAt: startOfDayPST.toDate(),
          });

          const nextInvoiceIssueDate = this.calculateNextInvoiceIssueDate(
            invoiceSchedule.issueDate,
            invoiceSchedule.renewalFrequency,
            invoiceSchedule.reminderDays
          );
          await this.invoiceScheduleModel.findByIdAndUpdate(invoiceSchedule._id, {
            nextInvoiceIssueDate: nextInvoiceIssueDate,
            nextReminderDate: dayjs(nextInvoiceIssueDate)
              .subtract(invoiceSchedule.reminderDays, 'days')
              .toDate(),
          });
        }

        if (!activeInvoices.length) {
          const dueDate = dayjs(invoiceSchedule.nextInvoiceIssueDate).add(
            invoiceSchedule.reminderDays,
            'days'
          );
          const invoice = await this.invoiceService.createInvoiceFromSchedule(
            invoiceSchedule,
            invoiceSchedule.nextInvoiceIssueDate,
            dueDate.toDate(),
            invoiceSchedule.paymentMethodId.toString(),
            InvoiceStatus.PENDING
          );
          await this.invoiceService.finalizeInvoice(invoice.id);
          await this.invoiceModel.findByIdAndUpdate(invoice.id, {
            nextAutoPaymentAttemptAt: startOfDayPST.toDate(),
          });

          const nextInvoiceIssueDate = this.calculateNextInvoiceIssueDate(
            invoiceSchedule.issueDate,
            invoiceSchedule.renewalFrequency,
            invoiceSchedule.reminderDays
          );
          await this.invoiceScheduleModel.findByIdAndUpdate(invoiceSchedule._id, {
            nextInvoiceIssueDate: nextInvoiceIssueDate,
            nextReminderDate: dayjs(nextInvoiceIssueDate)
              .subtract(invoiceSchedule.reminderDays, 'days')
              .toDate(),
          });
        }
      } catch (error) {
        console.error(error);
      }
    }

    const invoiceSchedulesToSendReminder = await this.invoiceScheduleModel.find({
      nextReminderDate: { $gte: startOfDayPST.toDate(), $lte: endOfDayPST.toDate() },
    });
    console.log(`invoiceSchedulesToSendReminder`, invoiceSchedulesToSendReminder);
    for (const invoiceSchedule of invoiceSchedulesToSendReminder) {
      try {
        await this.paymentService.sendInvoiceReminder(invoiceSchedule);
      } catch (error) {
        console.error(error);
      }
    }

    const invoicesToAttemptPayment = await this.invoiceModel.find({
      status: InvoiceStatus.PENDING,
      nextAutoPaymentAttemptAt: { $gte: startOfDayPST.toDate(), $lte: endOfDayPST.toDate() },
    });
    console.log(`invoicesToAttemptPayment`, invoicesToAttemptPayment);

    for (const invoice of invoicesToAttemptPayment) {
      try {
        await this.invoiceService.attemptAutoPayment(invoice);
      } catch (error) {
        console.error(error);
      }
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
    let existingDraft = invoiceSchedules.find(
      (schedule) => schedule.status === InvoiceScheduleStatus.DRAFT
    );
    let existingActiveSchedules = invoiceSchedules.find(
      (schedule) => schedule.status === InvoiceScheduleStatus.ACTIVE
    );

    if (publish === false) {
      if (existingDraft) {
        existingDraft = await this.invoiceScheduleModel.findByIdAndUpdate(
          existingDraft._id,
          invoiceScheduleData,
          { new: true }
        );
        // TODO: Delete draft invoice
        await this.invoiceModel.deleteMany({
          invoiceScheduleId: existingDraft._id,
          status: InvoiceStatus.DRAFT,
        });

        // TODO: Create draft invoice
        const invoice = await this.invoiceService.createInvoiceFromSchedule(
          existingDraft,
          existingDraft.issueDate,
          existingDraft.dueDate,
          existingDraft.paymentMethodId.toString(),
          InvoiceStatus.DRAFT
        );
        return { invoiceSchedule: existingDraft, invoice };
      } else {
        existingDraft = await this.invoiceScheduleModel.create(invoiceScheduleData);
        // TODO: Create draft invoice
        const invoice = await this.invoiceService.createInvoiceFromSchedule(
          existingDraft,
          existingDraft.issueDate,
          existingDraft.dueDate,
          existingDraft.paymentMethodId.toString(),
          InvoiceStatus.DRAFT
        );
        return { invoiceSchedule: existingDraft, invoice };
      }
    }

    if (existingActiveSchedules) {
      await this.invoiceScheduleModel.findByIdAndUpdate(existingActiveSchedules._id, {
        status: InvoiceScheduleStatus.INACTIVE,
      });
      // TODO: Cancel active/draft invoices
      const invoices = await this.invoiceModel.find({
        invoiceScheduleId: existingActiveSchedules._id,
        status: InvoiceStatus.ACTIVE,
      });
      for (const inv of invoices) {
        if (inv.status === InvoiceStatus.ACTIVE) {
          await this.paymentService.cancelInvoice(inv.id);
        }
      }
      await this.invoiceModel.deleteMany({
        invoiceScheduleId: existingActiveSchedules._id,
        status: InvoiceStatus.DRAFT,
      });

      // TODO: Create new active schedule
      existingActiveSchedules = await this.invoiceScheduleModel.create({
        ...invoiceScheduleData,
        status: InvoiceScheduleStatus.ACTIVE,
      });
      // TODO: Create another active invoice
      let invoice = await this.invoiceService.createInvoiceFromSchedule(
        existingActiveSchedules,
        existingActiveSchedules.issueDate,
        existingActiveSchedules.dueDate,
        existingActiveSchedules.paymentMethodId.toString(),
        InvoiceStatus.ACTIVE
      );

      if (
        dayjs(existingActiveSchedules.issueDate)
          .tz('Asia/Kolkata')
          .startOf('day')
          .isSame(todayStartPST)
      ) {
        invoice = await this.invoiceService.finalizeInvoice(invoice.id);
        invoice = await this.invoiceModel.findByIdAndUpdate(
          invoice.id,
          {
            status: InvoiceStatus.PENDING,
          },
          { new: true }
        );
        await this.invoiceService.attemptAutoPayment(invoice);
      }

      await this.invoiceScheduleModel.findByIdAndUpdate(existingActiveSchedules._id, {
        nextInvoiceIssueDate: existingActiveSchedules.issueDate,
        nextReminderDate: dayjs(existingActiveSchedules.issueDate)
          .subtract(existingActiveSchedules.reminderDays, 'days')
          .toDate(),
      });

      return { invoiceSchedule: existingActiveSchedules, invoice };
    } else if (existingDraft) {
      existingActiveSchedules = await this.invoiceScheduleModel.findByIdAndUpdate(
        existingDraft._id,
        {
          ...invoiceScheduleData,
          status: InvoiceScheduleStatus.ACTIVE,
          nextInvoiceIssueDate: invoiceScheduleData.issueDate,
          nextReminderDate: dayjs(invoiceScheduleData.issueDate)
            .subtract(invoiceScheduleData.reminderDays, 'days')
            .toDate(),
        },
        { new: true }
      );
      // TODO: Make draft invoice active
      const draftInvoices = await this.invoiceModel.find({
        invoiceScheduleId: existingDraft._id,
        status: InvoiceStatus.DRAFT,
      });

      let invoice;
      for (const inv of draftInvoices) {
        invoice = inv;
        if (
          dayjs(existingActiveSchedules.issueDate)
            .tz('Asia/Kolkata')
            .startOf('day')
            .isSame(todayStartPST)
        ) {
          invoice = await this.invoiceModel.findByIdAndUpdate(
            invoice.id,
            {
              status: InvoiceStatus.PENDING,
              issuedAt: existingActiveSchedules.issueDate,
              dueAt: existingActiveSchedules.dueDate,
              nextAutoPaymentAttemptAt: existingActiveSchedules.issueDate,
            },
            { new: true }
          );
          invoice = await this.invoiceService.finalizeInvoice(inv.id);

          await this.invoiceService.attemptAutoPayment(invoice);
        } else {
          invoice = await this.invoiceModel.findByIdAndUpdate(
            invoice.id,
            {
              status: InvoiceStatus.ACTIVE,
              issuedAt: existingActiveSchedules.issueDate,
              dueAt: existingActiveSchedules.dueDate,
              nextAutoPaymentAttemptAt: existingActiveSchedules.issueDate,
            },
            { new: true }
          );
        }
      }

      return { invoiceSchedule: existingActiveSchedules, invoice };
    } else {
      existingActiveSchedules = await this.invoiceScheduleModel.create(invoiceScheduleData);
      // TODO: Create active invoice
      let invoice = await this.invoiceService.createInvoiceFromSchedule(
        existingActiveSchedules,
        existingActiveSchedules.issueDate,
        existingActiveSchedules.dueDate,
        existingActiveSchedules.paymentMethodId.toString(),
        InvoiceStatus.ACTIVE
      );

      if (
        dayjs(existingActiveSchedules.issueDate)
          .tz('Asia/Kolkata')
          .startOf('day')
          .isSame(todayStartPST)
      ) {
        invoice = await this.invoiceService.finalizeInvoice(invoice.id);
        invoice = await this.invoiceModel.findByIdAndUpdate(
          invoice.id,
          {
            status: InvoiceStatus.PENDING,
          },
          { new: true }
        );
        await this.invoiceService.attemptAutoPayment(invoice);
      }

      await this.invoiceScheduleModel.findByIdAndUpdate(existingActiveSchedules._id, {
        nextInvoiceIssueDate: existingActiveSchedules.issueDate,
        nextReminderDate: dayjs(existingActiveSchedules.issueDate)
          .subtract(existingActiveSchedules.reminderDays, 'days')
          .toDate(),
      });

      return { invoiceSchedule: existingActiveSchedules, invoice };
    }
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

  async updateInvoiceSchedulePaymentMethod(id: string, paymentMethodId: string) {
    const invoiceSchedule = await this.invoiceScheduleModel.findById(id);
    if (!invoiceSchedule) {
      throw new NotFoundException('Invoice schedule not found');
    }

    // Verify the payment method exists and belongs to the developer
    const paymentMethod = await this.paymentMethodModel.findOne({
      _id: paymentMethodId,
      customerId: invoiceSchedule.developerId,
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    // Update the invoice schedule with the new payment method
    const updatedInvoiceSchedule = await this.invoiceScheduleModel.findByIdAndUpdate(
      id,
      { paymentMethodId: new Types.ObjectId(paymentMethodId) },
      { new: true }
    );

    // Update paymentMethodId on any pending or draft invoices related to the updated invoice schedule
    const invoices = await this.invoiceModel.find({
      invoiceScheduleId: id,
      status: { $in: [InvoiceStatus.ACTIVE, InvoiceStatus.DRAFT, InvoiceStatus.PENDING] },
    });

    for (const invoice of invoices) {
      await this.invoiceModel.findByIdAndUpdate(
        invoice.id,
        { paymentMethodId: paymentMethodId },
        { new: true }
      );
    }

    return updatedInvoiceSchedule;
  }
}
