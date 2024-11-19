export interface ISendEmailEvent {
  context: {
    [key: string]: any;
  };
  subject: string;
  // These are the (.hbs) filenames in the templates folder
  template: Template;
  toEmail: string;
}

type Template =
  | 'verify-user'
  | 'forgot-password'
  | 'reset-password'
  | 'low-star-review'
  | 'request-review'
  | 'customer-request-review'
  | 'review-response'
  | 'review-weekly-summary'
  | 'specific-words-review'
  | 'hundred-five-star-reviews'
  | 'job-application'
  | 'invoice';

export class SendEmailEvent {
  static event = 'send-email';

  context: ISendEmailEvent['context'];
  template: string;
  subject: string;
  to: string;
  constructor(public readonly data: ISendEmailEvent) {
    this.context = data.context;
    this.template = data.template;
    this.subject = data.subject;
    this.to = data.toEmail;
  }
}
