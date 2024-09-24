import { Injectable } from '@nestjs/common';
import { NewsletterRepository } from './newsletter.repository';
import { UserService } from 'src/users/user.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { Newsletter } from './schema/newsletter.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class NewsletterService {

  constructor(
    @InjectModel(Newsletter.name) private readonly newsletterModel: Model<Newsletter>,
    private readonly newsletterRepository: NewsletterRepository,
    private readonly userService: UserService,
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

}
