// Base DTO interfaces
export interface BaseResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
}

// Request DTOs
export interface StartApplicationRequestDto {
  email: string;
  userId: string;
}

export interface SaveStepRequestDto {
  applicationId: string;
  step: string;
  [key: string]: any;
}

export interface SubmitApplicationRequestDto {
  applicationId: string;
}

export interface StartNewAfterRejectionRequestDto {
  email: string;
}

// Application Data DTOs
export interface PersonalInfoDto {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  languages?: string[];
  address?: AddressDto;
}

export interface IdentityInfoDto {
  idType?: string;
  idNumber?: string;
  address?: any;
  location?: LocationDto;
  verified?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verifiedAt?: Date;

  governmentIdType?: string;
  governmentIdNumber?: string;
  idDocument?: any;
}

export interface SkillsInfoDto {
  services?: string[];
  yearsOfExperience?: string;
  languages?: string[];
  bio?: string;
  serviceAreas?: string[];
  workRadius?: string;
}

export interface AvailabilityInfoDto {
  serviceAreas?: string[];
  workRadius?: string;
  availability?: Record<string, any>;
}

export interface BankInfoDto {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  bankName?: string;
  withdrawalPreference?: string;
}

export interface DocumentDataDto {
  url: string;
  publicId?: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
  verified: boolean;
  uploadFailed?: boolean;
  error?: string;
}

export interface DocumentsInfoDto {
  idProof?: DocumentDataDto;
  addressProof?: DocumentDataDto;
  policeVerification?: DocumentDataDto;
  passportPhoto?: DocumentDataDto;
  profilePhoto?: DocumentDataDto;
  tradeLicense?: DocumentDataDto;
  [key: string]: DocumentDataDto | undefined;
}

export interface AddressDto {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export interface LocationDto {
  type: string;
  coordinates: number[];
  formattedAddress?: string;
  placeId?: string;
}

// Application Response DTOs
export interface ApplicationDataDto {
  _id: string;
  email: string;
  status: string;
  stepsCompleted: string[];
  personal: PersonalInfoDto;
  identity: IdentityInfoDto;
  skills: SkillsInfoDto;
  availability: AvailabilityInfoDto;
  bank: BankInfoDto;
  documents: DocumentsInfoDto;
  agreement: boolean;
  submittedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectedAt?: Date | string;
  createdAt: Date;
  updatedAt: Date;
  technicianId?: string;
}

export interface ApplicationResponseDataDto {
  applicationId?: string;
  redirectTo?: string | null;
  application?: ApplicationDataDto;
  applications?: ApplicationDataDto[];
  missingSteps?: string[];
  isFreshStart?: boolean;
}

// Response DTOs
export interface ApplicationResponseDto extends BaseResponseDto {
  data?: ApplicationResponseDataDto;
}

export interface ApplicationListResponseDto extends BaseResponseDto {
  data?: {
    applications: ApplicationDataDto[];
  };
}

export interface ExpressFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  stream?: NodeJS.ReadableStream;
  destination?: string;
  filename?: string;
  path?: string;
}

export interface ExpressFiles {
  [fieldname: string]: ExpressFile | ExpressFile[];
}

export interface UploadedFileDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  stream?: NodeJS.ReadableStream;
  destination?: string;
  filename?: string;
  path?: string;
}

export interface FilesCollectionDto {
  [fieldname: string]: UploadedFileDto[];
}
