export enum CustomerSupportSource {
  HOME = 'home',
  CONTACT_US = 'contact us',
  SUGGEST_FEATURE = 'suggest a feature',
  SUGGESTION = 'suggestion',
  REPORT_ERROR = 'report an error',
  WELCOME_FLOW = 'welcome-flow',
  DEV_BESPOKE_REQUEST = 'dev-bespoke-request',
  GUEST_APPLY_FOR_RANKING = 'guest-apply-for-ranking',
  GUEST_UPLOAD_INVENTORY = 'guest-upload-inventory',
  GUEST_REQUEST_PREMIUM_PROFILE = 'guest-request-premium-profile',
  GUEST_REQUEST_A_VISIT = 'guest-request-a-visit',
  MARKETING_SOLUTION_CONTACT_US = 'marketing-solution-contact-us',
}

export enum CustomerSupportStatus {
  NEW = 'new',
  AWAITING = 'awaiting',
  OPEN = 'open',
  SOLVED = 'solved',
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum Role {
  SELLER = 'seller',
  BUYER = 'buyer',
  VISITOR = 'visitor',
}
