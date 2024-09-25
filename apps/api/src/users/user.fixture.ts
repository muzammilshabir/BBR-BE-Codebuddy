import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { UserRole } from './enum/user.enum';

@Injectable()
export class UserFixture extends AbstractFixture {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super();
  }

  name = UserFixture.name;
  static ADMIN_1 = 'ADMIN_1';
  static BUYER_1 = 'BUYER_1';
  static SELLER_1 = 'SELLER_1';

  async load(): Promise<any> {
    const admin = await this.userModel.create({
      "fullName": "John Doe",
      "email": "admin@example.com", // Pass@123
      "password": "$argon2id$v=19$m=65536,t=3,p=4$QiRS4qSqhpbgc5q4uhYXUg$NJlHEywrmqZynmGryrKyIKboIeGr+nKpfRrRGxMJIMc",
      "isVerified": true,
      "signupMethod": "EMAIL",
      "role": UserRole.ADMIN,
      "verificationToken": "O13WYsGtubjc",
      "emailVerified": true,
      "corporateEmail": "admin@example.com",
      "agreeToTerms": true,
      "receiveLuxuryInsights": true,
      "acceptBBRCommitment": true,
      "hundredFiveStarReviews": false,
      "reviewWordsForAlert": [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const seller = await this.userModel.create({
      "fullName": "John Doe",
      "email": "seller@example.com", // Pass@123
      "password": "$argon2id$v=19$m=65536,t=3,p=4$QiRS4qSqhpbgc5q4uhYXUg$NJlHEywrmqZynmGryrKyIKboIeGr+nKpfRrRGxMJIMc",
      "isVerified": true,
      "signupMethod": "EMAIL",
      "role": UserRole.SELLER,
      "verificationToken": "O13WYsGtubjc",
      "emailVerified": true,
      "corporateEmail": "seller@example.com",
      "agreeToTerms": true,
      "receiveLuxuryInsights": true,
      "acceptBBRCommitment": true,
      "hundredFiveStarReviews": false,
      "reviewWordsForAlert": [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const buyer = await this.userModel.create({
      "fullName": "John Doe",
      "email": "buyer@example.com", // Pass@123
      "password": "$argon2id$v=19$m=65536,t=3,p=4$QiRS4qSqhpbgc5q4uhYXUg$NJlHEywrmqZynmGryrKyIKboIeGr+nKpfRrRGxMJIMc",
      "isVerified": true,
      "signupMethod": "EMAIL",
      "role": UserRole.BUYER,
      "verificationToken": "O13WYsGtubjc",
      "emailVerified": true,
      "agreeToTerms": true,
      "receiveLuxuryInsights": true,
      "acceptBBRCommitment": true,
      "hundredFiveStarReviews": false,
      "reviewWordsForAlert": [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.addReference(UserFixture.ADMIN_1, admin);
    this.addReference(UserFixture.SELLER_1, seller);
    this.addReference(UserFixture.BUYER_1, buyer);

    return await this.userModel.find();
  }
}
