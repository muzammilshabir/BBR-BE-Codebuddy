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
}
