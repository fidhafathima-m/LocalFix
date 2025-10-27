import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";
import { TechnicianProfileHeader } from "../components/technicianManagement/TechnicianProfileHeader";
import { TechnicianProfileTabs } from "../components/technicianManagement/TechnicianProfileTabs";
import { AdminActions } from "../components/technicianManagement/AdminActions";
import { useAppSelector } from "../../../hooks/redux";
import PersonalInfoTab from "../components/technicianManagement/tabs/PersonalInfoTab";
import ServicesSkillsTab from "../components/technicianManagement/tabs/ServicesSkillsTab";
import VerificationDocumentsTab from "../components/technicianManagement/tabs/VerificationDocumentsTab";
import AvailabilityTab from "../components/technicianManagement/tabs/AvailabilityTab";
import EarningsJobsTab from "../components/technicianManagement/tabs/EarningJobsTab";
import ReviewsRatingsTab from "../components/technicianManagement/tabs/ReviewsRatingsTab";
import ActiveBookingsTab from "../components/technicianManagement/tabs/ActiveBookingsTab";
import type { TechnicianDetails } from "../../../validation/types/technicianTypes";
import { TechnicianMangementService } from "../../../services/admin/TechnicianManagementService";

export const TechnicianProfile: React.FC = () => {
  const { technicianId } = useParams<{ technicianId: string }>();
  const location = useLocation();
  const [technician, setTechnician] = useState<TechnicianDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { technicians } = useAppSelector((state) => state.admin);

  useEffect(() => {
  if (technician) {
    console.log("Technician data:", technician);
    console.log("Profile picture URL:", technician.profilePictureUrl);
    console.log("Profile picture exists:", !!technician.profilePictureUrl);
  }
}, [technician]);

  const getActiveTab = (): string => {
    const pathSegments = location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || "personal-info";
  };

  const getProfilePictureUrl = (technician: TechnicianDetails): string => {
  // First check if there's a direct profilePictureUrl
  if (technician.profilePictureUrl) {
    return technician.profilePictureUrl;
  }
  
  // Then check in documents for passportPhoto
  if (technician.documents && Array.isArray(technician.documents)) {
    const passportPhoto = technician.documents.find(
      doc => doc.type === 'passportPhoto'
    );
    if (passportPhoto?.url) {
      return passportPhoto.url;
    }
  }
  
  return ''; // Return empty string if no profile picture found
};

  const activeTab = getActiveTab();

  const getAdminActionsType = (): "approved" | "pending" | "suspended" | "rejected" => {
    if (!technician) return "approved";

    return technician.status as "approved" | "pending" | "suspended" | "rejected";
  };

  // Check if technician is currently suspended
  const isSuspended = technician?.status === "suspended";

  useEffect(() => {
    if (technicianId && technicians.length > 0) {
      const existingTechnician = technicians.find(
        (t) => t._id === technicianId
      );
      if (existingTechnician) {
        setTechnician(existingTechnician as TechnicianDetails);
        setLoading(false);
        return;
      }
    }
  }, [technicianId, technicians]);
  

  const fetchTechnicianDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!technicianId) {
        throw new Error("Technician ID is required");
      }

      const response = await TechnicianMangementService.getTechnicianById(
        technicianId
      );

      if (response.data.success && response.data.data) {
        setTechnician(response.data.data.technician);
      } else {
        throw new Error(
          response.data.message || "Failed to load technician details"
        );
      }
    } catch (error: unknown) {
      console.error("Error fetching technician details:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load technician details";
      setError(errorMessage);
      setTechnician(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (technicianId && !technician) {
      fetchTechnicianDetails();
    }
  }, [technicianId, technician]);

  if (error && !loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Technicians" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchTechnicianDetails}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Technicians" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading technician details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Technicians" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Technician not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activePage="Technicians" />

      <div className="flex-1 overflow-y-auto ml-[240px]">
        <TechnicianProfileHeader
          name={technician.displayName}
          technicianId={technician._id.slice(-8).toUpperCase()}
          joinDate={new Date(technician.createdAt).toLocaleDateString()}
          isActive={technician.status === "approved"}
          isApproved={technician.status === "approved"}
          isRejected={technician.status === "rejected"}
          isSuspended={technician.status === "suspended"}
          rating={technician.averageRating}
          jobsCompleted={technician.completedJobs || 0}
          totalEarnings={technician.totalEarnings || 0}
          activeBookings={technician.ongoingJobs || 0}
          profilePictureUrl={getProfilePictureUrl(technician)}
        />

        <TechnicianProfileTabs
          technicianId={technicianId!}
          activeTab={activeTab}
        />

        <div className="p-6">
          {/* Suspension Banner */}
          {isSuspended && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-500 mr-3"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <h3 className="text-red-800 font-medium">
                    Technician Suspended
                  </h3>
                  <p className="text-red-600 text-sm">
                    This technician is currently suspended and cannot accept new
                    bookings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === "personal-info" && (
            <PersonalInfoTab
              technician={technician}
              isSuspended={isSuspended}
            />
          )}
          {activeTab === "services-skills" && (
            <ServicesSkillsTab
              technician={technician}
              isSuspended={isSuspended}
            />
          )}
          {activeTab === "verification-documents" && (
            <VerificationDocumentsTab
              technician={technician}
              isSuspended={isSuspended}
            />
          )}
          {activeTab === "availability" && (
            <AvailabilityTab
              technician={technician}
              isSuspended={isSuspended}
            />
          )}
          {activeTab === "earnings-jobs" && (
            <EarningsJobsTab
              technician={technician}
              isSuspended={isSuspended}
            />
          )}
          {activeTab === "reviews-ratings" && (
            <ReviewsRatingsTab technician={technician} />
          )}
          {activeTab === "active-bookings" && (
            <ActiveBookingsTab technician={technician} />
          )}

          {/* Admin Actions - Dynamic based on status */}
          <AdminActions
            type={getAdminActionsType()}
            technicianId={technician._id}
            technicianName={technician.displayName || "Technician"}
            onStatusUpdate={() => {
              // Refresh technician data
              fetchTechnicianDetails();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TechnicianProfile;