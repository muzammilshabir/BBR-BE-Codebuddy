import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginAttempt, LoginStatus } from './schema/loginAttempt.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class LoginAttemptRepository extends BaseRepository<LoginAttempt> {
  constructor(
    @InjectModel(LoginAttempt.name)
    private readonly loginAttemptModel: Model<LoginAttempt>
  ) {
    super(loginAttemptModel);
  }

  async createLoginAttempt(loggedInUserId: string | undefined, status: LoginStatus) {
    const data = await this.loginAttemptModel.create({
      loggedInUserId,
      status,
      createdAt: new Date(),
    });
    return data;
  }

  async getLatestLoginAttempt(userId: string) {
    const latestLoginAttempt = await this.loginAttemptModel.aggregate([
      {
        $match: {
          loggedInUserId: userId,
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by the most recent attempt
      { $limit: 1 }, // Limit to the latest attempt
    ]);

    return latestLoginAttempt[0] || null; // Return the latest attempt or null if not found
  }
}
