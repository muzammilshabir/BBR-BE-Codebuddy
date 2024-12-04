import { Injectable } from '@nestjs/common';

@Injectable()
export class CalendlyWebhookService {
  async handleWebhook(body: any) {
    console.log(body);
  }
}
