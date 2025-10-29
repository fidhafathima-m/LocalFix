import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  StarBorderOutlined,
  BuildOutlined,
  AccessTimeOutlined,
  LocationOnOutlined,
  CheckCircleOutlineOutlined,
  InsertDriveFileOutlined,
  CalendarMonthOutlined,
  PersonOutlineOutlined,
} from "@mui/icons-material";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";
import { TechnicianMangementService } from "../../../services/admin/TechnicianManagementService";

interface Technician {
  _id: string;
  userId: string;
  displayName: string;
  bio?: string;
  email?: string;
  phone?: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
  serviceRadiusKm: number;
  status: "pending" | "approved" | "rejected" | "suspended";
  averageRating: number;
  ratingCount: number;
  totalJobs?: number;
  completedJobs?: number;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    phone: string;
    fullName: string;
  };
  personalInfo?: {
    fullName?: string;
    languages?: string[];
    address?: {
      city?: string;
      state?: string;
      pincode?: string;
    };
  };
  documents?: Array<{
    _id: string;
    type: string;
    fileName: string;
    url: string;
    verified: boolean;
    status: string;
    uploadedAt: string;
  }>;
}

interface Review {
  _id: string;
  userId: string;
  technicianId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  user?: {
    fullName: string;
  };
}

const TechnicianProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [reviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch technician data
  useEffect(() => {
    const fetchTechnicianData = async () => {
      if (!id) {
        setError("Technician not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch technician details
        const technicianResponse =
          await TechnicianMangementService.getPublicTechnicianById(id);

        if (technicianResponse.data?.data?.technician) {
          setTechnician(technicianResponse.data.data.technician);
        } else {
          setError("Technician not found");
        }

        // TODO: Fetch reviews for this technician
        // const reviewsResponse = await ReviewsService.getTechnicianReviews(id)
        // setReviews(reviewsResponse.data?.reviews || [])
      } catch (err) {
        console.error("Error fetching technician data:", err);
        setError("Failed to load technician profile");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicianData();
  }, [id]);

  // Get document type display name
  const getDocumentDisplayName = (type: string): string => {
    const documentNames: Record<string, string> = {
      idProof: "ID Proof",
      addressProof: "Address Proof",
      passportPhoto: "Passport Photo",
      profilePhoto: "Profile Photo",
      policeVerification: "Police Verification",
      tradeLicense: "Trade License",
    };
    return documentNames[type] || type;
  };

  // Get document subtitle
  const getDocumentSubtitle = (type: string): string => {
    const subtitles: Record<string, string> = {
      idProof: "Government ID Document",
      addressProof: "Address Verification",
      passportPhoto: "Profile Picture",
      profilePhoto: "Professional Photo",
      policeVerification: "Background Check",
      tradeLicense: "Business License",
    };
    return subtitles[type] || "Document";
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarBorderOutlined
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate rating distribution (mock data for now)
  const getRatingDistribution = () => {
    // This would normally come from your API
    return {
      5: Math.floor((technician?.ratingCount || 0) * 0.8),
      4: Math.floor((technician?.ratingCount || 0) * 0.15),
      3: Math.floor((technician?.ratingCount || 0) * 0.04),
      2: Math.floor((technician?.ratingCount || 0) * 0.01),
      1: 0,
    };
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="w-full min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading technician profile...
              </span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !technician) {
    return (
      <>
        <Header />
        <div className="w-full min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {error || "Technician not found"}
              </h3>
              <button
                onClick={() => navigate("/services")}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Services
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const ratingDistribution = getRatingDistribution();

  return (
    <>
      <Header />
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Technician Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    {technician.profilePictureUrl ? (
                      <img
                        src={technician.profilePictureUrl}
                        alt={technician.displayName}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <PersonOutlineOutlined className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircleOutlineOutlined className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-2xl font-bold">
                      {technician.displayName}
                    </h1>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {technician.averageRating.toFixed(1)}
                    </span>
                    <span>({technician.ratingCount} reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {technician.services.slice(0, 3).map((service, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {technician.services.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                        +{technician.services.length - 3} more
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <CheckCircleOutlineOutlined className="w-4 h-4 mr-1" />
                    Verified by LocalFix
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-600 mb-4">
              {technician.bio ||
                `Experienced technician specializing in ${technician.services.join(
                  ", "
                )}. 
                Committed to providing quality service with attention to detail and customer satisfaction.`}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <AccessTimeOutlined className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Experience</p>
                  <p className="text-sm text-gray-600">
                    {technician.experienceYears > 0
                      ? `${technician.experienceYears} years`
                      : "Fresh"}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl mt-1">💬</span>
                <div>
                  <p className="font-medium">Languages Spoken</p>
                  <p className="text-sm text-gray-600">
                    {technician.personalInfo?.languages?.join(", ") ||
                      "English, Local Language"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Services */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Skills & Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {technician.services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <BuildOutlined className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{service}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ratings & Reviews</h2>
              {reviews.length > 0 && (
                <button className="text-blue-600 text-sm hover:underline">
                  View all →
                </button>
              )}
            </div>

            {technician.ratingCount > 0 ? (
              <>
                <div className="flex items-center space-x-8 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">
                      {technician.averageRating.toFixed(1)}
                    </div>
                    {renderStars(Math.round(technician.averageRating))}
                    <div className="text-sm text-gray-600">
                      {technician.ratingCount} reviews
                    </div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div
                        key={stars}
                        className="flex items-center space-x-2 mb-1"
                      >
                        <span className="text-sm text-gray-600 w-12">
                          {stars} stars
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${
                                (ratingDistribution[
                                  stars as keyof typeof ratingDistribution
                                ] /
                                  technician.ratingCount) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {
                            ratingDistribution[
                              stars as keyof typeof ratingDistribution
                            ]
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div
                        key={review._id}
                        className="border-t border-gray-200 pt-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {review.user?.fullName ||
                                review.userName ||
                                "Anonymous User"}
                            </p>
                            <div className="flex items-center space-x-2">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No reviews yet. Be the first to review this technician!
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review this technician!
              </div>
            )}
          </div>

          {/* Availability & Service Area */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Availability & Service Area
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="font-medium">Available</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  <AccessTimeOutlined className="w-4 h-4 inline mr-1" />
                  9:00 AM - 7:00 PM
                </div>
                <div className="text-sm text-gray-600">Monday - Saturday</div>
                <div className="text-sm text-gray-500 mt-2">
                  Usually responds within 30 minutes
                </div>
              </div>
              <div>
                <p className="font-medium mb-3">Service Areas</p>
                <div className="flex flex-wrap gap-2">
                  {technician.workAreas.length > 0 ? (
                    technician.workAreas.slice(0, 4).map((area) => (
                      <span
                        key={area}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <LocationOnOutlined className="w-4 h-4 text-blue-600 mr-1" />
                        {area}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-600">
                      Service area: {technician.serviceRadiusKm}km radius
                    </span>
                  )}
                  {technician.workAreas.length > 4 && (
                    <span className="text-sm text-gray-500">
                      +{technician.workAreas.length - 4} more areas
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Documents & Certifications */}
          {technician.documents && technician.documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Documents & Certifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {technician.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <InsertDriveFileOutlined className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">
                          {getDocumentDisplayName(doc.type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getDocumentSubtitle(doc.type)}
                        </p>
                      </div>
                    </div>
                    {doc.verified && (
                      <CheckCircleOutlineOutlined className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start space-x-2">
                <CheckCircleOutlineOutlined className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-900">
                  All documents have been verified by LocalFix team for your
                  safety.
                </p>
              </div>
            </div>
          )}

          {/* Book Technician Button */}
          <button
            onClick={() => navigate(`/booking?technicianId=${technician._id}`)}
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CalendarMonthOutlined className="w-5 h-5" />
            <span>Book This Technician</span>
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TechnicianProfile;
