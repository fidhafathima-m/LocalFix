import {
  AvailabilityPreferencesUpdate,
  BankPaymentUpdate,
  IdentityVerificationUpdate,
  PersonalInfoUpdate,
  SecuritySettingsUpdate,
  SkillsServicesUpdate,
} from "../../../interfaces/technician/ITechnicianProfile";

export interface ITechnicianProfileService {
  getTechnicianProfile(technicianId: string): Promise<any>;
  updatePersonalInformation(
    technicianId: string,
    updateData: PersonalInfoUpdate
  ): Promise<any>;
  updateIdentityVerification(
    technicianId: string,
    updateData: IdentityVerificationUpdate
  ): Promise<any>;
  updateSkillsServices(
    technicianId: string,
    updateData: SkillsServicesUpdate
  ): Promise<any>;
  updateAvailabilityPreferences(
    technicianId: string,
    updateData: AvailabilityPreferencesUpdate
  ): Promise<any>;
  updateBankPaymentDetails(
    technicianId: string,
    updateData: BankPaymentUpdate
  ): Promise<any>;
  updatePassword(
    technicianId: string,
    updateData: SecuritySettingsUpdate
  ): Promise<any>;
  uploadDocument(
    technicianId: string,
    documentData: {
      type: string;
      fileUrl: string;
      fileName: string;
    }
  ): Promise<any>;
}
