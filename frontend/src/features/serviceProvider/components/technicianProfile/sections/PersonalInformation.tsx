/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import AccordionSection from "./AccordianSections";
import { CalendarTodayOutlined, FileUploadOutlined } from "@mui/icons-material";
import { TechnicianService } from "../../../../../services/technician/technicianService";
import toast from "react-hot-toast";
import type { TechnicianProfile } from "../../../../../interface/technician/ITechnicianApi";

const PersonalInformation = () => {
  const [, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    languages: [] as string[],
    bio: "",
    profilePicture: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await TechnicianService.getProfile();
      if (response.success) {
        const profileData =
          response.data?.data?.profile ||
          response.data?.profile ||
          response.data?.data;

        if (!profileData) {
          console.error("Profile data not found in response");
          return;
        }
        setProfile(profileData);

        // Format date for input (YYYY-MM-DD)
        let formattedDateOfBirth = "";
        if (profileData.personalInfo?.dateOfBirth) {
          const date = new Date(profileData.personalInfo.dateOfBirth);
          if (!isNaN(date.getTime())) {
            // Extract only the date part (YYYY-MM-DD) without time
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            formattedDateOfBirth = `${year}-${month}-${day}`;
          }
        }

        let languagesArray: string[] = [];
        if (profileData.personalInfo?.languages) {
          if (Array.isArray(profileData.personalInfo.languages)) {
            languagesArray = profileData.personalInfo.languages;
          } else if (typeof profileData.personalInfo.languages === "string") {
            try {
              const parsed = JSON.parse(profileData.personalInfo.languages);
              languagesArray = Array.isArray(parsed)
                ? parsed
                : [profileData.personalInfo.languages];
            } catch {
              if (profileData.personalInfo.languages.includes(",")) {
                languagesArray = profileData.personalInfo.languages
                  .split(",")
                  .map((lang: string) => lang.trim());
              } else {
                languagesArray = [profileData.personalInfo.languages];
              }
            }
          }
        }

        // Populate form data
        setFormData({
          fullName:
            profileData.personalInfo?.fullName || profileData.displayName || "",
          phoneNumber:
            profileData.personalInfo?.phoneNumber || profileData.phone || "",
          email: profileData.email || "",
          dateOfBirth: formattedDateOfBirth,
          gender: profileData.personalInfo?.gender || "",
          languages: languagesArray,
          bio: profileData.bio || "",
          // Use profile picture URL if available, otherwise check for passport photo from application
          profilePicture: profileData.profilePictureUrl || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Skip if the field is disabled (dateOfBirth or gender)
    if (name === "dateOfBirth" || name === "gender") {
      return;
    }

    if (type === "date") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLanguagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const language = name.replace("language-", "");

    setFormData((prev) => {
      let updatedLanguages: string[];

      if (checked) {
        // Add language if checked
        updatedLanguages = [...prev.languages, language];
      } else {
        // Remove language if unchecked
        updatedLanguages = prev.languages.filter((lang) => lang !== language);
      }

      return {
        ...prev,
        languages: updatedLanguages,
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData = {
        personalInfo: {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          languages: formData.languages,
        },
        bio: formData.bio,
        email: formData.email,
        ...(formData.profilePicture && {
          profilePicture: formData.profilePicture,
        }),
      };

      const response = await TechnicianService.updatePersonalInfo(updateData);

      // Enhanced success check
      const isSuccess = response.success || response.data?.success;

      if (isSuccess) {
        if (response.data?.profile) {
          setProfile(response.data.profile);

          // Update formData with the returned values
          const profileData = response.data.profile;
          setFormData((prev) => ({
            ...prev,
            fullName: profileData.personalInfo?.fullName || "",
            phoneNumber: profileData.personalInfo?.phoneNumber || "",
            email: profileData.email || "",
            bio: profileData.bio || "",
            languages: profileData.personalInfo?.languages || [],
            profilePicture: profileData.profilePictureUrl || "",
          }));
        }

        toast.success("Personal information updated successfully!");
      } else {
        const errorMessage =
          response.message ||
          response.data?.message ||
          "Failed to update personal information";
        console.error("Frontend - Update failed in response", errorMessage);
        if (errorMessage.includes("email") || errorMessage.includes("Email")) {
          toast.error(
            "This email is already registered. Please use a different email."
          );
        } else if (
          errorMessage.includes("phone") ||
          errorMessage.includes("Phone")
        ) {
          toast.error(
            "This phone number is already registered. Please use a different number."
          );
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Frontend - Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update personal information";

      // Show specific error messages based on backend response
      if (errorMessage.includes("email") || errorMessage.includes("Email")) {
        toast.error(
          "This email is already registered. Please use a different email."
        );
      } else if (
        errorMessage.includes("phone") ||
        errorMessage.includes("Phone")
      ) {
        toast.error(
          "This phone number is already registered. Please use a different number."
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      setUploadingPhoto(true);

      // Create a FormData object for file upload
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await TechnicianService.uploadPhoto(formData);

      if (response.success) {
        const profilePictureUrl =
          response.data?.profilePictureUrl ||
          response.data?.data?.profilePictureUrl;

        if (profilePictureUrl) {
          setFormData((prev) => ({
            ...prev,
            profilePicture: profilePictureUrl,
          }));

          setProfile((prev) => (prev ? { ...prev, profilePictureUrl } : null));

          toast.success("Profile photo updated successfully!");

          // Refresh profile to get updated data
          await fetchProfile();
        } else {
          throw new Error("No profile picture URL in response");
        }
      } else {
        throw new Error(response.message || "Failed to upload photo");
      }
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload photo";
      toast.error(errorMessage);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size should be less than 5MB");
        return;
      }
      handlePhotoUpload(file);
    }
  };

  if (loading) {
    return (
      <AccordionSection
        title="Personal Information"
        number={1}
        defaultOpen={true}
      >
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AccordionSection>
    );
  }

  return (
    <AccordionSection
      title="Personal Information"
      number={1}
      defaultOpen={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Photo */}
        <div className="md:col-span-2 flex flex-col items-center mb-4">
          <div className="relative w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center mb-2 overflow-hidden">
            {formData.profilePicture ? (
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            )}
            <label
              htmlFor="photo-upload"
              className={`absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer ${
                uploadingPhoto
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
            >
              {uploadingPhoto ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FileUploadOutlined />
              )}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploadingPhoto}
              />
            </label>
          </div>
          <button
            className={`text-blue-500 text-sm ${
              uploadingPhoto
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-blue-600"
            }`}
            onClick={() => document.getElementById("photo-upload")?.click()}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? "Uploading..." : "Change Photo"}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            This photo will be used as your profile picture.
            <br />
            Use the same passport photo from your application for consistency.
          </p>
        </div>

        {/* Rest of your form fields remain the same */}
        {/* Full Name */}
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone Number */}
        <div>
          <div className="flex justify-between">
            <label className="block text-sm mb-1">Phone Number</label>
            <span className="text-xs text-green-500">(Verified)</span>
          </div>
          <div className="flex">
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter your phone no."
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date of Birth - DISABLED */}
        <div>
          <label className="block text-sm mb-1">Date of Birth</label>
          <div className="relative">
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              disabled
              className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            <CalendarTodayOutlined className="absolute h-5 w-5 right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Date of birth cannot be changed
          </p>
        </div>

        {/* Gender - DISABLED */}
        <div>
          <label className="block text-sm mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            disabled
            className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Gender cannot be changed</p>
        </div>

        {/* Languages Spoken */}
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
                  onChange={handleLanguagesChange}
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
          {formData.languages.length > 0 && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">Selected: </span>
              {formData.languages.join(", ")}
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Short Bio / About Me</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself and your experience..."
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            rows={4}
          />
        </div>
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Important Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                For security and verification purposes,{" "}
                <strong>Date of Birth</strong> and <strong>Gender</strong>{" "}
                cannot be changed after initial registration.
              </p>
              <p className="mt-1">
                Your profile photo should match the passport photo from your
                application for verification consistency.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${
            saving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 cursor-pointer"></div>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </AccordionSection>
  );
};

export default PersonalInformation;
