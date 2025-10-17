export interface PersonalInfoUpdate {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  languages?: string[];
  bio?: string;
  profilePicture?: string;
}

export interface IdentityVerificationUpdate {
  governmentIdType?: string;
  governmentIdNumber?: string;
  idDocument?: string;
}

export interface SkillsServicesUpdate {
  services?: string[];
  experienceYears?: number;
  basePrices?: { [service: string]: number };
}

export interface AvailabilityPreferencesUpdate {
  isAvailable?: boolean;
  serviceAreas?: string[];
  workRadius?: number;
  weeklyAvailability?: {
    [day: string]: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  };
}

export interface BankPaymentUpdate {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  withdrawalPreference?: "auto" | "manual";
}

export interface SecuritySettingsUpdate {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}