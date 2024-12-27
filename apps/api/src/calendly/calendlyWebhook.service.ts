import { Injectable } from '@nestjs/common';
import { CustomerSupportService } from '../customer-support/customer-support.service';
import { CALENDLY_MESSAGE_TEMPLATES } from '../customer-support/customer-support.constant';
import { CalendlyDetails, LocationDetails } from 'src/customer-support/type/customer-support.type';
import { CustomerSupportSource } from 'src/customer-support/enum/customer-support-enum';

interface CalendlyWebhookPayload {
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  cancel_url: string;
  reschedule_url: string;
  tracking: {
    utm_term?: string;
    utm_event?: string;
    utm_source?: string;
  };
  scheduled_event: {
    start_time: string;
    name: string;
    location: LocationDetails;
  };
}

@Injectable()
export class CalendlyWebhookService {
  constructor(private readonly customerSupportService: CustomerSupportService) {}

  private mapCalendlyDetails(payload: CalendlyWebhookPayload): CalendlyDetails {
    return {
      createdAt: new Date(payload.created_at),
      meetingStart: new Date(payload.scheduled_event.start_time),
      meetingName: payload.scheduled_event.name,
      location: {
        location: payload.scheduled_event.location?.location ?? '',
        type: payload.scheduled_event.location?.type ?? '',
      },
      cancelUrl: payload.cancel_url,
      rescheduleUrl: payload.reschedule_url,
    };
  }

  private formatMessageFromTemplate(
    template: string,
    payload: CalendlyWebhookPayload,
    calendlyDetails: CalendlyDetails
  ): string {
    const replacements = {
      '{{email}}': payload.email,
      '{{date}}': new Date(payload.created_at).toLocaleDateString(),
      '{{meetingName}}': calendlyDetails.meetingName || 'Meeting',
      '{{meetingStart}}': calendlyDetails.meetingStart.toLocaleString(),
      '{{locationType}}': calendlyDetails.location.type,
      '{{locationUrl}}': calendlyDetails.location.location,
      '{{rescheduleUrl}}': calendlyDetails.rescheduleUrl || 'Not available',
      '{{cancelUrl}}': calendlyDetails.cancelUrl || 'Not available',
    };

    return Object.entries(replacements).reduce(
      (message, [key, value]) => message.replace(key, value),
      template
    );
  }

  async handleWebhook(body: { payload: CalendlyWebhookPayload }) {
    try {
      const { payload } = body;
      const calendlyDetails: CalendlyDetails = this.mapCalendlyDetails(payload);

      const customerSupport = await this.customerSupportService.getCustomerSupport(
        payload.tracking?.utm_term
      );

      if (customerSupport) {
        return await this.customerSupportService.updateCustomerSupport(customerSupport.id, {
          calendlyDetails,
          ...(payload.tracking?.utm_source
            ? {
                source: payload.tracking?.utm_source as CustomerSupportSource,
              }
            : {}),
        });
      }

      const messageTemplate = CALENDLY_MESSAGE_TEMPLATES[payload.tracking?.utm_source];
      const formattedMessage = this.formatMessageFromTemplate(
        messageTemplate,
        payload,
        calendlyDetails
      );

      return await this.customerSupportService.create({
        name: `${payload.first_name ?? ''} ${payload.last_name ?? ''}`.trim(),
        email: payload.email,
        calendlyDetails,
        message: formattedMessage,
        ...(payload.tracking?.utm_source
          ? {
              source: payload.tracking?.utm_source as CustomerSupportSource,
            }
          : {}),
      });
    } catch (error) {
      // Log the error and rethrow or handle appropriately
      console.error('Error processing Calendly webhook:', error);
      throw error;
    }
  }
}
