import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InvoicePostPaymentAction,
  InvoicePostPaymentActionType,
  ResidenceDetails,
  UserDetails,
} from 'src/stripe/schema/invoice-post-payment-action.schema';

@Injectable()
export class InvoicePostPaymentActionService {
  constructor(
    @InjectModel(InvoicePostPaymentAction.name)
    private invoicePostPaymentActionModel: Model<InvoicePostPaymentAction>
  ) {}

  async create(
    invoiceId: string,
    type: InvoicePostPaymentActionType,
    data: UserDetails | ResidenceDetails
  ) {
    return this.invoicePostPaymentActionModel.create({
      invoiceId,
      type,
      data,
    });
  }
}
