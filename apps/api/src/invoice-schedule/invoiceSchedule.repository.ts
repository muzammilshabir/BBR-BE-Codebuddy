import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoiceSchedule } from './invoiceSchedule.schema';

@Injectable()
export class InvoiceScheduleRepository {
  constructor(
    @InjectModel(InvoiceSchedule.name)
    private readonly invoiceScheduleModel: Model<InvoiceSchedule>
  ) {}
}
