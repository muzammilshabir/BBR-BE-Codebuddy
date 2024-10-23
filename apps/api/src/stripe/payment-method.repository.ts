import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { PaymentMethod } from './schema/payment-method.schema';

@Injectable()
export class PaymentMethodRepository extends BaseRepository<PaymentMethod> {
  constructor(@InjectModel(PaymentMethod.name) private readonly paymentMethodModel: Model<PaymentMethod>) {
    super(paymentMethodModel);
  }

  async findByCustomerId(customerId: string): Promise<PaymentMethod[]> {
    return (await this.findAll({ customerId })).data;
  }

  async findByStripePaymentMethodId(paymentMethodId: string): Promise<PaymentMethod> {
    return (await this.find({ paymentMethodId }));
  }

  async deleteByPaymentMethodId(paymentMethodId: string): Promise<PaymentMethod> {
    const method = await this.find({ paymentMethodId });
    return this.update(method.id, { isDeleted: true });
  }
}
