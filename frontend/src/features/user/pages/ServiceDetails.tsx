/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ChevronRightOutlined,
  StarBorderOutlined,
  AccessTimeOutlined,
  CheckCircleOutlineOutlined,
  InfoOutlined,
  BuildOutlined,
  EmojiEventsOutlined,
  SearchOutlined,
  LocationOnOutlined,
  MiscellaneousServicesOutlined,
} from "@mui/icons-material";
import serviceHero from "../../../assets/images/service_hero.png";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";
import { ServiceManagementService } from "../../../services/admin/ServiceManagementService";
import { TechnicianMangementService } from "../../../services/admin/TechnicianManagementService";
import type { Service } from "../data/services";

interface Technician {
  _id: string;
  userId: string;
  displayName: string;
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
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    phone: string;
    fullName: string;
  };
  personalInfo?: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  };
  currentLocation?: {
    type: string;
    coordinates: number[];
  };
}

const ServiceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [allTechnicians, setAllTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>(
    []
  );
  const [showAllTechnicians, setShowAllTechnicians] = useState(false);
  const [loading, setLoading] = useState(true);
  const [techniciansLoading, setTechniciansLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");

  // Fetch service details and technicians
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!slug) {
        setError("Service not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const serviceResponse = await ServiceManagementService.getServiceBySlug(
          slug
        );

        if (serviceResponse && serviceResponse.service) {
          setService(serviceResponse.service);

          // Fetch technicians for this service using the SAME admin service
          await fetchTechniciansForService(serviceResponse.service.name);
        } else {
          setError("Service not found");
        }
      } catch (err) {
        console.error("Error fetching service details:", err);
        setError("Failed to load service details");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [slug]);

  // Filter technicians based on location search
  useEffect(() => {
    if (locationSearch.trim() === "") {
      setFilteredTechnicians(showAllTechnicians ? allTechnicians : technicians);
    } else {
      const searchTerm = locationSearch.toLowerCase().trim();
      const techniciansToFilter = showAllTechnicians
        ? allTechnicians
        : technicians;

      const filtered = techniciansToFilter.filter((tech) => {
        // Search in workAreas
        const workAreaMatch = tech.workAreas?.some((area) =>
          area.toLowerCase().includes(searchTerm)
        );

        // Search in personalInfo address
        const addressMatch =
          tech.personalInfo?.address?.city
            ?.toLowerCase()
            .includes(searchTerm) ||
          tech.personalInfo?.address?.state
            ?.toLowerCase()
            .includes(searchTerm) ||
          tech.personalInfo?.address?.pincode?.includes(searchTerm);

        return workAreaMatch || addressMatch;
      });

      setFilteredTechnicians(filtered);
    }
  }, [locationSearch, technicians, allTechnicians, showAllTechnicians]);

  const fetchTechniciansForService = async (serviceName: string) => {
    try {
      setTechniciansLoading(true);

      // Map service names from service details to technician services
      const serviceNameMap: Record<string, string> = {
        "Refrigerator Repair": "Refrigerator",
        "AC Repair": "AC Repair",
        "AC Installation": "AC Installation",
        "Washing Machine": "Washing Machine",
        "TV Repair": "TV Repair",
        "Water Purifier": "Water Purifier",
        "Geyser/Water Heater": "Geyser/Water Heater",
        "Fan Repair": "Fan Repair",
        "Microwave Oven": "Microwave Oven",
        Plumbing: "Plumbing",
        Electrical: "Electrical",
      };

      const mappedServiceName = serviceNameMap[serviceName] || serviceName;

      const response = await TechnicianMangementService.getPublicTechnicians(
        mappedServiceName
      );

      if (response.data && response.data.data) {
        const technicians = response.data.data.technicians || [];

        // Show only first 6 technicians with "View All" option
        const displayedTechnicians = technicians.slice(0, 6);
        setTechnicians(displayedTechnicians);
        setFilteredTechnicians(displayedTechnicians);

        // Store all technicians for "View All" functionality
        setAllTechnicians(technicians);
      } else {
        console.warn("No technicians data in response structure");
        setTechnicians([]);
        setAllTechnicians([]);
        setFilteredTechnicians([]);
      }
    } catch (error: any) {
      console.error("ERROR DETAILS:", error.message);
      setTechnicians([]);
      setAllTechnicians([]);
      setFilteredTechnicians([]);
    } finally {
      setTechniciansLoading(false);
    }
  };

  const getTechnicianDisplayData = (tech: Technician) => {
    // Get short address - prioritize city from personalInfo, then first workArea
    const city = tech.personalInfo?.address?.city;
    const state = tech.personalInfo?.address?.state;
    const workArea = tech.workAreas?.[0];

    const shortAddress =
      city && state
        ? `${city}, ${state}`
        : workArea
        ? workArea
        : "Location not specified";

    return {
      id: tech._id,
      name: tech.displayName,
      profilePhoto: tech.profilePictureUrl,
      rating: tech.averageRating,
      experience: `${tech.experienceYears || 0} years`, // Show actual experience
      specialization: tech.services.slice(0, 2).join(", "),
      shortAddress,
      fullData: tech,
    };
  };

  // Handle view technician profile
  const handleViewTechnicianProfile = (technicianId: string) => {
    navigate(`/technicians/${technicianId}`);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="w-full px-5 justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading service details...
              </span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <>
        <Header />
        <div className="w-full px-5 justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {error || "Service not found"}
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

  return (
    <>
      <Header />
      <div className="w-full px-5 justify-center">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => navigate("/services")}
                className="text-gray-600 hover:text-blue-600"
              >
                Services
              </button>
              <ChevronRightOutlined className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">{service.name}</span>
            </div>
          </div>
        </div>

        {/* Service Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {service.iconUrl ? (
                    <img
                      src={service.iconUrl}
                      alt={service.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <BuildOutlined className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <StarBorderOutlined className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold text-gray-900">
                        {service.rating || 4.5}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <AccessTimeOutlined className="w-5 h-5" />
                      <span>
                        {service.estimatedDuration || "2-4 hours"} service time
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-[105px]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Base Price</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ₹{service.avgBasePrice || 299}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Starting price for basic inspection. Final price depends
                      on service type and appliance brand.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative ps-5 items-center">
              <img
                src={serviceHero}
                alt={service.name}
                className="w-[80%] h-full object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Services We Provide */}
        {service.features && service.features.length > 0 && (
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Services We Provide
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircleOutlineOutlined className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {feature}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Professional service for {feature.toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <InfoOutlined className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  All services include a 30-day guarantee. Our technicians use
                  genuine parts and follow industry best practices.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expert Technicians */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Expert Technicians
                </h2>
                <p className="text-gray-600">
                  Our verified and skilled technicians who specialize in{" "}
                  {service.name.toLowerCase()}
                </p>
              </div>
              {allTechnicians.length > 6 && !showAllTechnicians && (
                <button
                  onClick={() => setShowAllTechnicians(true)}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium cursor-pointer"
                >
                  View All ({allTechnicians.length})
                </button>
              )}
            </div>

            {/* Location Search Bar */}
            <div className="mb-6 max-w-md">
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by location, city, or pincode..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {locationSearch && (
                  <button
                    onClick={() => setLocationSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              {locationSearch && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing {filteredTechnicians.length} technicians matching "
                  {locationSearch}"
                </p>
              )}
            </div>

            {techniciansLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading technicians...
                </span>
              </div>
            ) : filteredTechnicians.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTechnicians.map((tech) => {
                  const displayData = getTechnicianDisplayData(tech);
                  return (
                    <div
                      key={tech._id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {displayData.profilePhoto ? (
                            <img
                              src={displayData.profilePhoto}
                              alt={displayData.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xl font-semibold text-gray-600">
                              {displayData.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {displayData.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {displayData.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({tech.ratingCount || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <LocationOnOutlined className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">
                            {displayData.shortAddress}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <EmojiEventsOutlined className="w-4 h-4 text-blue-600" />
                          <span>Experience: {displayData.experience}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BuildOutlined className="w-4 h-4 text-blue-600" />
                          <span>
                            Specialization: {displayData.specialization}
                          </span>
                        </div>
                        {tech.workAreas && tech.workAreas.length > 0 && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="mt-0.5">
                              <MiscellaneousServicesOutlined className="w-4 h-4 text-blue-600" />
                            </span>
                            <span>
                              Areas: {tech.workAreas.slice(0, 3).join(", ")}
                              {tech.workAreas.length > 3 && "..."}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleViewTechnicianProfile(tech._id)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                      >
                        View Profile
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <BuildOutlined className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locationSearch
                    ? "No Technicians Found"
                    : "No Technicians Available"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {locationSearch
                    ? `No technicians found matching "${locationSearch}". Try a different location.`
                    : `Currently, there are no verified technicians for ${service.name}.`}
                </p>
                {locationSearch && (
                  <button
                    onClick={() => setLocationSearch("")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
                  >
                    Clear Search
                  </button>
                )}
                <button
                  onClick={() => navigate("/services")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse Other Services
                </button>
              </div>
            )}

            {/* Show "Show Less" button when viewing all */}
            {showAllTechnicians && allTechnicians.length > 6 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setShowAllTechnicians(false);
                    setLocationSearch(""); // Clear search when showing less
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Show Less
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ServiceDetails;
