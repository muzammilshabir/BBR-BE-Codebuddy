import { Injectable } from '@nestjs/common';
import { NewsletterRepository } from './newsletter.repository';
import { UserService } from 'src/users/user.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { Newsletter } from './schema/newsletter.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class NewsletterService {

  constructor(
    @InjectModel(Newsletter.name) private readonly newsletterModel: Model<Newsletter>,
    private readonly newsletterRepository: NewsletterRepository,
    private readonly userService: UserService,
    private readonly stripeService: StripeService,
  ) {}


  async subscribe(subscribeNewsletterDto: SubscribeNewsletterDto): Promise<Newsletter> {
    const transformedDto: Partial<Newsletter> = {
      ...subscribeNewsletterDto,
    };
    const existingUser = await this.userService.findByEmail(subscribeNewsletterDto.email);
    if(existingUser) {
      transformedDto.user = existingUser;
    }
    return this.newsletterRepository.create(transformedDto);
  }


  async findByEmail(email: string): Promise<Newsletter> {
    return this.newsletterModel.findOne({ email }).exec();
  }

  async unsubscribe(subscribeNewsletterDto: SubscribeNewsletterDto): Promise<Newsletter> {
    const existingNewsletter = await this.findByEmail(subscribeNewsletterDto.email);
    
    const updatedValues: Partial<Newsletter> = {
      isSubscribed: false,
    };
    return this.newsletterRepository.update(existingNewsletter._id.toString(), updatedValues);
  }

  async test() {
    // return this.stripeService.createCustomerPortalSession('cus_QsSNvVD3YP5PFJ');
    return this.stripeService.createSubscriptionInvoice(
      'cus_QsSNvVD3YP5PFJ',
      [{
        price_data: {
          currency: 'usd',
          product_data: {
            description: "Recurring - BBR  Listing For XYZ Heights",
            name: "My dD",
            metadata: {
              type: 'listing',
              id: '',
            },
          },
          unit_amount: 3000,
          recurring: {
            interval: 'month',
            interval_count: 1,
          }
        },
        quantity: 1,
      }],
    );
  }

}
