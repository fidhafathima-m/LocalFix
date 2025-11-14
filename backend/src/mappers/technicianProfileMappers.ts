import { Types } from "mongoose";
import {
  TechnicianProfileDto,
  PersonalInfoDto,
  IdentityVerificationDto,
  SkillsServicesDto,
  AvailabilityPreferencesDto,
  BankPaymentDetailsDto,
  DocumentDataDto,
  SecuritySettingsDto,
  StaticDataDto,
} from "../interfaces/dtos/technicianProfileDtos";
import { ITechnician } from "../interfaces/technician/ITechnician";
import { IUser } from "../interfaces/user/IUser";
import {
  PERSONAL_INFO_DEFAULTS,
  SKILLS_DEFAULTS,
  AVAILABILITY_DEFAULTS,
  PAYMENT_DEFAULTS,
  VERIFICATION_STATUS,
  DOCUMENT_STATUS,
  SECURITY_SETTINGS_DEFAULTS,
} from "../constants";

export const toTechnicianProfileDto = (
  technician: ITechnician,
  user: IUser
): TechnicianProfileDto => {
  const bankPaymentDetails = _mapBankPaymentDetails(technician);

  const mappedDocuments = _mapDocuments(technician);

  const result = {
    _id: technician._id?.toString() || "",
    userId: technician.userId?.toString() || "",
    displayName: technician.displayName || "",
    email: user.email || "",
    phone: user.phone || technician.phone || "",
    profilePictureUrl:
      technician.profilePictureUrl ||
      PERSONAL_INFO_DEFAULTS.PROFILE_PICTURE_URL,
    bio: technician.bio || PERSONAL_INFO_DEFAULTS.BIO,
    services: technician.services || SKILLS_DEFAULTS.SERVICES,
    workAreas: technician.workAreas || [],
    serviceRadiusKm:
      technician.serviceRadiusKm || AVAILABILITY_DEFAULTS.WORK_RADIUS,
    status: technician.status || "",
    averageRating: technician.averageRating,
    ratingCount: technician.ratingCount,
    totalJobs: technician.totalJobs,
    completedJobs: technician.completedJobs,
    ongoingJobs: technician.ongoingJobs,
    totalEarnings: technician.totalEarnings,
    experienceYears:
      technician.experienceYears || SKILLS_DEFAULTS.EXPERIENCE_YEARS,
    createdAt: technician.createdAt || new Date(),
    updatedAt: technician.updatedAt || new Date(),

    paymentDetails: {
      bankAccount: bankPaymentDetails.bankAccount,
      upiId: bankPaymentDetails.upiId,
      withdrawalPreference: bankPaymentDetails.withdrawalPreference,
    },

    personalInfo: _mapPersonalInfo(technician, user),
    identityVerification: _mapIdentityVerification(technician),
    skillsServices: _mapSkillsServices(technician),
    availabilityPreferences: _mapAvailabilityPreferences(technician),
    documents: mappedDocuments,
    securitySettings: _mapSecuritySettings(user),
  };

  return result;
};
// Map to static data DTO
export const toStaticDataDto = (): StaticDataDto => {
  return {
    languages: [
      { value: "english", label: "English" },
      { value: "spanish", label: "Spanish" },
      { value: "french", label: "French" },
      { value: "german", label: "German" },
      { value: "hindi", label: "Hindi" },
    ],
    genders: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
      { value: "prefer-not-to-say", label: "Prefer not to say" },
    ],
    idTypes: [
      { value: "passport", label: "Passport" },
      { value: "driver_license", label: "Driver's License" },
      { value: "national_id", label: "National ID" },
      { value: "aadhaar", label: "Aadhaar Card" },
    ],
    services: [
      { value: "ac-repair", label: "AC Repair", basePrice: 499 },
      {
        value: "washing-machine",
        label: "Washing Machine Repair",
        basePrice: 399,
      },
      { value: "refrigerator", label: "Refrigerator Repair", basePrice: 599 },
      { value: "fan-repair", label: "Fan Repair", basePrice: 299 },
      { value: "tv-repair", label: "TV Repair", basePrice: 699 },
    ],
    serviceAreas: [
      { value: "sector-1", label: "Sector 1" },
      { value: "sector-2", label: "Sector 2" },
      { value: "sector-3", label: "Sector 3" },
      { value: "sector-4", label: "Sector 4" },
    ],
    documentTypes: [
      { value: "id_proof", label: "ID Proof" },
      { value: "address_proof", label: "Address Proof" },
      { value: "police_verification", label: "Police Verification" },
      { value: "certificate", label: "Professional Certificate" },
    ],
    verificationStatuses: [
      { value: "pending", label: "Pending", color: "yellow" },
      { value: "approved", label: "Approved", color: "green" },
      { value: "rejected", label: "Rejected", color: "red" },
      { value: "needs_reupload", label: "Needs Re-upload", color: "orange" },
    ],
    withdrawalPreferences: [
      { value: "auto", label: "Automatic weekly withdrawal" },
      { value: "manual", label: "Manual withdrawal request" },
    ],
    daysOfWeek: [
      { value: "monday", label: "Monday" },
      { value: "tuesday", label: "Tuesday" },
      { value: "wednesday", label: "Wednesday" },
      { value: "thursday", label: "Thursday" },
      { value: "friday", label: "Friday" },
      { value: "saturday", label: "Saturday" },
      { value: "sunday", label: "Sunday" },
    ],
  };
};

const _mapPersonalInfo = (
  technician: ITechnician,
  user: IUser
): PersonalInfoDto => {
  return {
    fullName:
      technician.personalInfo?.fullName ||
      technician.displayName ||
      PERSONAL_INFO_DEFAULTS.FULL_NAME,
    phoneNumber:
      technician.personalInfo?.phoneNumber ||
      technician.phone ||
      PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
    email: user.email || "",
    dateOfBirth:
      technician.personalInfo?.dateOfBirth ||
      PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
    gender: technician.personalInfo?.gender || PERSONAL_INFO_DEFAULTS.GENDER,
    languages: Array.isArray(technician.personalInfo?.languages)
      ? technician.personalInfo.languages
      : PERSONAL_INFO_DEFAULTS.LANGUAGES,
    bio: technician.bio || PERSONAL_INFO_DEFAULTS.BIO,
    profilePictureUrl:
      technician.profilePictureUrl ||
      PERSONAL_INFO_DEFAULTS.PROFILE_PICTURE_URL,
    address: technician.personalInfo?.address || {
      street: "Not specified",
      city: "Not specified",
      state: "Not specified",
      pincode: "Not specified",
      landmark: "Not specified",
    },
  };
};

const _mapIdentityVerification = (
  technician: ITechnician
): IdentityVerificationDto => {
  return {
    verificationStatus:
      technician.identityVerification?.verificationStatus ||
      VERIFICATION_STATUS.PENDING,
    governmentIdType: technician.identityVerification?.idType,
    governmentIdNumber: technician.identityVerification?.idNumber,
    idDocument: technician.identityVerification?.idDocument,
  };
};

const _mapSkillsServices = (technician: ITechnician): SkillsServicesDto => {
  return {
    services: technician.services || SKILLS_DEFAULTS.SERVICES,
    experienceYears:
      technician.experienceYears || SKILLS_DEFAULTS.EXPERIENCE_YEARS,
    basePrices: technician.basePrices || SKILLS_DEFAULTS.BASE_PRICES,
  };
};

const _mapAvailabilityPreferences = (
  technician: ITechnician
): AvailabilityPreferencesDto => {
  return {
    isAvailable:
      technician.availability?.isAvailable ??
      AVAILABILITY_DEFAULTS.IS_AVAILABLE,
    serviceAreas: technician.workAreas || [],
    workRadius: technician.serviceRadiusKm || AVAILABILITY_DEFAULTS.WORK_RADIUS,
    weeklyPattern: technician.availability?.weeklyPattern,
  };
};

const _mapBankPaymentDetails = (
  technician: ITechnician
): BankPaymentDetailsDto => {
  if (technician.paymentDetails) {
    return {
      bankAccount: {
        holderName:
          technician.paymentDetails.bankAccount?.holderName ||
          PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
        accountNumber:
          technician.paymentDetails.bankAccount?.accountNumber ||
          PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
        ifscCode:
          technician.paymentDetails.bankAccount?.ifscCode ||
          PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
        bankName:
          technician.paymentDetails.bankAccount?.bankName ||
          PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME,
      },
      upiId: technician.paymentDetails.upiId || PAYMENT_DEFAULTS.UPI_ID,
      withdrawalPreference:
        technician.paymentDetails.withdrawalPreference ||
        PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE,
    };
  }

  return {
    bankAccount: {
      holderName: PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
      accountNumber: PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
      ifscCode: PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
      bankName: PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME,
    },
    upiId: PAYMENT_DEFAULTS.UPI_ID,
    withdrawalPreference: PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE,
  };
};
const _mapDocuments = (technician: ITechnician): DocumentDataDto[] => {
  const documents = technician.documents || [];

  if (!Array.isArray(documents)) {
    return [];
  }

  const mappedDocuments = documents.map((doc: any) => {
    const mappedDoc = {
      _id: doc._id?.toString() || new Types.ObjectId().toString(),
      type: doc.type || "",
      fileName: doc.fileName || "",
      url: doc.url || "",
      uploadedAt: doc.uploadedAt || new Date(),
      verified: doc.verified || false,
      status: doc.status || DOCUMENT_STATUS.PENDING,
      verifiedAt: doc.verifiedAt,
    };

    return mappedDoc;
  });

  return mappedDocuments;
};

const _mapSecuritySettings = (user: IUser): SecuritySettingsDto => {
  return {
    lastLogin: user.lastLogin || SECURITY_SETTINGS_DEFAULTS.LAST_LOGIN,
    loginDevice: user.loginDevice || SECURITY_SETTINGS_DEFAULTS.LOGIN_DEVICE,
  };
};
