import { Injectable } from '@nestjs/common';

@Injectable()
export class CalendlyWebhookService {
  async handleWebhook(body: any) {
    console.log(body);
    /**
     * {
  created_at: '2024-11-29T06:45:31.000000Z',
  created_by: 'https://api.calendly.com/users/5ea70de7-a8e9-4d63-8d4c-3a627ee66e0a',
  event: 'invitee.created',
  payload: {
    cancel_url: 'https://calendly.com/cancellations/4418f972-012e-4a84-bd5f-05a99f1956ac',
    created_at: '2024-11-29T06:45:30.944163Z',
    email: 'john.doe@example.com',
    event: 'https://api.calendly.com/scheduled_events/c312b26d-f0ea-47f2-a561-44a8713393af',
    first_name: null,
    invitee_scheduled_by: null,
    last_name: null,
    name: 'John Doe',
    new_invitee: null,
    no_show: null,
    old_invitee: null,
    payment: null,
    questions_and_answers: [ [Object] ],
    reconfirmation: null,
    reschedule_url: 'https://calendly.com/reschedulings/4418f972-012e-4a84-bd5f-05a99f1956ac',
    rescheduled: false,
    routing_form_submission: null,
    scheduled_event: {
      created_at: '2024-11-29T06:45:30.932792Z',
      end_time: '2024-12-02T05:30:00.000000Z',
      event_guests: [],
      event_memberships: [Array],
      event_type: 'https://api.calendly.com/event_types/d966a029-f65d-422d-8655-1f2ded1fe9f3',
      invitees_counter: [Object],
      location: [Object],
      meeting_notes_html: null,
      meeting_notes_plain: null,
      name: '30 Minute Meeting',
      start_time: '2024-12-02T05:00:00.000000Z',
      status: 'active',
      updated_at: '2024-11-29T06:45:30.932792Z',
      uri: 'https://api.calendly.com/scheduled_events/c312b26d-f0ea-47f2-a561-44a8713393af'
    },
    scheduling_method: null,
    status: 'active',
    text_reminder_number: null,
    timezone: 'Asia/Calcutta',
    tracking: {
      utm_campaign: 'meeting',
      utm_source: 'website',
      utm_medium: 'button',
      utm_content: null,
      utm_term: null,
      salesforce_uuid: null
    },
    updated_at: '2024-11-29T06:45:30.944163Z',
    uri: 'https://api.calendly.com/scheduled_events/c312b26d-f0ea-47f2-a561-44a8713393af/invitees/4418f972-012e-4a84-bd5f-05a99f1956ac'
  }
}
     */
  }
}
