import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from 'src/stripe/schema/invoice.schema';
import { InvoiceItem, InvoiceItemSchema } from 'src/stripe/schema/invoice-item.schema';

@Module({
  imports: [
    StripeModule,
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    MongooseModule.forFeature([{ name: InvoiceItem.name, schema: InvoiceItemSchema }]),
  ],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
