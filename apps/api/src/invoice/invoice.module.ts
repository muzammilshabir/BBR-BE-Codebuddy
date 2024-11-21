import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from 'src/stripe/schema/invoice.schema';
import { InvoiceItem, InvoiceItemSchema } from 'src/stripe/schema/invoice-item.schema';
import {
  InvoicePostPaymentAction,
  InvoicePostPaymentActionSchema,
} from 'src/stripe/schema/invoice-post-payment-action.schema';
import { InvoicePostPaymentActionService } from './invoice-post-payment-action.service';

@Module({
  imports: [
    StripeModule,
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    MongooseModule.forFeature([{ name: InvoiceItem.name, schema: InvoiceItemSchema }]),
    MongooseModule.forFeature([
      {
        name: InvoicePostPaymentAction.name,
        schema: InvoicePostPaymentActionSchema,
      },
    ]),
  ],
  providers: [InvoiceService, InvoicePostPaymentActionService],
  exports: [InvoiceService, InvoicePostPaymentActionService],
})
export class InvoiceModule {}
