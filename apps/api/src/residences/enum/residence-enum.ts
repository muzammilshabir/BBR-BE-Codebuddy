export enum ResidenceStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  DRAFT = 'draft',
  SOLD = 'sold',
  REJECTED = 'rejected',
  PENDINGIMAGEAPPROVAL = 'Pending Image Approval', //TODO: apply camel case
  INACTIVE = 'inactive',
  BILLINGISSUE = 'Billing Issue',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum FileType {
  EXCEL = 'excel',
  CSV = 'csv',
}

export enum RentalPotential {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum DevelopmentStatus {
  Completed = 'Completed',
  UnderConstruction = 'Under Construction',
  Planned = 'Planned',
}

export enum PetPolicy {
  PetFriendly = 'petFriendly',
  NoPetAllowed = 'No pet Allowed',
}
