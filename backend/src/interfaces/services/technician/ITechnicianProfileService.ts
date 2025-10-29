import {
  TechnicianProfileResponseDto,
  StaticDataResponseDto,
  PersonalInfoUpdateDto,
  IdentityVerificationUpdateDto,
  SkillsServicesUpdateDto,
  AvailabilityPreferencesUpdateDto,
  BankPaymentUpdateDto,
  SecuritySettingsUpdateDto,
  DocumentUploadDto,
} from "../../dtos/technicianProfileDtos";

export interface ITechnicianProfileService {
  getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponseDto>;
  updatePersonalInformation(
    technicianId: string,
    updateData: PersonalInfoUpdateDto
  ): Promise<TechnicianProfileResponseDto>;
  updateIdentityVerification(
    technicianId: string,
    updateData: IdentityVerificationUpdateDto
  ): Promise<TechnicianProfileResponseDto>;
  updateSkillsServices(
    technicianId: string,
    updateData: SkillsServicesUpdateDto
  ): Promise<TechnicianProfileResponseDto>;
  updateAvailabilityPreferences(
    technicianId: string,
    updateData: AvailabilityPreferencesUpdateDto
  ): Promise<TechnicianProfileResponseDto>;
  updateBankPaymentDetails(
    technicianId: string,
    updateData: BankPaymentUpdateDto
  ): Promise<TechnicianProfileResponseDto>;
  updatePassword(
    technicianId: string,
    updateData: SecuritySettingsUpdateDto
  ): Promise<TechnicianProfileResponseDto>;

  uploadDocument(
    technicianId: string,
    documentData: DocumentUploadDto | Express.Multer.File,
    documentType?: string
  ): Promise<TechnicianProfileResponseDto>;
  getStaticData(): Promise<StaticDataResponseDto>;
  uploadPhoto(
    technicianId: string,
    file: Express.Multer.File
  ): Promise<TechnicianProfileResponseDto>;
}
