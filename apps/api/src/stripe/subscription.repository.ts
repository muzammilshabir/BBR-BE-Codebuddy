import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { Subscription } from './schema/subscription.schema';
import { SubscriptionStatus } from './enum/subscription-status.enum';

@Injectable()
export class SubscriptionRepository extends BaseRepository<Subscription> {
  constructor(@InjectModel(Subscription.name) private readonly subscriptionModel: Model<Subscription>) {
    super(subscriptionModel);
  }

  async findByInvoiceId(invoiceId: string): Promise<Subscription> {
    return this.find({ invoiceId, status: SubscriptionStatus.ACTIVE });
  }

  async getSubscriptionResidencesByPlan(planId: string, options: any) {
    const aggregatePipeline = [
      {
        $lookup: {
          from: 'invoiceitems',
          localField: 'baseInvoiceId',
          foreignField: 'invoiceId',
          as: 'invoiceItems'
        }
      },
      {
        $match: {
          'invoiceItems': { $ne: [] },
          'invoiceItems.plan': { $eq: planId }
        }
      },
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residence'
        }
      },
      {
        $unwind: '$residence'
      },
      {
        $project: {
          invoiceItems: 0,
        }
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: options.offset }, { $limit: options.limit }]
        }
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$metadata.total", 0] }
        }
      }
    ];
    
    return this.subscriptionModel.aggregate(aggregatePipeline);
  }

  async getResidenceCountForPlans() {
    const aggregatePipeline = [
      {
        $lookup: {
          from: 'invoiceitems',
          localField: 'baseInvoiceId',
          foreignField: 'invoiceId',
          as: 'invoiceItems'
        }
      },
      {
        $unwind: '$invoiceItems'
      },
      {
        $match: {
          'invoiceItems.plan': { $ne: null },
          'isDeleted': false,
        }
      },
      {
        $group: {
          _id: '$invoiceItems.plan',
          residenceCount: { $addToSet: '$residenceId' }
        }
      },
      {
        $project: {
          plan: '$_id',
          residenceCount: { $size: '$residenceCount' },
          _id: 0
        }
      }
    ];
    
    return this.subscriptionModel.aggregate(aggregatePipeline);
  }

  async findByResidenceId(residenceId: string): Promise<Subscription[]> {
    return (await this.findAll({ residenceId })).data;
  }
}
