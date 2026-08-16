export const REGION_VALUES = [
  "EU / EEA",
  "United Kingdom",
  "South Africa",
  "Other",
  "Not yet known",
] as const;

export const SECTOR_VALUES = [
  "HR and recruitment",
  "Financial services",
  "Healthcare",
  "Public sector and social protection",
  "Education and vocational training",
  "Other",
  "Not yet known",
] as const;

export const ROLE_VALUES = [
  "Deployer",
  "Provider",
  "Both",
  "Adviser or consultant",
  "Not yet known",
] as const;

export const DOCUMENTATION_VALUES = [
  "None",
  "Partial",
  "Substantial",
  "Not yet known",
] as const;

export type Region = (typeof REGION_VALUES)[number];
export type Sector = (typeof SECTOR_VALUES)[number];
export type RegulatoryRole = (typeof ROLE_VALUES)[number];
export type ExistingDocumentation = (typeof DOCUMENTATION_VALUES)[number];

export type EnquiryInput = {
  enquiryReference: string;
  name: string;
  email: string;
  organisation: string;
  region: Region;
  sector: Sector;
  role: RegulatoryRole;
  systemProcess: string;
  decisionOutcome: string;
  concern: string;
  existingDocumentation: ExistingDocumentation;
  phone: string;
  preferredContact: string;
  consent: boolean;
  website: string;
};

export type EnquiryValidationResult =
  | { ok: true; data: EnquiryInput }
  | { ok: false; errors: Record<string, string> };
