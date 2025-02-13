import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import { MessageSchedule } from './schema/message-schedule.schema';
import { CreateMessageScheduleDto } from './dto/create-message-schedule.dto';
import { ServiceConfig } from '../config';
import { CometChatService } from 'src/users/comet-chat.service';

dayjs.extend(timezone);

@Injectable()
export class MessageScheduleService {
  constructor(
    @InjectModel(MessageSchedule.name)
    private messageScheduleModel: Model<MessageSchedule>,
    private readonly config: ServiceConfig,
    private readonly cometChatService: CometChatService
  ) {}

  async create(createMessageScheduleDto: CreateMessageScheduleDto) {
    const { date, time } = createMessageScheduleDto;
    const utcDate = dayjs
      .tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', this.config.timezone.timezone)
      .utc()
      .toISOString();

    const messageSchedule = await this.messageScheduleModel.create({
      ...createMessageScheduleDto,
      datetime: utcDate,
    });
    return messageSchedule;
  }

  @Cron('* * * * *')
  async handleScheduledMessages() {
    const now = dayjs().startOf('minute').toISOString();
    const nowPlusOneMinute = dayjs().startOf('minute').add(1, 'minute').toISOString();

    const scheduledMessages = await this.messageScheduleModel.find({
      datetime: { $lte: nowPlusOneMinute, $gte: now },
      isSent: false,
      isDeleted: false,
    });

    for (const message of scheduledMessages) {
      try {
        // TODO: Implement your message sending logic here
        await this.cometChatService.sendMessage({
          senderId: message.senderId,
          receiverId: message.receiverId,
          message: message.messageText,
          receiverType: message.receiverType,
        });

        await this.messageScheduleModel.findByIdAndUpdate(message._id, {
          isSent: true,
        });
      } catch (error) {
        console.error(`Failed to send scheduled message ${message._id}:`, error);
      }
    }
  }
}
