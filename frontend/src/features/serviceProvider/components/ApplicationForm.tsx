/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { StepIndicator } from "../components/StepIndicator";
import { FormStep } from "../components/FormStep";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { ImageUploadWithPreview } from "../components/ImageUploadWithPreview";
import { ApplicationSubmitted } from "../pages/ApplicationSubmitted";
import { validateAvailability, validateStepSchema } from "../../../validation";
import {
  stepSchemas,
  type AgreementData,
  type AvailabilityData,
  type BankingData,
  type DocumentsData,
  type IdentityData,
  type PersonalInfoData,
  type SkillsData,
} from "../../../validation/schemas/technicianApplicationSchema";
import toast from "react-hot-toast";
import { OSMLocationPicker } from "../../../components/common/LocationPicker";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  updateApplicationStatus,
  updateUser,
} from "../../../store/slices/authSlice";
import { technicianAPI } from "../../../services/technicianApi";

const STEPS = [
  "Personal Information",
  "Identity & Verification",
  "Skills & Services",
  "Availability & Work Preferences",
  "Banking Details",
  "Documents",
  "Agreement & Consent",
  "Review & Submit",
];

const stepFields: Record<string, string[]> = {
  "Personal Information": [
    "fullName",
    "phoneNumber",
    "email",
    "dateOfBirth",
    "gender",
  ],
  "Identity & Verification": ["idType", "idNumber", "address", "location"],
  "Skills & Services": ["services", "yearsOfExperience", "languages", "bio"],
  "Availability & Work Preferences": [
    "serviceAreas",
    "workRadius",
    "availability",
  ],
  "Banking Details": [
    "accountHolderName",
    "accountNumber",
    "ifscCode",
    "upiId",
    "bankName",
  ],
  Documents: [
    "idProof",
    "addressProof",
    "policeVerification",
    "tradeLicense",
    "certifications",
    "passportPhoto",
  ],
  "Agreement & Consent": ["agreement"],
  "Review & Submit": [],
};

export const ApplicationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [, setApplicationStatus] = useState<string | null>(null);
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("🔍 ApplicationForm - Auth State:", {
      user: user,
      accessToken: accessToken ? "Token exists" : "No token",
      isLoggedIn: !!accessToken
    });
    console.log("🔍 ApplicationForm - localStorage auth:", localStorage.getItem("auth"));
  }, [user, accessToken]);

  // File related
  const [, setPreview] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    // Step 2: Identity & Verification
    idType: "",
    idNumber: "",
    idProof: null as File | null,
    addressProof: null as File | null,
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    location: {
      coordinates: [0, 0] as number[], // [lng, lat]
      formattedAddress: "",
    },
    // Step 3: Skills & Services
    services: [] as string[],
    yearsOfExperience: "",
    certifications: null as File | null,
    languages: [] as string[],
    bio: "",
    // Step 4: Availability & Work Preferences
    serviceAreas: [] as string[],
    workRadius: "",
    availability: {
      monday: {
        available: false,
        startTime: "09:00",
        endTime: "18:00",
      },
      tuesday: {
        available: false,
        startTime: "09:00",
        endTime: "18:00",
      },
      wednesday: {
        available: false,
        startTime: "09:00",
        endTime: "18:00",
      },
      thursday: {
        available: false,
        startTime: "09:00",
        endTime: "18:00",
      },
      friday: {
        available: false,
        startTime: "09:00",
        endTime: "18:00",
      },
      saturday: {
        available: false,
        startTime: "09:00",
        endTime: "18:00",
      },
      sunday: {
        available: false,
        startTime: "09:00",
        endTime: "18:00",
      },
    },
    // Step 5: Banking Details
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    bankName: "",
    // Step 6: Documents
    policeVerification: null as File | null,
    tradeLicense: null as File | null,
    passportPhoto: null as File | null,
    // Step 7: Agreement & Consent
    agreement: false,
  });

  // In ApplicationForm.tsx - fix the startApplication function
const startApplication = async (): Promise<string | null> => {
  if (!user?._id) {
    toast.error("Please log in to start application");
    return null;
  }

  if (!formData.email || formData.email.trim() === "") {
    toast.error("Please enter your email address first");
    return null;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    alert("Please enter a valid email address");
    return null;
  }

  // ✅ FIXED: Check if we have accessToken
  if (!accessToken) {
    toast.error("Authentication token not found. Please log in again.");
    return null;
  }

  try {
    const response = await technicianAPI.startApplication({
      email: formData.email.trim(),
      userId: user._id,
    });

    console.log("🔍 Start Application Response:", response);

    // ✅ FIXED: Check response structure properly
    if (response.success) {
      // Extract data from both possible locations
      const applicationData = response.data || response;
      const newApplicationId = applicationData.applicationId || applicationData.data?.applicationId;
      const redirectTo = applicationData.redirectTo || applicationData.data?.redirectTo;

      console.log("🔍 Extracted Application ID:", newApplicationId);
      console.log("🔍 Redirect To:", redirectTo);

      if (redirectTo) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes(redirectTo)) {
          window.location.href = redirectTo;
        }
        return null;
      }

      if (newApplicationId) {
        setApplicationId(newApplicationId);
        localStorage.setItem("applicationId", newApplicationId);
        localStorage.setItem("currentTechnicianApplication", user._id);
        toast.success("Application started successfully!");
        return newApplicationId;
      } else {
        console.error("No application ID in response:", response);
        toast.error("Failed to get application ID from server");
        return null;
      }
    } else {
      console.error("API returned failure:", response);
      toast.error(response.message || "Failed to start application");
      return null;
    }
  } catch (err: unknown) {
    console.error("Start application error:", err);

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        // Clear auth and redirect to login
        localStorage.removeItem("auth");
        window.location.href = "/login";
      } else if (err.response?.status === 400) {
        toast.error(err.response.data.message || "Bad request");
      } else if (err.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Failed to start application");
      }
    } else {
      toast.error("Failed to start application");
    }
    return null;
  }
};

  useEffect(() => {
    const savedAppId = localStorage.getItem("applicationId");
    if (savedAppId) setApplicationId(savedAppId);
  }, []);

  useEffect(() => {
    if (applicationId) localStorage.setItem("applicationId", applicationId);
  }, [applicationId]);

  useEffect(() => {
    const checkExistingApplication = async () => {
      const savedAppId = localStorage.getItem("applicationId");

      if (savedAppId) {
        const applicationUser = localStorage.getItem(
          "currentTechnicianApplication"
        );

        if (applicationUser !== user?._id) {
          localStorage.removeItem("applicationId");
          localStorage.removeItem("currentTechnicianApplication");
          localStorage.removeItem(`techApp-${savedAppId}`);
          setApplicationId(null);
          return;
        }

        setApplicationId(savedAppId);

        try {
          const response = await technicianAPI.getApplication(savedAppId);

          if (response.data.success && response.data.data?.application) {
            const appData = response.data.data.application;
            setApplicationStatus(appData.status);

            if (
              (appData.status === "submitted" ||
                appData.status === "under_review") &&
              !window.location.pathname.includes("/application")
            ) {
              window.location.href = "/pending-technician/dashboard";
              return;
            }

            if (
              appData.status === "approved" &&
              !window.location.pathname.includes("/application")
            ) {
              window.location.href = "/technician/dashboard";
              return;
            }
          }
        } catch (error) {
          console.error("Error checking application status:", error);
          localStorage.removeItem("applicationId");
          localStorage.removeItem("currentTechnicianApplication");
        }
      }
    };

    checkExistingApplication();
  }, [user?._id, accessToken]);

  useEffect(() => {
    const fetchSavedApplication = async () => {
      if (!applicationId) return;

      try {
        const response = await technicianAPI.getApplication(applicationId);

        if (response.data.success && response.data.data?.application) {
          const application = response.data.data.application;

          if (!application) {
            console.error("No application data in response");
            return;
          }

          const defaultAvailability = {
            monday: { available: false, startTime: "09:00", endTime: "18:00" },
            tuesday: { available: false, startTime: "09:00", endTime: "18:00" },
            wednesday: {
              available: false,
              startTime: "09:00",
              endTime: "18:00",
            },
            thursday: {
              available: false,
              startTime: "09:00",
              endTime: "18:00",
            },
            friday: { available: false, startTime: "09:00", endTime: "18:00" },
            saturday: {
              available: false,
              startTime: "09:00",
              endTime: "18:00",
            },
            sunday: { available: false, startTime: "09:00", endTime: "18:00" },
          };

          let availabilityData =
            application.availability || defaultAvailability;

          if (typeof availabilityData === "string") {
            try {
              availabilityData = JSON.parse(availabilityData);
            } catch (e) {
              console.error("Error parsing availability:", e);
              availabilityData = defaultAvailability;
            }
          }

          availabilityData = {
            ...defaultAvailability,
            ...availabilityData,
          };

          // Populate formData with saved values
          setFormData((prev) => ({
            ...prev,
            ...application.personal,
            ...application.identity,
            ...application.skills,
            availability: availabilityData,
            ...application.bank,
            ...application.documents,
            agreement: application.agreement,
          }));

          const completedSteps = application.stepsCompleted || [];
          const nextStepIndex = STEPS.findIndex(
            (s) => !completedSteps.includes(s)
          );
          setCurrentStep(
            nextStepIndex === -1 ? STEPS.length : nextStepIndex + 1
          );
        }
      } catch (error) {
        console.error("Failed to load saved application:", error);
      }
    };

    fetchSavedApplication();
  }, [applicationId, accessToken]);

  // Save formData locally on every change
  useEffect(() => {
    if (applicationId) {
      localStorage.setItem(
        `techApp-${applicationId}`,
        JSON.stringify(formData)
      );
    }
  }, [formData, applicationId]);

  useEffect(() => {
    if (applicationId) {
      const backup = localStorage.getItem(`techApp-${applicationId}`);
      if (backup) {
        const parsedData = JSON.parse(backup);

        const defaultAvailability = {
          monday: { available: false, startTime: "09:00", endTime: "18:00" },
          tuesday: { available: false, startTime: "09:00", endTime: "18:00" },
          wednesday: { available: false, startTime: "09:00", endTime: "18:00" },
          thursday: { available: false, startTime: "09:00", endTime: "18:00" },
          friday: { available: false, startTime: "09:00", endTime: "18:00" },
          saturday: { available: false, startTime: "09:00", endTime: "18:00" },
          sunday: { available: false, startTime: "09:00", endTime: "18:00" },
        };

        if (
          !parsedData.availability ||
          typeof parsedData.availability !== "object"
        ) {
          parsedData.availability = defaultAvailability;
        } else {
          parsedData.availability = {
            ...defaultAvailability,
            ...parsedData.availability,
          };
        }

        setFormData(parsedData);
      }
    }
  }, [applicationId]);

  const validateFileSize = (
    file: File | null,
    fieldName: string
  ): string | null => {
    if (!file) return null;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return `${fieldName} must be smaller than 5MB`;
    }

    return null;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => {
        // Services checkboxes
        if (name.startsWith("service-")) {
          const service = name.replace("service-", "");
          const updatedServices = checked
            ? [...prev.services, service]
            : prev.services.filter((s) => s !== service);
          return {
            ...prev,
            services: updatedServices,
          };
        }
        // Languages checkboxes
        if (name.startsWith("language-")) {
          const language = name.replace("language-", "");
          const updatedLanguages = checked
            ? [...prev.languages, language]
            : prev.languages.filter((l) => l !== language);
          return {
            ...prev,
            languages: updatedLanguages,
          };
        }
        // Service areas checkboxes
        if (name.startsWith("area-")) {
          const area = name.replace("area-", "");
          const updatedAreas = checked
            ? [...prev.serviceAreas, area]
            : prev.serviceAreas.filter((a) => a !== area);
          return {
            ...prev,
            serviceAreas: updatedAreas,
          };
        }
        // Availability checkboxes
        if (name.startsWith("available-")) {
          const day = name.replace("available-", "");
          return {
            ...prev,
            availability: {
              ...prev.availability,
              [day]: {
                ...prev.availability[day as keyof typeof prev.availability],
                available: checked,
              },
            },
          };
        }
        // Agreement checkbox
        if (name === "agreement") {
          return {
            ...prev,
            agreement: checked,
          };
        }
        return prev;
      });
    } else {
      // Handle time inputs for availability
      if (name.includes("-Time-")) {
        const [timeType, day] = name.split("-Time-");
        setFormData((prev) => ({
          ...prev,
          availability: {
            ...prev.availability,
            [day]: {
              ...prev.availability[day as keyof typeof prev.availability],
              [timeType === "start" ? "startTime" : "endTime"]: value,
            },
          },
        }));
      }
      // Handle nested address fields
      else if (name.startsWith("address.")) {
        const addressField = name.replace(
          "address.",
          ""
        ) as keyof typeof formData.address;
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value,
          },
        }));
      }
      // Handle all other text/select inputs
      else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleFileChange = (field: string) => (file: File | null) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const validateStepFields = (step: number): Record<string, string> => {
    let stepErrors: Record<string, string> = {};

    // Helper function to flatten form data
    const flattenFormData = (data: any): Record<string, any> => {
      const flattened: Record<string, any> = {};

      for (const [key, value] of Object.entries(data)) {
        if (
          value &&
          typeof value === "object" &&
          !(value instanceof File) &&
          !Array.isArray(value)
        ) {
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            flattened[`${key}.${nestedKey}`] = nestedValue;
          }
        } else {
          flattened[key] = value;
        }
      }

      return flattened;
    };

    switch (step) {
      case 1: {
        const flattenedData = flattenFormData(formData);
        const personalValidation = validateStepSchema<PersonalInfoData>(
          stepSchemas[1],
          flattenedData
        );
        if (!personalValidation.success && personalValidation.errors) {
          stepErrors = personalValidation.errors;
        }
        break;
      }
      case 2: {
        const step2Data = {
          idType: formData.idType,
          idNumber: formData.idNumber,
          location: formData.location,
          "address.street": formData.address.street,
          "address.city": formData.address.city,
          "address.state": formData.address.state,
          "address.pincode": formData.address.pincode,
          "address.landmark": formData.address.landmark,
        };

        const identityValidation = validateStepSchema<IdentityData>(
          stepSchemas[2],
          step2Data
        );
        if (!identityValidation.success && identityValidation.errors) {
          stepErrors = identityValidation.errors;
        }
        break;
      }
      case 3: {
        const flattenedData = flattenFormData(formData);
        const skillsValidation = validateStepSchema<SkillsData>(
          stepSchemas[3],
          flattenedData
        );
        if (!skillsValidation.success && skillsValidation.errors) {
          stepErrors = skillsValidation.errors;
        }
        break;
      }
      case 4: {
        const step4Data = {
          serviceAreas: formData.serviceAreas,
          workRadius: formData.workRadius,
          availability: formData.availability,
        };

        const availabilityValidation = validateStepSchema<AvailabilityData>(
          stepSchemas[4],
          step4Data
        );

        if (!availabilityValidation.success && availabilityValidation.errors) {
          stepErrors = availabilityValidation.errors;
        }

        const timeErrors = validateAvailability(formData.availability);
        stepErrors = { ...stepErrors, ...timeErrors };
        break;
      }
      case 5: {
        const flattenedData = flattenFormData(formData);
        const bankingValidation = validateStepSchema<BankingData>(
          stepSchemas[5],
          flattenedData
        );
        if (!bankingValidation.success && bankingValidation.errors) {
          stepErrors = bankingValidation.errors;
        }
        break;
      }
      case 6: {
        const documentsValidation = validateStepSchema<DocumentsData>(
          stepSchemas[6],
          formData
        );
        if (!documentsValidation.success && documentsValidation.errors) {
          stepErrors = documentsValidation.errors;
        }

        const fileFields = [
          { field: "idProof", name: "ID Proof" },
          { field: "addressProof", name: "Address Proof" },
          { field: "policeVerification", name: "Police Verification" },
          { field: "tradeLicense", name: "Trade License" },
          { field: "certifications", name: "Certifications" },
          { field: "passportPhoto", name: "Passport Photo" },
        ];

        fileFields.forEach(({ field, name }) => {
          const file = (formData as any)[field];
          if (file instanceof File) {
            const sizeError = validateFileSize(file, name);
            if (sizeError) {
              stepErrors[field] = sizeError;
            }
          }
        });
        break;
      }
      case 7: {
        const agreementValidation = validateStepSchema<AgreementData>(
          stepSchemas[7],
          { agreement: formData.agreement }
        );
        if (!agreementValidation.success && agreementValidation.errors) {
          stepErrors = agreementValidation.errors;
        }
        break;
      }
      case 8:
        break;
      default:
        break;
    }

    return stepErrors;
  };
  const getMaxDate = (): string => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return maxDate.toISOString().split("T")[0];
  };

  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    if (isNaN(birthDate.getTime())) return null;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleNext = async () => {
  if (isLoading) return;

  const stepErrors = validateStepFields(currentStep);

  if (Object.keys(stepErrors).length > 0) {
    setErrors(stepErrors);
    return;
  } else {
    setErrors({});
  }
  setIsLoading(true);

  let currentApplicationId = applicationId;

  if (!currentApplicationId) {
    currentApplicationId = await startApplication();
    if (!currentApplicationId) {
      toast.error("Failed to start application");
      setIsLoading(false);
      return;
    }
  }

  const stepName = STEPS[currentStep - 1];
  const stepForm = new FormData();

  stepForm.append("step", stepName);
  stepForm.append("applicationId", currentApplicationId);

  const currentStepFields = stepFields[stepName] || [];

  if (stepName === "Documents") {
    const documentFields = [
      "idProof",
      "addressProof",
      "policeVerification",
      "tradeLicense",
      "certifications",
      "passportPhoto",
    ];

    documentFields.forEach((field) => {
      const file = (formData as any)[field];
      if (file instanceof File) {
        stepForm.append(field, file);
      }
    });
  } else {
    // Handle other steps normally
    currentStepFields.forEach((field) => {
      let value = (formData as any)[field];

      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          return;
        }

        if (field === "agreement") {
          stepForm.append(field, value ? "true" : "false");
        } else if (
          (field === "address" || field === "location") &&
          typeof value === "object"
        ) {
          const addressString = JSON.stringify(value);
          stepForm.append(field, addressString);
        }
        // Handle availability object
        else if (field === "availability" && typeof value === "object") {
          value = JSON.stringify(value);
          stepForm.append(field, value);
        }
        // Handle arrays
        else if (Array.isArray(value)) {
          value = JSON.stringify(value);
          stepForm.append(field, value);
        }
        // Handle all other values
        else {
          stepForm.append(field, String(value));
        }
      }
    });
  }

  try {
    const response = await technicianAPI.saveStep(stepForm);

    console.log("🔍 Save Step Response:", response);

    // ✅ FIXED: Check response properly
    if (response.success) {
      toast.success("Step saved successfully!");
      
      // Move to next step
      if (currentStep < STEPS.length) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      toast.error(response.message || "Failed to save step");
    }
  } catch (err: unknown) {
    console.error("Error saving step:", err);

    if (axios.isAxiosError(err)) {
      console.error("Axios error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        headers: err.response?.headers,
      });

      const errorMessage = err.response?.data?.message || err.message;

      if (err.code === "ECONNABORTED") {
        toast.error(
          "Request timeout. Please check your internet connection and try again."
        );
      } else if (err.response?.status === 413) {
        toast.error("File too large. Please upload smaller files.");
      } else if (err.response?.status === 415) {
        toast.error(
          "Unsupported file type. Please upload PDF, JPG, or PNG files."
        );
      } else {
        toast.error(`Failed to save step: ${errorMessage}`);
      }
    } else if (err instanceof Error) {
      toast.error(`Failed to save step: ${err.message}`);
    } else {
      toast.error("Failed to save this step. Please try again.");
    }
  } finally {
    setIsLoading(false);
  }
};

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // In ApplicationForm.tsx - fix the handleSubmit function
const handleSubmit = async () => {
  if (isLoading) return;

  // ✅ FIXED: Get token from auth state instead of localStorage
  const currentToken = accessToken; // Use from useAppSelector

  if (!currentToken) {
    console.error("No token found in auth state");
    alert("Your session has expired. Please log in again.");
    window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
    setIsLoading(false);
    return;
  }

  if (!user?._id) {
    console.error("No user data found");
    alert("User information not found. Please log in again.");
    window.location.href = "/technician/login";
    return;
  }

  if (!applicationId) {
    console.error("No application ID found");
    alert("Application not found. Please start a new application.");
    return;
  }

  setIsLoading(true);

  try {
    const response = await technicianAPI.submitApplication({
      applicationId: applicationId,
    });

    console.log("🔍 Submit Application Response:", response);

    // ✅ FIXED: Check response properly
    if (response.success) {
      dispatch(updateApplicationStatus("submitted"));

      if (response.data?.user) {
        dispatch(
          updateUser({
            ...user,
            applicationStatus: "submitted",
          })
        );
      } else {
        dispatch(
          updateUser({
            applicationStatus: "submitted",
          })
        );
      }

      const currentUser = localStorage.getItem("user");
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        userData.applicationStatus = "submitted";
        localStorage.setItem("user", JSON.stringify(userData));
      }

      // ✅ FIXED: Set both states to trigger success page
      setIsSubmitted(true);
      setSubmissionSuccess(true);

      localStorage.removeItem(`techApp-${applicationId}`);
      
      // ✅ FIXED: Show success toast
      toast.success("Application submitted successfully!");
      
      console.log("✅ Application submitted successfully, should redirect to success page");
    } else {
      // Handle API error response
      console.error("Submit application failed:", response);
      toast.error(response.message || "Failed to submit application");
    }
  } catch (error: unknown) {
    console.error("Submission error:", error);

    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        error.message;
      const missingSteps = error.response?.data?.missingSteps;

      console.log("Error details:", {
        message: errorMessage,
        missingSteps: missingSteps,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        // Clear auth data and redirect to login
        localStorage.removeItem("auth"); // Clear the auth object
        alert("Your session has expired. Please log in again.");
        window.location.href = "/login";
      } else if (error.response?.status === 403) {
        alert(
          "Access denied. You do not have permission to submit this application."
        );
      } else if (missingSteps && missingSteps.length > 0) {
        alert(
          `Please complete the following steps before submitting: ${missingSteps.join(
            ", "
          )}`
        );

        // Navigate to first missing step
        const firstMissingStep = missingSteps[0];
        const stepIndex = STEPS.findIndex(
          (step) => step === firstMissingStep
        );
        if (stepIndex !== -1) {
          setCurrentStep(stepIndex + 1);
        }
      } else {
        alert(
          `There was an error submitting the application: ${errorMessage}`
        );
      }
    } else if (error instanceof Error) {
      alert(
        `There was an error submitting the application: ${error.message}`
      );
    } else {
      alert("There was an unknown error submitting the application.");
    }
  } finally {
    setIsLoading(false);
  }
};
  if (isSubmitted && submissionSuccess) {
    return <ApplicationSubmitted />;
  }
  if (isSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-lg text-gray-700">Submitting your application...</p>
      </div>
    );
  }
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormStep
            title="Step 1: Personal Information"
            onNext={handleNext}
            showPrevious={false}
            nextButtonText={isLoading ? "Saving..." : undefined}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md"
                    required
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                  max={getMaxDate()}
                />
                {formData.dateOfBirth && (
                  <p
                    className={`text-sm mt-1 ${
                      calculateAge(formData.dateOfBirth) !== null &&
                      calculateAge(formData.dateOfBirth)! >= 18
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Age: {calculateAge(formData.dateOfBirth)} years
                    {calculateAge(formData.dateOfBirth) !== null &&
                      calculateAge(formData.dateOfBirth)! < 18 &&
                      " - Must be 18 or older"}
                  </p>
                )}
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>
            </div>
          </FormStep>
        );
      case 2:
        return (
          <FormStep
            title="Step 2: Identity & Verification"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
            nextButtonText={isLoading ? "Saving..." : undefined}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Government ID Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select ID type</option>
                    <option value="passport">Passport</option>
                    <option value="drivingLicense">Driving License</option>
                    <option value="nationalId">National ID</option>
                    <option value="aadhaar">Aadhaar Card</option>
                  </select>
                  {errors.idType && (
                    <p className="text-red-500 text-sm mt-1">{errors.idType}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Government ID Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your ID number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  {errors.idNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.idNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* OpenStreetMap Location Picker */}
              <div className="border-t pt-6">
                <OSMLocationPicker
                  onLocationSelect={(location) => {
                    const locationData = {
                      coordinates: [location.lng, location.lat], // [longitude, latitude] format
                      formattedAddress: location.address || "",
                    };

                    // Update location coordinates - FIXED structure
                    setFormData((prev) => ({
                      ...prev,
                      location: locationData,
                    }));

                    // Auto-fill address fields with fallbacks for undefined
                    if (location.addressComponents) {
                      const { street, city, state, pincode, landmark } =
                        location.addressComponents;

                      setFormData((prev) => ({
                        ...prev,
                        address: {
                          street: street || prev.address.street || "",
                          city: city || prev.address.city || "",
                          state: state || prev.address.state || "",
                          pincode: pincode || prev.address.pincode || "",
                          landmark: landmark || prev.address.landmark || "",
                        },
                      }));
                    }
                  }}
                  className="mt-4"
                />

                {errors.location && (
                  <p className="text-red-500 text-sm mt-2">{errors.location}</p>
                )}
              </div>

              {/* Address Fields */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Address Details
                  <span className="text-green-600 text-sm ml-2">
                    (Auto-filled from map selection)
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium text-gray-700">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      placeholder="House no, street, area"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors["address.street"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {errors["address.street"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["address.street"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors["address.city"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {errors["address.city"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["address.city"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors["address.state"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {errors["address.state"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["address.state"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      placeholder="PIN Code"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors["address.pincode"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {errors["address.pincode"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["address.pincode"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="address.landmark"
                      value={formData.address.landmark}
                      onChange={handleInputChange}
                      placeholder="Nearby landmark"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Click on the map above to
                    automatically fill these address fields using OpenStreetMap.
                    You can also manually edit them if the auto-filled data
                    needs correction.
                  </p>
                </div>
              </div>
            </div>
          </FormStep>
        );
      case 3:
        return (
          <FormStep
            title="Step 3: Skills & Services"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
            nextButtonText={isLoading ? "Saving..." : undefined}
          >
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Select Services <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "AC Repair",
                    "AC Installation",
                    "Washing Machine",
                    "Refrigerator",
                    "TV Repair",
                    "Fan Repair",
                    "Microwave Oven",
                    "Water Purifier",
                    "Geyser/Water Heater",
                  ].map((service) => (
                    <div key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`service-${service}`}
                        name={`service-${service}`}
                        checked={formData.services.includes(service)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label
                        htmlFor={`service-${service}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {errors.services && (
                <p className="text-red-500 text-sm mt-1">{errors.services}</p>
              )}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <select
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select years</option>
                  <option value="1">1 year</option>
                  <option value="2">2 years</option>
                  <option value="3">3 years</option>
                  <option value="4">4 years</option>
                  <option value="5">5 years</option>
                </select>
                {errors.yearsOfExperience && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.yearsOfExperience}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Languages Known <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "English",
                    "Hindi",
                    "Malayalam",
                    "Tamil",
                    "Kannada",
                    "Telugu",
                  ].map((language) => (
                    <div key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`language-${language}`}
                        name={`language-${language}`}
                        checked={formData.languages.includes(language)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label
                        htmlFor={`language-${language}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {language}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.languages && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.languages}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Short Bio/Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="E.g., 10 years experience in AC repair and installation, worked with LG service center"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                  required
                ></textarea>
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Briefly describe your experience and expertise (50-200 words)
                </p>
              </div>
            </div>
          </FormStep>
        );
      case 4:
        return (
          <FormStep
            title="Step 4: Availability & Work Preferences"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
            nextButtonText={isLoading ? "Saving..." : undefined}
          >
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Service Areas <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Kannur",
                    "Kochi",
                    "Kollam",
                    "Thiruvananthapuram",
                    "Thrissur",
                    "Malappuram",
                    "Kozhikode",
                    "Trivandrum",
                  ].map((area) => (
                    <div key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`area-${area}`}
                        name={`area-${area}`}
                        checked={formData.serviceAreas.includes(area)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label
                        htmlFor={`area-${area}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {errors.serviceAreas && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.serviceAreas}
                </p>
              )}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Preferred Work Radius <span className="text-red-500">*</span>
                </label>
                <select
                  name="workRadius"
                  value={formData.workRadius}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select radius</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="15">15 km</option>
                  <option value="20">20 km</option>
                  <option value="25+">25+ km</option>
                </select>
                {errors.workRadius && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.workRadius}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Availability <span className="text-red-500">*</span>
                </label>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Day
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(formData.availability)
                        .filter(([day]) => {
                          // Only include the 7 days of the week
                          const validDays = [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday",
                          ];
                          return validDays.includes(day.toLowerCase());
                        })
                        .map(([day, { available, startTime, endTime }]) => (
                          <tr key={day}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                              {day}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                id={`available-${day}`}
                                name={`available-${day}`}
                                checked={available}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="time"
                                name={`start-Time-${day}`}
                                value={startTime}
                                onChange={handleInputChange}
                                disabled={!available}
                                className={`px-2 py-1 border border-gray-300 rounded-md ${
                                  !available ? "bg-gray-100 text-gray-400" : ""
                                }`}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="time"
                                name={`end-Time-${day}`}
                                value={endTime}
                                onChange={handleInputChange}
                                disabled={!available}
                                className={`px-2 py-1 border border-gray-300 rounded-md ${
                                  !available ? "bg-gray-100 text-gray-400" : ""
                                }`}
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select the days and times you are available to work
                </p>
                {errors.availability && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.availability}
                  </p>
                )}
              </div>
            </div>
          </FormStep>
        );
      case 5:
        return (
          <FormStep
            title="Step 5: Bank / Payment Details"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
            nextButtonText={isLoading ? "Saving..." : undefined}
          >
            <div className="space-y-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Bank Account Holder Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="Enter account holder's name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                {errors.accountHolderName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.accountHolderName}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter your bank name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                {errors.bankName && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Bank Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your account number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                {errors.accountNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.accountNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="Eg: HDFC0001234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                {errors.ifscCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  IFSC code is an 11-character code that identifies your bank
                  branch
                </p>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  UPI ID <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="Enter UPI ID (e.g., name@upi)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">
                  Why we need your bank details
                </h4>
                <p className="text-sm text-blue-700">
                  Your bank details are required for processing payments after
                  successful job completions. We ensure your information is
                  secure and only used for payment purposes.
                </p>
              </div>
            </div>
          </FormStep>
        );
      case 6:
        return (
          <FormStep
            title="Step 6: Documents"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
            nextButtonText={isLoading ? "Uploading Documents..." : undefined}
          >
            <div className="space-y-6">
              {/* Move these from Step 2 to Step 6 */}
              <div>
                <ImageUploadWithPreview
                  label="Government ID Proof (Aadhaar, Passport, etc.)"
                  field="idProof"
                  file={formData.idProof}
                  required={true}
                  onFileChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  error={errors.idProof}
                />
                {errors.idProof && (
                  <p className="text-red-500 text-sm mt-1">{errors.idProof}</p>
                )}
              </div>

              <div>
                <ImageUploadWithPreview
                  label="Address Proof (Utility bill, Rental agreement, etc.)"
                  field="addressProof"
                  file={formData.addressProof}
                  required={true}
                  onFileChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  error={errors.addressProof}
                />
                {errors.addressProof && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.addressProof}
                  </p>
                )}
              </div>

              <div>
                <ImageUploadWithPreview
                  label="Police Verification Certificate (Optional but recommended)"
                  field="policeVerification"
                  file={formData.policeVerification}
                  onFileChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  error={errors.policeVerification}
                />
              </div>

              <div>
                <ImageUploadWithPreview
                  label="Experience Certifications (If any)"
                  field="certifications"
                  file={formData.certifications}
                  onFileChange={handleFileChange}
                  error={errors.certifications}
                />
                {errors.certifications && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.certifications}
                  </p>
                )}
              </div>

              <div>
                <ImageUploadWithPreview
                  label="Trade License / Work Permit (If available)"
                  field="tradeLicense"
                  file={formData.tradeLicense}
                  onFileChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  error={errors.tradeLicense}
                />
              </div>

              <div>
                <ImageUploadWithPreview
                  label="Recent Passport Size Photo"
                  field="passportPhoto"
                  file={formData.passportPhoto}
                  required={true}
                  onFileChange={handleFileChange}
                  accept="image/*"
                  error={errors.passportPhoto}
                />
                {errors.passportPhoto && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.passportPhoto}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 p-4 rounded-md">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Document Verification
                </h4>
                <p className="text-sm text-yellow-700">
                  All documents will be verified by our team. Clear, legible
                  scans or photos are required. Verification typically takes 1-3
                  business days.
                </p>
              </div>
            </div>
          </FormStep>
        );
      case 7:
        return (
          <FormStep
            title="Step 7: Agreement & Consent"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
            nextButtonText={isLoading ? "Saving..." : undefined}
          >
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-medium text-lg mb-2">
                    Terms & Conditions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Please read the following terms carefully before agreeing
                  </p>
                </div>

                {/* Scrollable Terms Container */}
                <div className="max-h-64 overflow-y-auto p-6 bg-white">
                  <div className="space-y-6 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        1. Service Provider Relationship
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        By registering as a technician on LocalFix, you
                        acknowledge that you are an independent service provider
                        and not an employee of LocalFix. You are responsible for
                        your own taxes, insurance, and compliance with local
                        regulations.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        2. Service Quality
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        You agree to provide services with professional care and
                        skill, using appropriate materials and adhering to
                        industry standards. You will communicate clearly with
                        customers about service details, timing, and pricing.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        3. Booking & Scheduling
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        You agree to respond to service requests promptly and
                        honor appointments. If you need to cancel or reschedule,
                        you must provide reasonable notice to both the customer
                        and LocalFix.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        4. Payment Terms
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        LocalFix will process customer payments and transfer
                        your service fee to your registered bank account, minus
                        the platform commission. Payments are typically
                        processed within 3-5 business days after job completion
                        and customer confirmation.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        5. Ratings & Reviews
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        Customers may rate and review your services. You agree
                        that these ratings will be displayed on your profile and
                        may affect your visibility and ranking on the platform.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        6. Document Verification
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        You consent to verification of all documents and
                        information provided during registration. Providing
                        false information may result in immediate termination of
                        your account.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        7. Account Termination
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        LocalFix reserves the right to suspend or terminate your
                        account for violations of these terms, poor service
                        quality, or inappropriate behavior toward customers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scroll indicator (optional) */}
                <div className="bg-gray-50 px-6 py-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    ↑ Scroll to read all terms ↑
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreement"
                    name="agreement"
                    checked={formData.agreement}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                    required
                  />
                  <label htmlFor="agreement" className="ml-2 text-gray-700">
                    I have read and agree to LocalFix's{" "}
                    <span className="text-blue-600 hover:underline">
                      Terms & Conditions
                    </span>{" "}
                    and{" "}
                    <span className="text-blue-600 hover:underline">
                      Code of Conduct
                    </span>
                  </label>
                  {errors.agreement && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.agreement}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600 italic mt-4">
                By proceeding, you confirm that all information provided is
                accurate and complete to the best of your knowledge.
              </div>
            </div>
          </FormStep>
        );
      case 8:
        return (
          <FormStep
            title="Step 8: Review & Submit"
            onNext={handleSubmit}
            onPrevious={handlePrevious}
            showPrevious={true}
            nextButtonText={isLoading ? "Submitting Application..." : undefined}
            isLastStep={true}
          >
            <div className="space-y-8">
              <div className="flex flex-col items-center py-8">
                <div className="bg-green-100 rounded-full p-3 mb-4">
                  <CheckCircleIcon className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Review Your Application
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  Please review all your information carefully before
                  submitting. You can go back to previous steps to make changes
                  if needed.
                </p>
              </div>

              {/* Application Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Application Summary
                </h3>

                {/* Personal Information */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Full Name:</span>
                      <p className="font-medium">
                        {formData.fullName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">
                        {formData.phoneNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">
                        {formData.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date of Birth:</span>
                      <p className="font-medium">
                        {formData.dateOfBirth || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <p className="font-medium">
                        {formData.gender || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Identity & Verification */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Identity & Verification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ID Type:</span>
                      <p className="font-medium">
                        {formData.idType || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">ID Number:</span>
                      <p className="font-medium">
                        {formData.idNumber || "Not provided"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-gray-600">Address:</span>
                      <p className="font-medium">
                        {formData.address.street ||
                        formData.address.city ||
                        formData.address.state ||
                        formData.address.pincode
                          ? `${formData.address.street}, ${
                              formData.address.city
                            }, ${formData.address.state}, ${
                              formData.address.pincode
                            }${
                              formData.address.landmark
                                ? ` (Landmark: ${formData.address.landmark})`
                                : ""
                            }`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills & Services */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Skills & Services
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Services:</span>
                      <p className="font-medium">
                        {formData.services.length > 0
                          ? formData.services.join(", ")
                          : "No services selected"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Experience:</span>
                      <p className="font-medium">
                        {formData.yearsOfExperience || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Languages:</span>
                      <p className="font-medium">
                        {formData.languages.length > 0
                          ? formData.languages.join(", ")
                          : "No languages selected"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Bio:</span>
                      <p className="font-medium">
                        {formData.bio || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Availability
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Service Areas:</span>
                      <p className="font-medium">
                        {formData.serviceAreas.length > 0
                          ? formData.serviceAreas.join(", ")
                          : "No areas selected"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Work Radius:</span>
                      <p className="font-medium">
                        {formData.workRadius
                          ? `${formData.workRadius} km`
                          : "Not provided"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Available Days:</span>
                      <p className="font-medium">
                        {Object.entries(formData.availability)
                          .filter(([, day]) => day.available)
                          .map(
                            ([day]) =>
                              day.charAt(0).toUpperCase() + day.slice(1)
                          )
                          .join(", ") || "No days selected"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banking Details */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Banking Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Account Holder:</span>
                      <p className="font-medium">
                        {formData.accountHolderName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bank Name:</span>
                      <p className="font-medium">
                        {formData.bankName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Account Number:</span>
                      <p className="font-medium">
                        {formData.accountNumber
                          ? "••••" + formData.accountNumber.slice(-4)
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">IFSC Code:</span>
                      <p className="font-medium">
                        {formData.ifscCode || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">UPI ID:</span>
                      <p className="font-medium">
                        {formData.upiId || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ID Proof:</span>
                      <p className="font-medium">
                        {formData.idProof ? "✓ Uploaded" : "✗ Missing"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Passport Photo:</span>
                      <p className="font-medium">
                        {formData.passportPhoto ? "✓ Uploaded" : "✗ Missing"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Police Verification:
                      </span>
                      <p className="font-medium">
                        {formData.policeVerification
                          ? "✓ Uploaded"
                          : "Optional"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agreement */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Agreements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span
                        className={`w-4 h-4 rounded-full mr-2 ${
                          formData.agreement ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span>
                        Terms & Conditions:{" "}
                        {formData.agreement ? "Agreed" : "Not agreed"}
                      </span>
                    </div>
                    {/* <div className="flex items-center">
                <span className={`w-4 h-4 rounded-full mr-2 ${formData.verificationConsent ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>Verification Consent: {formData.verificationConsent ? 'Given' : 'Not given'}</span>
              </div>
              <div className="flex items-center">
                <span className={`w-4 h-4 rounded-full mr-2 ${formData.marketingConsent ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span>Marketing Consent: {formData.marketingConsent ? 'Given' : 'Not given'}</span>
              </div> */}
                  </div>
                </div>
              </div>

              {/* What happens next section */}
              <div className="bg-blue-50 p-6 rounded-md">
                <h3 className="font-medium text-lg mb-4 text-blue-800">
                  What happens next?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-600 font-medium">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">
                        Application Review
                      </p>
                      <p className="text-sm text-blue-700">
                        Our admin team will review your application and
                        documents within 24-48 hours.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-600 font-medium">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">
                        Verification Call
                      </p>
                      <p className="text-sm text-blue-700">
                        We may call you to verify details and discuss your
                        skills and experience.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-600 font-medium">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Onboarding</p>
                      <p className="text-sm text-blue-700">
                        Once approved, you'll receive access to the technician
                        app and onboarding materials.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-600 font-medium">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">
                        Start Receiving Jobs
                      </p>
                      <p className="text-sm text-blue-700">
                        You'll begin receiving service requests based on your
                        skills and availability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="font-medium text-yellow-800 mb-1">
                    Processing Time
                  </p>
                  <p className="text-sm text-yellow-700">
                    Application review typically takes 1-2 business days. You'll
                    receive updates via SMS and email.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="font-medium text-blue-800 mb-1">Need Help?</p>
                  <p className="text-sm text-blue-700">
                    If you have any questions, contact our support team at
                    support@localfix.in or call +91 9876543210.
                  </p>
                </div>
              </div>

              {/* Final confirmation */}
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-green-800 font-medium">
                    All steps completed successfully!
                  </p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your application is ready to be submitted. Click the button
                  below to finalize your application.
                </p>
              </div>
            </div>
          </FormStep>
        );
      default:
        return <div>Step content not available</div>;
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />
      {renderStepContent()}
    </div>
  );
};
