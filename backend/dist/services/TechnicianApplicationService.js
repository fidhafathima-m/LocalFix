"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianApplicationService = void 0;
const mongoose_1 = require("mongoose");
const cloudinary_1 = require("../utils/cloudinary");
const UserAddressSchema_1 = __importDefault(require("../models/UserAddressSchema"));
const responseHelper_1 = require("../utils/responseHelper");
const constants_1 = require("../constants");
const AvailabilityService_1 = require("./AvailabilityService");
const technicianApplicationMappers_1 = require("../mappers/technicianApplicationMappers");
class TechnicianApplicationService {
    constructor(applicationRepository, technicianRepository, documentRepository, userRepository, logger) {
        this._applicationRepository = applicationRepository;
        this._technicianRepository = technicianRepository;
        this._documentRepository = documentRepository;
        this._userRepository = userRepository;
        this._logger = logger;
    }
    async startApplication(data) {
        const context = {
            operation: 'startApplication',
            data: {
                userId: data.userId,
                email: data.email,
            },
        };
        try {
            this._logger.info('Starting technician application process', context);
            const { email, userId } = data;
            const user = await this._userRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found for application start', context);
                return responseHelper_1.ResponseHelper.notFound('User not found');
            }
            // Ensure the provided email matches the user's actual email
            if (user.email !== email) {
                this._logger.warn('Email mismatch for application start', {
                    ...context,
                    userEmail: user.email,
                    providedEmail: email,
                });
                return responseHelper_1.ResponseHelper.badRequest('Email must match your account email');
            }
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            const isEditPath = currentPath.includes('/technicians/apply');
            if (isEditPath) {
                this._logger.debug('Edit mode detected, checking for existing application', context);
                const existingApplication = await this._applicationRepository.findByTechnicianIdAndStatus(userId, [
                    constants_1.APPLICATION_STATUS.DRAFT,
                    constants_1.APPLICATION_STATUS.SUBMITTED,
                    constants_1.APPLICATION_STATUS.UNDER_REVIEW,
                    constants_1.APPLICATION_STATUS.REJECTED,
                ]);
                if (existingApplication) {
                    this._logger.info('Existing application found for editing', {
                        ...context,
                        applicationId: existingApplication._id.toString(),
                        status: existingApplication.status,
                    });
                    return responseHelper_1.ResponseHelper.success('Application loaded for editing', {
                        applicationId: existingApplication._id.toString(),
                        redirectTo: null,
                    });
                }
            }
            this._logger.debug('Checking for existing user applications', context);
            const existingUserApplication = await this._applicationRepository.findByTechnicianIdAndStatus(userId, [
                constants_1.APPLICATION_STATUS.DRAFT,
                constants_1.APPLICATION_STATUS.SUBMITTED,
                constants_1.APPLICATION_STATUS.UNDER_REVIEW,
                constants_1.APPLICATION_STATUS.APPROVED,
            ]);
            if (existingUserApplication) {
                const appStatus = existingUserApplication.status;
                this._logger.info('Existing application found for user', {
                    ...context,
                    applicationId: existingUserApplication._id.toString(),
                    status: appStatus,
                });
                // If application is approved, redirect to technician dashboard
                if (appStatus === constants_1.APPLICATION_STATUS.APPROVED) {
                    this._logger.info('Application already approved, redirecting to dashboard', {
                        ...context,
                        applicationId: existingUserApplication._id.toString(),
                    });
                    return responseHelper_1.ResponseHelper.success(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_ALREADY_APPROVED, {
                        applicationId: existingUserApplication._id.toString(),
                        redirectTo: constants_1.REDIRECT_PATHS.TECHNICIAN_DASHBOARD,
                    });
                }
                return responseHelper_1.ResponseHelper.success(constants_1.TECH_APPLICATION_MESSAGES.EXISTING_APPLICATION_FOUND, {
                    applicationId: existingUserApplication._id.toString(),
                    redirectTo: null,
                });
            }
            this._logger.debug('Checking for existing applications with same email', {
                ...context,
                email: email,
            });
            const existingEmailApplication = await this._applicationRepository.findByEmailAndStatus(email, [
                constants_1.APPLICATION_STATUS.DRAFT,
                constants_1.APPLICATION_STATUS.SUBMITTED,
                constants_1.APPLICATION_STATUS.UNDER_REVIEW,
                constants_1.APPLICATION_STATUS.APPROVED,
            ]);
            if (existingEmailApplication) {
                const existingAppTechnicianId = existingEmailApplication.technicianId?.toString();
                // Email already used by someone else in an active application
                if (existingAppTechnicianId && existingAppTechnicianId !== userId) {
                    this._logger.warn('Email already in use by another technician', {
                        ...context,
                        existingTechnicianId: existingAppTechnicianId,
                    });
                    return responseHelper_1.ResponseHelper.conflict(constants_1.TECH_APPLICATION_MESSAGES.EMAIL_ALREADY_IN_USE);
                }
            }
            this._logger.debug('Creating new application', context);
            // Create new application with proper typing
            const applicationData = {
                email: email.toLowerCase().trim(),
                technicianId: new mongoose_1.Types.ObjectId(userId),
                status: constants_1.APPLICATION_STATUS.DRAFT,
                stepsCompleted: [],
                personal: {},
                identity: {},
                skills: {},
                availability: {},
                bank: {},
                documents: {},
                agreement: false,
            };
            const application = await this._applicationRepository.create(applicationData);
            this._logger.info('New application created successfully', {
                ...context,
                applicationId: application._id.toString(),
            });
            return responseHelper_1.ResponseHelper.success(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_STARTED, {
                applicationId: application._id.toString(),
                redirectTo: null,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Start application process failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.TECH_APPLICATION_MESSAGES.FAILED_TO_START_APPLICATION);
        }
    }
    async saveStep(data, files) {
        const context = {
            operation: 'saveStep',
            data: {
                applicationId: data.applicationId,
                step: data.step,
                hasFiles: !!files,
                fileCount: files ? Object.keys(files).length : 0,
            },
        };
        try {
            this._logger.info('Saving application step', context);
            const { applicationId, step, ...stepData } = data;
            if (!applicationId || !step) {
                this._logger.warn('Missing required parameters for save step', context);
                return responseHelper_1.ResponseHelper.badRequest(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_ID_AND_STEP_REQUIRED);
            }
            const application = await this._applicationRepository.findById(applicationId);
            if (!application) {
                this._logger.warn('Application not found for save step', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
            }
            // Validate personal information step with proper error propagation
            if (step === constants_1.APPLICATION_STEPS.PERSONAL_INFORMATION) {
                const validation = await this.validatePersonalInfoStep(application, stepData);
                if (!validation.isValid) {
                    this._logger.warn('Personal information validation failed', {
                        ...context,
                        validationError: validation.message,
                    });
                    // Return the specific validation error message that will be shown to user
                    return responseHelper_1.ResponseHelper.badRequest(validation.message || 'Personal information validation failed');
                }
            }
            this._logger.debug('Application found, processing step data', {
                ...context,
                currentStatus: application.status,
                stepsCompleted: application.stepsCompleted,
            });
            const processedStepData = { ...stepData };
            // Parse JSON fields
            const jsonFields = [
                'availability',
                'services',
                'languages',
                'serviceAreas',
            ];
            jsonFields.forEach(field => {
                if (processedStepData[field] &&
                    typeof processedStepData[field] === 'string') {
                    try {
                        processedStepData[field] = JSON.parse(processedStepData[field]);
                        this._logger.debug('Parsed JSON field', {
                            ...context,
                            field: field,
                        });
                    }
                    catch (e) {
                        this._logger.warn('Failed to parse JSON field', {
                            ...context,
                            field: field,
                            error: e instanceof Error ? e.message : 'Unknown error',
                        });
                    }
                }
            });
            // Handle specific step types
            if (step === constants_1.APPLICATION_STEPS.IDENTITY_VERIFICATION) {
                this._logger.debug('Processing identity verification step', context);
                await this.handleIdentityVerificationStep(application, processedStepData);
            }
            else if (step === constants_1.APPLICATION_STEPS.DOCUMENTS) {
                this._logger.debug('Processing documents step', {
                    ...context,
                    fileFields: files ? Object.keys(files) : [],
                });
                await this.handleDocumentsStep(application, files);
            }
            else if (step === constants_1.APPLICATION_STEPS.AGREEMENT_CONSENT) {
                this._logger.debug('Processing agreement step', context);
                await this.handleAgreementStep(application, processedStepData);
            }
            else if (step === constants_1.APPLICATION_STEPS.REVIEW_SUBMIT) {
                this._logger.debug('Processing review step', context);
                await this.handleReviewStep(application);
            }
            else {
                this._logger.debug('Processing generic step', {
                    ...context,
                    step: step,
                });
                await this.handleGenericStep(application, step, processedStepData);
            }
            // Mark step as completed if not already
            if (!application.stepsCompleted.includes(step)) {
                application.stepsCompleted.push(step);
                this._logger.debug('Step marked as completed', {
                    ...context,
                    step: step,
                });
            }
            await this._applicationRepository.save(application);
            const applicationDto = (0, technicianApplicationMappers_1.toApplicationDataDto)(application);
            this._logger.info('Step saved successfully', {
                ...context,
                stepsCompleted: application.stepsCompleted.length,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.TECH_APPLICATION_MESSAGES.STEP_SAVED, {
                application: applicationDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Save step operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            // Check if it's a phone number validation error and return specific message
            if (errorMessage.toLowerCase().includes('phone') ||
                errorMessage.toLowerCase().includes('number') ||
                errorMessage.includes('already registered')) {
                return responseHelper_1.ResponseHelper.badRequest(errorMessage);
            }
            return responseHelper_1.ResponseHelper.error(constants_1.TECH_APPLICATION_MESSAGES.FAILED_TO_SAVE_STEP);
        }
    }
    async handleIdentityVerificationStep(application, stepData) {
        const context = {
            operation: 'handleIdentityVerificationStep',
            data: {
                applicationId: application._id.toString(),
                hasAddress: !!stepData.address,
                hasLocation: !!stepData.location,
            },
        };
        try {
            this._logger.debug('Handling identity verification step', context);
            // Save address to UserAddress collection
            if (stepData.address || stepData.location) {
                try {
                    let addressData = stepData.address;
                    let locationData = stepData.location;
                    if (typeof addressData === 'string') {
                        try {
                            addressData = JSON.parse(addressData);
                            this._logger.debug('Parsed address string to object', context);
                        }
                        catch (e) {
                            this._logger.warn('Could not parse address as JSON', context);
                        }
                    }
                    if (typeof addressData === 'object' && addressData.street) {
                        this._logger.debug('Creating user address record', {
                            ...context,
                            addressFields: Object.keys(addressData),
                        });
                        const userAddress = new UserAddressSchema_1.default({
                            userId: application.technicianId,
                            label: 'Home',
                            street: addressData.street || '',
                            city: addressData.city || '',
                            state: addressData.state || '',
                            pincode: addressData.pincode || '',
                            landmark: addressData.landmark || '',
                            isDefault: true,
                            location: {
                                type: 'Point',
                                coordinates: locationData?.coordinates || [0, 0],
                            },
                            formattedAddress: locationData?.formattedAddress || '',
                            placeId: locationData?.placeId || '',
                        });
                        await userAddress.save();
                        this._logger.debug('User address saved successfully', context);
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    this._logger.error('Error saving to UserAddress', {
                        ...context,
                        error: errorMessage,
                    });
                }
            }
            // Use type assertion for Mongoose document operations
            const app = application;
            if (!app.identity) {
                app.identity = {};
                this._logger.debug('Initialized identity object', context);
            }
            // Create update data with proper typing
            const updateData = {
                ...app.identity,
                ...stepData,
            };
            app.identity = updateData;
            this._logger.debug('Identity data updated successfully', {
                ...context,
                identityFields: Object.keys(updateData),
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Identity verification step handling failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async handleDocumentsStep(application, files) {
        const context = {
            operation: 'handleDocumentsStep',
            data: {
                applicationId: application._id.toString(),
                fileCount: files ? Object.keys(files).length : 0,
            },
        };
        try {
            this._logger.info('Handling documents step', context);
            const app = application;
            if (!app.documents) {
                app.documents = {};
                this._logger.debug('Initialized documents object', context);
            }
            const documents = app.documents;
            const documentFields = [
                constants_1.DocumentTypes.ID_PROOF,
                constants_1.DocumentTypes.ADDRESS_PROOF,
                constants_1.DocumentTypes.POLICE_VERIFICATION,
                constants_1.DocumentTypes.PASSPORT_PHOTO,
                constants_1.DocumentTypes.PROFILE_PHOTO,
                constants_1.DocumentTypes.TRADE_LICENSE,
            ];
            let successfulUploads = 0;
            let failedUploads = 0;
            for (const field of documentFields) {
                if (files && files[field]) {
                    const file = files[field];
                    try {
                        let fileToUpload;
                        if (Array.isArray(file)) {
                            fileToUpload = file[0];
                            this._logger.debug('Processing first file from array', {
                                ...context,
                                field: field,
                                arrayLength: file.length,
                            });
                        }
                        else {
                            fileToUpload = file;
                        }
                        this._logger.debug('Uploading document to Cloudinary', {
                            ...context,
                            field: field,
                            filename: fileToUpload.originalname,
                            size: fileToUpload.size,
                        });
                        const fileForUpload = {
                            fieldname: fileToUpload.fieldname || field,
                            originalname: fileToUpload.originalname,
                            encoding: fileToUpload.encoding,
                            mimetype: fileToUpload.mimetype,
                            size: fileToUpload.size,
                            stream: fileToUpload.stream,
                            destination: fileToUpload.destination || '',
                            filename: fileToUpload.filename || fileToUpload.originalname,
                            path: fileToUpload.path || '',
                            buffer: fileToUpload.buffer || Buffer.from(''),
                        };
                        const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(fileForUpload);
                        if (uploadResult && uploadResult.secure_url) {
                            documents[field] = {
                                url: uploadResult.secure_url,
                                publicId: uploadResult.public_id,
                                filename: fileToUpload.originalname,
                                mimetype: fileToUpload.mimetype,
                                size: fileToUpload.size,
                                uploadedAt: new Date(),
                                verified: false,
                                uploadFailed: false,
                            };
                            this._logger.debug('Document uploaded successfully', {
                                ...context,
                                field: field,
                                url: uploadResult.secure_url.substring(0, 50) + '...',
                            });
                            await this._documentRepository.create({
                                technicianId: application.technicianId,
                                applicationId: application._id,
                                type: this.mapDocumentType(field),
                                fileUrl: uploadResult.secure_url,
                                status: 'pending',
                                uploadedAt: new Date(),
                                metadata: {
                                    originalName: fileToUpload.originalname,
                                    mimetype: fileToUpload.mimetype,
                                    size: fileToUpload.size,
                                    fieldName: field,
                                },
                            });
                            successfulUploads++;
                        }
                        else {
                            this._logger.error('Cloudinary upload failed - no secure_url', {
                                ...context,
                                field: field,
                            });
                            documents[field] = {
                                url: '',
                                filename: fileToUpload.originalname,
                                mimetype: fileToUpload.mimetype,
                                size: fileToUpload.size,
                                uploadedAt: new Date(),
                                uploadFailed: true,
                                error: constants_1.TECH_APPLICATION_MESSAGES.CLOUDINARY_UPLOAD_FAILED,
                                verified: false,
                            };
                            failedUploads++;
                        }
                    }
                    catch (uploadError) {
                        const errorMessage = uploadError instanceof Error
                            ? uploadError.message
                            : 'Unknown upload error';
                        this._logger.error(`Error uploading document ${field}`, {
                            ...context,
                            field: field,
                            error: errorMessage,
                        });
                        const fileToUpload = Array.isArray(file)
                            ? file[0]
                            : file;
                        documents[field] = {
                            url: '',
                            filename: fileToUpload.originalname,
                            mimetype: fileToUpload.mimetype,
                            size: fileToUpload.size,
                            uploadedAt: new Date(),
                            uploadFailed: true,
                            error: errorMessage,
                            verified: false,
                        };
                        failedUploads++;
                    }
                }
            }
            app.documents = documents;
            this._logger.info('Documents step processing completed', {
                ...context,
                successfulUploads,
                failedUploads,
                totalProcessed: successfulUploads + failedUploads,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Documents step handling failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    mapDocumentType(field) {
        const mapping = {
            idProof: 'idProof',
            addressProof: 'addressProof',
            policeVerification: 'policeVerification',
            passportPhoto: 'other',
            profilePhoto: 'other',
            tradeLicense: 'tradeLicense',
        };
        return mapping[field] || 'other';
    }
    async handleAgreementStep(application, stepData) {
        const context = {
            operation: 'handleAgreementStep',
            data: {
                applicationId: application._id.toString(),
                agreementValue: stepData.agreement,
            },
        };
        try {
            this._logger.debug('Handling agreement step', context);
            if (stepData.agreement !== undefined) {
                const agreementValue = stepData.agreement === 'true' || stepData.agreement === true;
                application.agreement = agreementValue;
                this._logger.debug('Agreement value set', {
                    ...context,
                    agreementValue: agreementValue,
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Agreement step handling failed', {
                ...context,
                error: errorMessage,
            });
            throw error;
        }
    }
    async handleReviewStep(application) {
        const context = {
            operation: 'handleReviewStep',
            data: { applicationId: application._id.toString() },
        };
        try {
            this._logger.debug('Handling review step', context);
            // No specific data processing for review step, just mark as completed
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Review step handling failed', {
                ...context,
                error: errorMessage,
            });
            throw error;
        }
    }
    async handleGenericStep(application, step, stepData) {
        const context = {
            operation: 'handleGenericStep',
            data: {
                applicationId: application._id.toString(),
                step: step,
                dataFields: Object.keys(stepData),
            },
        };
        try {
            this._logger.debug('Handling generic step', context);
            const stepMapping = constants_1.STEP_MAPPING;
            const applicationField = stepMapping[step];
            if (applicationField) {
                const app = application;
                const currentData = app[applicationField] || {};
                const newData = {
                    ...currentData,
                    ...stepData,
                };
                app[applicationField] = newData;
                this._logger.debug('Step data applied to application', {
                    ...context,
                    applicationField: applicationField,
                    fieldsUpdated: Object.keys(stepData),
                });
                if (step === constants_1.APPLICATION_STEPS.AVAILABILITY_PREFERENCES) {
                    this._logger.debug('Processing availability step data', context);
                    await this.handleAvailabilityStep(application, stepData);
                }
            }
            else {
                this._logger.warn('No mapping found for step', {
                    ...context,
                    step: step,
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Generic step handling failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async handleAvailabilityStep(application, stepData) {
        const context = {
            operation: 'handleAvailabilityStep',
            data: {
                applicationId: application._id.toString(),
                technicianId: application.technicianId?.toString(),
            },
        };
        try {
            this._logger.info('Handling availability step', context);
            if (!application.technicianId) {
                this._logger.warn('No technician ID found for availability setup', context);
                return;
            }
            const availabilityData = stepData.availability;
            if (!availabilityData || typeof availabilityData !== 'object') {
                this._logger.warn('No availability data provided', context);
                return;
            }
            this._logger.debug('Setting up technician availability', {
                ...context,
                availabilityDataKeys: Object.keys(availabilityData),
            });
            // Use the new availability service
            const availabilityService = new AvailabilityService_1.TechnicianAvailabilityService(this._logger);
            await availabilityService.createTechnicianAvailabilityFromApplication(application.technicianId.toString(), availabilityData);
            this._logger.info('Technician availability setup completed', context);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error handling availability step', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async getApplication(applicationId) {
        const context = {
            operation: 'getApplication',
            data: { applicationId },
        };
        try {
            this._logger.info('Fetching application', context);
            if (!applicationId ||
                applicationId === 'undefined' ||
                applicationId === 'null') {
                this._logger.warn('Invalid application ID provided', context);
                return responseHelper_1.ResponseHelper.badRequest('Invalid application ID');
            }
            if (!mongoose_1.Types.ObjectId.isValid(applicationId)) {
                this._logger.warn('Invalid application ID format', {
                    ...context,
                    applicationId: applicationId,
                });
                return responseHelper_1.ResponseHelper.badRequest('Invalid application ID format');
            }
            const application = await this._applicationRepository.findById(applicationId);
            if (!application) {
                this._logger.warn('Application not found', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
            }
            const applicationData = {
                _id: application._id,
                email: application.email,
                status: application.status,
                stepsCompleted: application.stepsCompleted,
                personal: application.personal || {},
                identity: application.identity || {},
                skills: application.skills || {},
                availability: application.availability || {},
                bank: application.bank || {},
                documents: application.documents || {},
                agreement: application.agreement,
                submittedAt: application.submittedAt,
                reviewNotes: application.reviewNotes,
                rejectionReason: application.rejectionReason,
                rejectedAt: application.rejectedAt,
                createdAt: application.createdAt,
                updatedAt: application.updatedAt,
            };
            const applicationDto = (0, technicianApplicationMappers_1.toApplicationDataDto)(application);
            this._logger.info('Application retrieved successfully', {
                ...context,
                status: application.status,
                stepsCompleted: application.stepsCompleted.length,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_RETRIEVED, {
                application: applicationDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get application operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.TECH_APPLICATION_MESSAGES.FAILED_TO_RETRIEVE_APPLICATION);
        }
    }
    async submitApplication(applicationId, userId) {
        const context = {
            operation: 'submitApplication',
            data: { applicationId, userId },
        };
        try {
            this._logger.info('Submitting application', context);
            const application = await this._applicationRepository.findById(applicationId);
            if (!application) {
                this._logger.warn('Application not found for submission', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
            }
            const phoneNumber = application.personal?.phoneNumber;
            if (phoneNumber) {
                const phoneValidation = await this.validatePhoneNumber(phoneNumber, userId);
                if (!phoneValidation.isValid) {
                    this._logger.warn('Phone validation failed during submission', {
                        ...context,
                        validationError: phoneValidation.message,
                    });
                    return responseHelper_1.ResponseHelper.badRequest(phoneValidation.message || 'Phone number validation failed');
                }
            }
            this._logger.debug('Processing languages data', context);
            let languagesArray = [];
            const skillsLanguages = application.skills?.languages;
            if (Array.isArray(skillsLanguages)) {
                languagesArray = skillsLanguages.filter(lang => lang && String(lang).trim() !== '');
            }
            else if (skillsLanguages &&
                typeof skillsLanguages === 'string' &&
                skillsLanguages.trim() !== '') {
                try {
                    const parsed = JSON.parse(skillsLanguages);
                    if (Array.isArray(parsed)) {
                        languagesArray = parsed.filter((lang) => lang && String(lang).trim() !== '');
                    }
                }
                catch (e) {
                    // If not JSON, split by comma
                    languagesArray = skillsLanguages
                        .split(',')
                        .map((lang) => lang.trim())
                        .filter((lang) => lang !== '');
                }
            }
            this._logger.debug('Languages processed', {
                ...context,
                languagesCount: languagesArray.length,
            });
            // Ownership validation
            if (!application.technicianId ||
                application.technicianId.toString() !== userId) {
                this._logger.warn('Application ownership validation failed', {
                    ...context,
                    applicationTechnicianId: application.technicianId?.toString(),
                    requestingUserId: userId,
                });
                return responseHelper_1.ResponseHelper.forbidden(constants_1.TECH_APPLICATION_MESSAGES.ACCESS_DENIED);
            }
            if (application.status !== constants_1.APPLICATION_STATUS.DRAFT) {
                this._logger.warn('Application already submitted', {
                    ...context,
                    currentStatus: application.status,
                });
                return responseHelper_1.ResponseHelper.badRequest(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_ALREADY_SUBMITTED);
            }
            // Validate all required steps are completed
            const requiredSteps = constants_1.REQUIRED_STEPS;
            const missingSteps = requiredSteps.filter(step => !application.stepsCompleted.includes(step));
            if (missingSteps.length > 0) {
                this._logger.warn('Required steps not completed', {
                    ...context,
                    missingSteps: missingSteps,
                });
                return responseHelper_1.ResponseHelper.unProcessableEntity(constants_1.TECH_APPLICATION_MESSAGES.COMPLETE_ALL_STEPS_REQUIRED, {
                    missingSteps,
                });
            }
            this._logger.debug('Checking for existing submitted applications', context);
            const existingSubmittedApp = await this._applicationRepository.findByTechnicianIdAndStatus(userId, [
                constants_1.APPLICATION_STATUS.SUBMITTED,
                constants_1.APPLICATION_STATUS.UNDER_REVIEW,
            ]);
            if (existingSubmittedApp &&
                existingSubmittedApp._id.toString() !== applicationId) {
                this._logger.warn('User already has application in review', {
                    ...context,
                    existingApplicationId: existingSubmittedApp._id.toString(),
                });
                return responseHelper_1.ResponseHelper.badRequest('You already have an application in review. Please wait for it to be processed.');
            }
            this._logger.debug('Updating user application status', context);
            // Update user
            const user = await this._userRepository.updateApplicationStatus(userId, constants_1.APPLICATION_STATUS.SUBMITTED);
            if (!user) {
                this._logger.warn('User not found during submission', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECH_APPLICATION_MESSAGES.USER_NOT_FOUND);
            }
            // Update user email if different
            if (application.email && user.email !== application.email) {
                this._logger.debug('Updating user email', {
                    ...context,
                    oldEmail: user.email,
                    newEmail: application.email,
                });
                await this._userRepository.update(userId, { email: application.email });
            }
            // Extract service areas and work radius from application data
            const applicationAvailability = application.availability;
            const serviceAreas = applicationAvailability?.serviceAreas ||
                application.skills?.serviceAreas ||
                [];
            const workRadius = applicationAvailability?.workRadius
                ? parseInt(applicationAvailability.workRadius)
                : application.skills?.workRadius
                    ? parseInt(application.skills.workRadius)
                    : 10;
            // Create or update technician record
            let technician = await this._technicianRepository.findByUserId(userId);
            let addressData = {};
            if (application.identity?.address) {
                if (typeof application.identity.address === 'string') {
                    try {
                        addressData = JSON.parse(application.identity.address);
                    }
                    catch (e) {
                        this._logger.warn('Error parsing address JSON', {
                            ...context,
                            error: e instanceof Error ? e.message : 'Unknown error',
                        });
                        addressData = {};
                    }
                }
                else {
                    addressData = application.identity.address;
                }
            }
            if (!technician) {
                this._logger.info('Creating new technician record', context);
                // Create new technician
                technician = await this._technicianRepository.create({
                    userId: new mongoose_1.Types.ObjectId(userId),
                    displayName: application.personal?.fullName || constants_1.UserRoles.TECHNICIAN,
                    bio: application.skills?.bio || '',
                    experienceYears: parseInt(application.skills?.yearsOfExperience) || 0,
                    services: application.skills?.services || [],
                    serviceRates: {},
                    workAreas: serviceAreas,
                    serviceRadiusKm: workRadius,
                    currentLocation: {
                        type: 'Point',
                        coordinates: [0, 0],
                    },
                    averageRating: 0,
                    ratingCount: 0,
                    status: constants_1.APPLICATION_STATUS.SUBMITTED,
                    profilePictureUrl: application.documents?.passportPhoto?.url || '',
                    personalInfo: {
                        fullName: application.personal?.fullName || '',
                        gender: application.personal?.gender || '',
                        phoneNumber: application.personal?.phoneNumber || '',
                        dateOfBirth: application.personal?.dateOfBirth || '',
                        languages: languagesArray,
                        address: addressData,
                    },
                });
                this._logger.info('New technician created', {
                    ...context,
                    technicianId: technician._id?.toString(),
                });
            }
            else {
                this._logger.info('Updating existing technician record', {
                    ...context,
                    technicianId: technician._id?.toString(),
                });
                // Update existing technician
                await this._technicianRepository.updateByUserId(userId, {
                    displayName: application.personal?.fullName ||
                        technician.displayName,
                    bio: application.skills?.bio || technician.bio,
                    experienceYears: parseInt(application.skills?.yearsOfExperience) ||
                        technician.experienceYears,
                    services: application.skills?.services || technician.services,
                    workAreas: serviceAreas || technician.workAreas,
                    serviceRadiusKm: workRadius || technician.serviceRadiusKm,
                    profilePictureUrl: application.documents?.passportPhoto?.url ||
                        technician.profilePictureUrl,
                    status: constants_1.APPLICATION_STATUS.SUBMITTED,
                    personalInfo: {
                        ...technician.personalInfo,
                        fullName: application.personal?.fullName ||
                            technician.personalInfo?.fullName ||
                            '',
                        gender: application.personal?.gender ||
                            technician.personalInfo?.gender ||
                            '',
                        phoneNumber: application.personal?.phoneNumber ||
                            technician.personalInfo?.phoneNumber ||
                            '',
                        dateOfBirth: application.personal?.dateOfBirth ||
                            technician.personalInfo?.dateOfBirth ||
                            '',
                        languages: languagesArray,
                        address: addressData,
                    },
                });
            }
            if (!technician) {
                // After creation, fetch the technician to verify
                technician = await this._technicianRepository.findByUserId(userId);
                this._logger.debug('Fetched technician after creation', {
                    ...context,
                    technicianFound: !!technician,
                });
            }
            // Update application status
            await this._applicationRepository.update(applicationId, {
                status: constants_1.APPLICATION_STATUS.SUBMITTED,
                submittedAt: new Date(),
            });
            this._logger.info('Application submitted successfully', {
                ...context,
                applicationId: application._id.toString(),
            });
            return responseHelper_1.ResponseHelper.success(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_SUBMITTED, {
                applicationId: application._id.toString(),
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Submit application operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.badRequest(constants_1.TECH_APPLICATION_MESSAGES.FAILED_TO_SUBMIT_APPLICATION);
        }
    }
    async getApplicationStatus(applicationId) {
        const context = {
            operation: 'getApplicationStatus',
            data: { applicationId },
        };
        try {
            this._logger.info('Fetching application status', context);
            const application = await this._applicationRepository.findById(applicationId);
            if (!application) {
                this._logger.warn('Application not found for status check', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
            }
            const applicationData = {
                ...application.toObject(),
                documents: application.documents || {},
            };
            this._logger.info('Application status retrieved', {
                ...context,
                status: application.status,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_STATUS_RETRIEVED, {
                application: applicationData,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get application status operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.TECH_APPLICATION_MESSAGES.FAILED_TO_GET_STATUS);
        }
    }
    async getUserApplications(userId) {
        const context = {
            operation: 'getUserApplications',
            data: { userId },
        };
        try {
            this._logger.info('Fetching user applications', context);
            const applications = await this._applicationRepository.findByTechnicianId(userId);
            const applicationDtos = (0, technicianApplicationMappers_1.toApplicationListDto)(applications);
            this._logger.info('User applications retrieved successfully', {
                ...context,
                applicationsCount: applications.length,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.TECH_APPLICATION_MESSAGES.USER_APPLICATIONS_RETRIEVED, {
                applications: applicationDtos,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get user applications operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.TECH_APPLICATION_MESSAGES.FAILED_TO_RETRIEVE_APPLICATION);
        }
    }
    async resubmitApplication(applicationId, userId) {
        const context = {
            operation: 'resubmitApplication',
            data: { applicationId, userId },
        };
        try {
            this._logger.info('Resubmitting application', context);
            const application = await this._applicationRepository.findById(applicationId);
            if (!application) {
                this._logger.warn('Application not found for resubmission', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
            }
            // Ownership validation
            if (!application.technicianId) {
                this._logger.warn('No technician assigned to application', context);
                return responseHelper_1.ResponseHelper.badRequest(constants_1.TECH_APPLICATION_MESSAGES.NO_TECHNICIAN_ASSIGNED);
            }
            if (application.technicianId.toString() !== userId) {
                this._logger.warn('Application ownership validation failed for resubmission', {
                    ...context,
                    applicationTechnicianId: application.technicianId.toString(),
                    requestingUserId: userId,
                });
                return responseHelper_1.ResponseHelper.forbidden(constants_1.TECH_APPLICATION_MESSAGES.ACCESS_DENIED);
            }
            // Check if application is rejected
            if (application.status !== constants_1.APPLICATION_STATUS.REJECTED) {
                this._logger.warn('Application is not rejected, cannot resubmit', {
                    ...context,
                    currentStatus: application.status,
                });
                return responseHelper_1.ResponseHelper.badRequest(constants_1.TECH_APPLICATION_MESSAGES.ONLY_REJECTED_CAN_RESUBMIT);
            }
            this._logger.debug('Updating application status for resubmission', context);
            // Update application status and clear rejection details
            application.status = constants_1.APPLICATION_STATUS.SUBMITTED;
            application.rejectionReason = undefined;
            application.reviewNotes = undefined;
            application.resubmittedCount = (application.resubmittedCount || 0) + 1;
            application.lastSubmittedAt = new Date();
            application.updatedAt = new Date();
            await this._applicationRepository.save(application);
            const technician = await this._technicianRepository.findByUserId(userId);
            if (technician) {
                await this._technicianRepository.updateByUserId(userId, {
                    status: constants_1.APPLICATION_STATUS.SUBMITTED,
                });
                this._logger.debug('Technician status updated', {
                    ...context,
                    technicianId: technician._id?.toString(),
                });
            }
            this._logger.info('Application resubmitted successfully', {
                ...context,
                resubmittedCount: application.resubmittedCount,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_RESUBMITTED, {
                applicationId: application._id.toString(),
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Resubmit application operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.TECH_APPLICATION_MESSAGES.FAILED_TO_RESUBMIT_APPLICATION);
        }
    }
    async startNewApplicationAfterRejection(userId, email) {
        const context = {
            operation: 'startNewApplicationAfterRejection',
            data: { userId, email },
        };
        try {
            this._logger.info('Starting new application after rejection', context);
            // Find the rejected application
            const rejectedApplication = await this._applicationRepository.findByTechnicianIdAndStatus(userId, [
                constants_1.APPLICATION_STATUS.REJECTED,
            ]);
            if (!rejectedApplication) {
                this._logger.warn('No rejected application found', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECH_APPLICATION_MESSAGES.NO_REJECTED_APPLICATION_FOUND);
            }
            this._logger.debug('Creating new application from rejected one', {
                ...context,
                previousApplicationId: rejectedApplication._id.toString(),
            });
            const newApplication = await this._applicationRepository.create({
                email: email.toLowerCase().trim(),
                technicianId: new mongoose_1.Types.ObjectId(userId),
                status: constants_1.APPLICATION_STATUS.DRAFT,
                stepsCompleted: [],
                personal: {
                    email: email.toLowerCase().trim(),
                },
                identity: {},
                skills: {},
                availability: {},
                bank: {},
                documents: rejectedApplication.documents || {},
                agreement: false,
                previousApplicationId: rejectedApplication._id,
                resubmittedCount: (rejectedApplication.resubmittedCount || 0) + 1,
            });
            this._logger.info('New application created after rejection', {
                ...context,
                newApplicationId: newApplication._id.toString(),
                resubmittedCount: newApplication.resubmittedCount,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.TECH_APPLICATION_MESSAGES.NEW_APPLICATION_STARTED, {
                applicationId: newApplication._id.toString(),
                redirectTo: null,
                isFreshStart: true,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Start new application after rejection operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.TECH_APPLICATION_MESSAGES.FAILED_TO_START_NEW_APPLICATION);
        }
    }
    async getApplicationForEdit(applicationId, userId) {
        const context = {
            operation: 'getApplicationForEdit',
            data: { applicationId, userId },
        };
        try {
            this._logger.info('Fetching application for editing', context);
            const application = await this._applicationRepository.findById(applicationId);
            if (!application) {
                this._logger.warn('Application not found for editing', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
            }
            // Ownership validation
            if (!application.technicianId ||
                application.technicianId.toString() !== userId) {
                this._logger.warn('Application ownership validation failed for editing', {
                    ...context,
                    applicationTechnicianId: application.technicianId?.toString(),
                    requestingUserId: userId,
                });
                return responseHelper_1.ResponseHelper.forbidden(constants_1.TECH_APPLICATION_MESSAGES.ACCESS_DENIED);
            }
            // Allow editing for these statuses
            const allowedStatuses = [
                constants_1.APPLICATION_STATUS.DRAFT,
                constants_1.APPLICATION_STATUS.SUBMITTED,
                constants_1.APPLICATION_STATUS.UNDER_REVIEW,
                constants_1.APPLICATION_STATUS.REJECTED,
            ];
            const applicationDto = (0, technicianApplicationMappers_1.toApplicationDataDto)(application);
            this._logger.info('Application loaded for editing', {
                ...context,
                status: application.status,
                stepsCompleted: application.stepsCompleted.length,
            });
            return responseHelper_1.ResponseHelper.success('Application loaded for editing', {
                application: applicationDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get application for edit operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to load application for editing');
        }
    }
    // Add these methods to your TechnicianApplicationService class
    async validatePhoneNumber(phoneNumber, excludeUserId) {
        const context = {
            operation: 'validatePhoneNumber',
            data: { phoneNumber, excludeUserId },
        };
        try {
            this._logger.info('Validating phone number', context);
            if (!phoneNumber) {
                return { isValid: false, message: 'Phone number is required' };
            }
            // Basic phone number format validation (Indian format)
            const phoneRegex = /^[6-9]\d{9}$/;
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                return {
                    isValid: false,
                    message: 'Please enter a valid 10-digit Indian phone number starting with 6-9',
                };
            }
            // Check if phone number already exists in user records
            const existingUser = await this._userRepository.findByPhone(cleanPhone);
            if (existingUser && existingUser._id.toString() !== excludeUserId) {
                this._logger.warn('Phone number already registered with another user', {
                    ...context,
                    existingUserId: existingUser._id.toString(),
                });
                return {
                    isValid: false,
                    message: 'This phone number is already registered with another user account. Please use a different phone number.',
                };
            }
            // Check if phone number exists in any active technician applications
            const existingApplication = await this._applicationRepository.findByPhoneAndStatus(cleanPhone, [
                constants_1.APPLICATION_STATUS.DRAFT,
                constants_1.APPLICATION_STATUS.SUBMITTED,
                constants_1.APPLICATION_STATUS.UNDER_REVIEW,
            ], excludeUserId);
            if (existingApplication) {
                this._logger.warn('Phone number already in use in another application', {
                    ...context,
                    existingApplicationId: existingApplication._id.toString(),
                });
                return {
                    isValid: false,
                    message: 'This phone number is already being used in another technician application. Please use a different phone number.',
                };
            }
            // Check if phone number exists in approved technicians
            const existingTechnician = await this._technicianRepository.findByPhone(cleanPhone);
            if (existingTechnician &&
                existingTechnician.userId?.toString() !== excludeUserId) {
                this._logger.warn('Phone number already registered with another technician', {
                    ...context,
                    existingTechnicianId: existingTechnician._id.toString(),
                });
                return {
                    isValid: false,
                    message: 'This phone number is already registered with another technician. Please use a different phone number.',
                };
            }
            this._logger.info('Phone number validation successful', context);
            return { isValid: true };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Phone number validation failed', {
                ...context,
                error: errorMessage,
            });
            return {
                isValid: false,
                message: 'Unable to verify phone number at the moment. Please try again later.',
            };
        }
    }
    async validatePersonalInfoStep(application, stepData) {
        const context = {
            operation: 'validatePersonalInfoStep',
            data: {
                applicationId: application._id.toString(),
                hasPhone: !!stepData.phoneNumber,
                phoneNumber: stepData.phoneNumber,
            },
        };
        try {
            this._logger.info('Validating personal information step', context);
            const phoneNumber = stepData.phoneNumber;
            if (!phoneNumber) {
                return { isValid: false, message: 'Phone number is required' };
            }
            // Clean phone number
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            // Basic phone number format validation (Indian format)
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(cleanPhone)) {
                return {
                    isValid: false,
                    message: 'Please enter a valid 10-digit Indian phone number starting with 6-9',
                };
            }
            // Validate phone number with better error messages
            const phoneValidation = await this.validatePhoneNumber(cleanPhone, application.technicianId?.toString());
            if (!phoneValidation.isValid) {
                this._logger.warn('Phone number validation failed', {
                    ...context,
                    validationError: phoneValidation.message,
                });
                return phoneValidation;
            }
            // Validate other required personal info fields
            const requiredFields = ['fullName', 'dateOfBirth', 'gender'];
            const missingFields = requiredFields.filter(field => !stepData[field]);
            if (missingFields.length > 0) {
                return {
                    isValid: false,
                    message: `Please fill in all required fields: ${missingFields.join(', ')}`,
                };
            }
            // Validate date of birth (must be at least 18 years old)
            if (stepData.dateOfBirth) {
                const dob = new Date(stepData.dateOfBirth);
                const today = new Date();
                const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                if (dob > minDate) {
                    return {
                        isValid: false,
                        message: 'You must be at least 18 years old to apply as a technician',
                    };
                }
            }
            this._logger.info('Personal information validation successful', context);
            return { isValid: true };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Personal info validation failed', {
                ...context,
                error: errorMessage,
            });
            return {
                isValid: false,
                message: 'Failed to validate personal information. Please try again.',
            };
        }
    }
}
exports.TechnicianApplicationService = TechnicianApplicationService;
