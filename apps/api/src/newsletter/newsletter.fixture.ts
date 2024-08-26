import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { Newsletter } from './schema/newsletter.schema';

@Injectable()
export class NewsletterFixture extends AbstractFixture {
  public dependsOn = [
  ];

  constructor(@InjectModel(Newsletter.name) private readonly newsletterModel: Model<Newsletter>) {
    super();
  }
  name = NewsletterFixture.name;
  static Newsletter_1 = 'NEWSLETTER_1';
  async load() {
    // Create a new Newsletter document
    const newsletter1 = await this.newsletterModel.create({
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    });


    this.addReference(NewsletterFixture.Newsletter_1, newsletter1);
  }
}
