import { ITechnician } from "@/types/technicianApplicationTypes";
import {
  AvailabilityPreferencesUpdate,
  BankPaymentUpdate,
  IdentityVerificationUpdate,
  PersonalInfoUpdate,
  SecuritySettingsUpdate,
  SkillsServicesUpdate,
} from "../../../interfaces/technician/ITechnicianProfile";

export interface ITechnicianProfileService {
  getTechnicianProfile(technicianId: string): Promise<ITechnician>;
  updatePersonalInformation(
    technicianId: string,
    updateData: PersonalInfoUpdate
  ): Promise<ITechnician>;
  updateIdentityVerification(
    technicianId: string,
    updateData: IdentityVerificationUpdate
  ): Promise<ITechnician>;
  updateSkillsServices(
    technicianId: string,
    updateData: SkillsServicesUpdate
  ): Promise<ITechnician>;
  updateAvailabilityPreferences(
    technicianId: string,
    updateData: AvailabilityPreferencesUpdate
  ): Promise<ITechnician>;
  updateBankPaymentDetails(
    technicianId: string,
    updateData: BankPaymentUpdate
  ): Promise<ITechnician>;
  updatePassword(
    technicianId: string,
    updateData: SecuritySettingsUpdate
  ): Promise<ITechnician>;
  uploadDocument(
    technicianId: string,
    documentData: {
      type: string;
      fileUrl: string;
      fileName: string;
    }
  ): Promise<ITechnician>;
}
