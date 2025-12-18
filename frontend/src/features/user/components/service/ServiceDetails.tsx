/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  GpsFixedOutlined,
  MyLocationOutlined,
  ClearOutlined,
  ChevronLeftOutlined,
} from "@mui/icons-material";
import serviceHero from "../../../../assets/images/service_hero.png";
import Footer from "../../../../components/common/Footer";
import Header from "../../../../components/common/Header";
import { ServiceManagementService } from "../../../../services/admin/ServiceManagementService";
import { TechnicianMangementService } from "../../../../services/admin/TechnicianManagementService";
import type { Service } from "../../data/services";
import LocationService from "../../../../services/common/locationService";
import { OSMLocationPicker } from "../../../../components/common/OSMLocationPicker";
import { useAppSelector } from "../../../../hooks/redux";
import {
  selectIsLoggedIn,
  selectUser,
} from "../../../../store/slices/authSlice";
import toast from "react-hot-toast";
import type { GeocodeResult } from "../../../../interface/user/ILocationService";
import { useDebounce } from "../../../../hooks/useDebounce";
import { reviewService } from "../../../../services/user/reviewService";

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

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
  distance?: number;
  isNearby?: boolean;
  hasLocation?: boolean;
  technicianLocation?: any;
  reviewStats?: ReviewStats;
}

interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  addressComponents?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
}

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const ServiceDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [, setTechnicians] = useState<Technician[]>([]);
  const [allTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>(
    []
  );
  const [showAllTechnicians, setShowAllTechnicians] = useState(false);
  const [loading, setLoading] = useState(true);
  const [techniciansLoading, setTechniciansLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");

  const debouncedLocationSearch = useDebounce(locationSearch, 500);

  const user = useAppSelector(selectUser);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [sortBy, setSortBy] = useState<
    "default" | "nearby" | "rating" | "experience"
  >("default");
  const [hasFetchedWithLocation, setHasFetchedWithLocation] = useState(false);
  const [showLocationSetup, setShowLocationSetup] = useState(false);

  const [, setCurrentPageTechnicians] = useState<Technician[]>([]);

  // Address form state
  const [addressForm, setAddressForm] = useState<Address>({
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 6,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch service details
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

  // Handle user location and technician fetching
  useEffect(() => {
    const initializeLocationAndTechnicians = async () => {
      if (!service) return;

      try {
        // Reset pagination when service changes
        setPagination((prev) => ({ ...prev, page: 1 }));

        // If user is logged in, try to get their location
        if (isLoggedIn && user) {
          const requireLocation = location.state?.requireLocation;

          try {
            const locationResponse = await LocationService.getUserLocation();

            // Check if location exists and is valid
            if (locationResponse.success && locationResponse.data) {
              const locationData = locationResponse.data;

              const userLocationData: UserLocation = {
                lat: locationData.location.coordinates[1],
                lng: locationData.location.coordinates[0],
                address: getFormattedAddress(locationData.address),
                addressComponents: {
                  street: locationData.address.street || "",
                  city: locationData.address.city || "",
                  state: locationData.address.state || "",
                  pincode: locationData.address.pincode || "",
                  landmark: locationData.address.landmark || "",
                },
              };

              setUserLocation(userLocationData);

              // Populate address form with existing location data
              setAddressForm({
                street: locationData.address.street || "",
                city: locationData.address.city || "",
                state: locationData.address.state || "",
                pincode: locationData.address.pincode || "",
                landmark: locationData.address.landmark || "",
              });

              // Fetch technicians with location priority
              await fetchTechniciansWithLocationPriority(
                service.name,
                userLocationData,
                1
              );
              setSortBy("nearby");
              setHasFetchedWithLocation(true);

              if (requireLocation) {
                navigate(location.pathname, { replace: true, state: {} });
              }
              return;
            } else {
              // Location doesn't exist but API call was successful
              console.log("No existing location found for user");
              if (requireLocation) {
                setShowLocationSetup(true);
                navigate(location.pathname, { replace: true, state: {} });
              }
            }
          } catch (error) {
            console.error("Error fetching user location:", error);
            // Don't show error toast for 404 - it's expected for new users

            if (requireLocation) {
              setShowLocationSetup(true);
              navigate(location.pathname, { replace: true, state: {} });
            }
          }
        }

        // Fallback: fetch technicians without location
        if (!hasFetchedWithLocation) {
          await fetchTechniciansForService(service.name, 1);
        }
      } catch (error) {
        console.error("Error initializing technicians:", error);
        await fetchTechniciansForService(service.name, 1);
      }
    };

    initializeLocationAndTechnicians();
  }, [
    service,
    isLoggedIn,
    user,
    location.state,
    navigate,
    location.pathname,
    hasFetchedWithLocation,
  ]);

  const fetchTechnicianReviewStats = async (
    technicianId: string
  ): Promise<ReviewStats | null> => {
    try {
      const response = await reviewService.getTechnicianReviewStats(
        technicianId
      );
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(
        `Error fetching review stats for technician ${technicianId}:`,
        error
      );
      return null;
    }
  };

  // Function to fetch review stats for multiple technicians with proper typing
  const fetchAllTechniciansReviewStats = async (
    techs: Technician[]
  ): Promise<Technician[]> => {
    try {
      const techniciansWithStats = await Promise.all(
        techs.map(async (tech) => {
          const stats = await fetchTechnicianReviewStats(tech._id);
          return {
            ...tech,
            reviewStats: stats || undefined,
          };
        })
      );
      return techniciansWithStats;
    } catch (error) {
      console.error("Error fetching review stats:", error);
      return techs; // Return original technicians if error
    }
  };

  // Helper function to format address for display
  const getFormattedAddress = (address: any): string => {
    if (!address) return "Your Location";

    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);

    return parts.length > 0 ? parts.join(", ") : "Your Location";
  };

  // Handle address form input changes
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSortChange = async (
    newSort: "default" | "nearby" | "rating" | "experience"
  ) => {
    // Reset to page 1 when changing sort
    setPagination((prev) => ({ ...prev, page: 1 }));

    // Use setTimeout to ensure state updates in correct order
    setTimeout(() => {
      setSortBy(newSort);
    }, 0);

    try {
      setTechniciansLoading(true);

      if (newSort === "nearby") {
        if (!isLoggedIn) {
          toast(
            (t) => (
              <div className="text-center">
                <p className="font-medium mb-2">Login Required</p>
                <p className="text-sm text-gray-600 mb-3">
                  Please login to see nearby technicians
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      navigate("/login", {
                        state: {
                          from: `/service/${slug}`,
                          requireLocation: true,
                        },
                      });
                      toast.dismiss(t.id);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Login Now
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("rating");
                      toast.dismiss(t.id);
                    }}
                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                  >
                    Continue without
                  </button>
                </div>
              </div>
            ),
            { duration: 8000 }
          );
          return;
        }

        if (userLocation && service) {
          await fetchTechniciansWithLocationPriority(
            service.name,
            userLocation,
            1
          );
          toast.success("Showing nearby technicians first");
        } else {
          setShowLocationSetup(true);
          return;
        }
      } else {
        // For other sorting options, fetch with new sort
        await fetchTechniciansForService(service?.name || "", 1);

        if (newSort === "default") {
          toast.success("Sorting cleared to default order");
        } else {
          toast.success(`Sorted by ${newSort}`);
        }
      }
    } catch (error) {
      console.error("Error changing sort:", error);
      toast.error("Failed to apply sorting");
    } finally {
      setTechniciansLoading(false);
    }
  };
  const handleClearSorting = () => {
    setSortBy("default");
    toast.success("Sorting cleared to default order");
  };

  const handleChangeLocation = () => {
    setShowLocationSetup(true);
  };

  const promptForLocation = () => {
    setShowLocationSetup(true);
  };

  // Handle automatic location detection
  const handleAllowLocation = async (): Promise<void> => {
    try {
      setLocationLoading(true);
      const toastId = toast.loading("Detecting your location...");

      // 1. First check if the Geolocation API is even available
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser.", {
          id: toastId,
        });
        setLocationLoading(false);
        // Fallback to manual entry
        setTimeout(() => setShowMapPicker(true), 1000);
        return;
      }

      // 2. (Optional) Check permission state first for better UX
      // This is particularly useful in Brave/Edge
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({
            name: "geolocation" as PermissionName,
          });
          console.log("Geolocation permission state:", permissionStatus.state);

          if (permissionStatus.state === "denied") {
            toast.error(
              () => (
                <div className="text-center">
                  <p className="font-medium mb-2">Location Permission Denied</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Please enable location permissions in your browser settings
                    to use auto-detection.
                  </p>
                  <button
                    onClick={() => {
                      setShowMapPicker(true);
                      toast.dismiss();
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Select Location Manually
                  </button>
                </div>
              ),
              { id: toastId, duration: 8000 }
            );
            setLocationLoading(false);
            return;
          }
        } catch (permError) {
          console.log(
            "Permission API not fully supported, continuing...",
            permError
          );
        }
      }

      // 3. Call getCurrentPosition with explicit options
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, // Try to get best accuracy
            timeout: 10000, // Wait up to 10 seconds
            maximumAge: 0, // Don't use cached position
          });
        }
      );

      const { latitude, longitude } = position.coords;

      const geocodeResult: GeocodeResult = await LocationService.reverseGeocode(
        latitude,
        longitude
      );
      const locationData: UserLocation = {
        lat: latitude,
        lng: longitude,
        address: geocodeResult.formattedAddress,
        addressComponents: {
          street: geocodeResult.addressComponents.street || "",
          city: geocodeResult.addressComponents.city || "",
          state: geocodeResult.addressComponents.state || "",
          pincode: geocodeResult.addressComponents.pincode || "",
          landmark: geocodeResult.addressComponents.landmark || "",
        },
      };

      setUserLocation(locationData);

      // Auto-fill the address form
      setAddressForm({
        street: geocodeResult.addressComponents.street || "",
        city: geocodeResult.addressComponents.city || "",
        state: geocodeResult.addressComponents.state || "",
        pincode: geocodeResult.addressComponents.pincode || "",
        landmark: geocodeResult.addressComponents.landmark || "",
      });

      // Provide default values for all required address fields
      await LocationService.updateUserLocation({
        coordinates: [longitude, latitude],
        address: {
          street: geocodeResult.addressComponents.street || "Not specified",
          city: geocodeResult.addressComponents.city || "Not specified",
          state: geocodeResult.addressComponents.state || "Not specified",
          pincode: geocodeResult.addressComponents.pincode || "Not specified",
          landmark: geocodeResult.addressComponents.landmark || "",
        },
      });

      if (service) {
        await fetchTechniciansWithLocationPriority(service.name, locationData);
        setSortBy("nearby");
      }

      setShowLocationSetup(false);
      toast.success("Location saved! Showing nearby technicians", {
        id: toastId,
      });
    } catch (error: any) {
      console.error("Geolocation error details:", {
        name: error.name,
        code: error.code,
        message: error.message,
      });

      let errorMessage = "Failed to get your location";
      let showManualOption = true;

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access was denied. Please enable location permissions in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is currently unavailable. This could be due to network or GPS issues.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Location request timed out. Please check your connection and try again.";
            break;
        }
      }

      // Check for specific browser issues
      if (
        error.message?.includes("secure context") ||
        error.message?.includes("HTTPS")
      ) {
        errorMessage =
          "Location access requires a secure connection (HTTPS). Please try from a secure site.";
        showManualOption = true;
      }

      toast.error(errorMessage, { duration: 5000 });

      // Always show manual fallback option
      if (showManualOption) {
        setTimeout(() => {
          toast(
            (t) => (
              <div className="text-center">
                <p className="text-sm mb-2">
                  Try selecting your location manually?
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setShowMapPicker(true);
                      toast.dismiss(t.id);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Select on Map
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ),
            { duration: 8000 }
          );
        }, 500);
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleUseManualAddress = async () => {
    if (
      !addressForm.street ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.pincode
    ) {
      toast.error("Please fill in all required address fields");
      return;
    }

    try {
      setLocationLoading(true);
      const toastId = toast.loading("Setting your location...");

      const defaultLocation = { lat: 10.8505, lng: 76.2711 }; // Kerala center

      const locationData: UserLocation = {
        lat: defaultLocation.lat,
        lng: defaultLocation.lng,
        address: `${addressForm.street}, ${addressForm.city}, ${addressForm.state} ${addressForm.pincode}`,
        addressComponents: {
          street: addressForm.street,
          city: addressForm.city,
          state: addressForm.state,
          pincode: addressForm.pincode,
          landmark: addressForm.landmark,
        },
      };

      setUserLocation(locationData);

      await LocationService.updateUserLocation({
        coordinates: [defaultLocation.lng, defaultLocation.lat],
        address: {
          street: addressForm.street,
          city: addressForm.city,
          state: addressForm.state,
          pincode: addressForm.pincode,
          landmark: addressForm.landmark,
        },
      });

      if (service) {
        await fetchTechniciansWithLocationPriority(service.name, locationData);
        setSortBy("nearby");
      }

      setShowLocationSetup(false);
      toast.success("Location saved! Showing technicians for your area", {
        id: toastId,
      });
    } catch (error) {
      console.error("Error saving manual address:", error);
      toast.error("Failed to save location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle location selection from map
  const handleMapLocationSelect = async (locationData: {
    lat: number;
    lng: number;
    address: string;
    addressComponents: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      landmark?: string;
    };
  }): Promise<void> => {
    try {
      setLocationLoading(true);
      const toastId = toast.loading("Saving your location...");

      const newUserLocation: UserLocation = {
        lat: locationData.lat,
        lng: locationData.lng,
        address: locationData.address,
        addressComponents: {
          street: locationData.addressComponents.street || "",
          city: locationData.addressComponents.city || "",
          state: locationData.addressComponents.state || "",
          pincode: locationData.addressComponents.pincode || "",
          landmark: locationData.addressComponents.landmark || "",
        },
      };

      setUserLocation(newUserLocation);

      // Auto-fill the address form with map data
      setAddressForm({
        street: locationData.addressComponents.street || "",
        city: locationData.addressComponents.city || "",
        state: locationData.addressComponents.state || "",
        pincode: locationData.addressComponents.pincode || "",
        landmark: locationData.addressComponents.landmark || "",
      });

      // Provide default values for all required address fields
      await LocationService.updateUserLocation({
        coordinates: [locationData.lng, locationData.lat],
        address: {
          street: locationData.addressComponents.street || "Not specified",
          city: locationData.addressComponents.city || "Not specified",
          state: locationData.addressComponents.state || "Not specified",
          pincode: locationData.addressComponents.pincode || "Not specified",
          landmark: locationData.addressComponents.landmark || "",
        },
      });

      if (service) {
        await fetchTechniciansWithLocationPriority(
          service.name,
          newUserLocation
        );
        setSortBy("nearby");
      }

      setShowMapPicker(false);
      setShowLocationSetup(false);
      toast.success("Location saved! Showing nearby technicians", {
        id: toastId,
      });
    } catch (error) {
      console.error("Error saving manual location:", error);
      toast.error("Failed to save location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  // Fetch technicians with location priority
  const fetchTechniciansWithLocationPriority = async (
    serviceName: string,
    location: UserLocation,
    page: number = 1
  ): Promise<void> => {
    try {
      setTechniciansLoading(true);
      const toastId = toast.loading("Finding technicians...");

      const response = await LocationService.getNearbyTechnicians({
        lat: location.lat,
        lng: location.lng,
        radius: 50,
        serviceName,
        page,
        limit: pagination.limit,
      });

      toast.dismiss(toastId);

      if (response.success && response.data) {
        const techniciansData = response.data.technicians || response.data;
        const paginationData = response.data.pagination;

        let technicians: Technician[] = techniciansData.map((item: any) => ({
          ...item,
          displayName: item.displayName || "Technician",
          services: item.services || [],
          experienceYears: item.experienceYears || 0,
          averageRating: item.averageRating || 0,
          ratingCount: item.ratingCount || 0,
          workAreas: item.workAreas || [],
          personalInfo: item.personalInfo || {},
          profilePictureUrl: item.profilePictureUrl,
          status: item.status || "approved",
          isNearby: item.isNearby || false,
          hasLocation: item.hasLocation || false,
          distance: item.distance || null,
          currentLocation: item.currentLocation || null,
        }));

        // Fetch review stats for all technicians
        technicians = await fetchAllTechniciansReviewStats(technicians);

        // Store all technicians for filtering/sorting
        setTechnicians(technicians);
        // Set current page technicians for display
        setCurrentPageTechnicians(technicians);
        setFilteredTechnicians(technicians);

        // Update pagination info - use the data from API response
        if (paginationData) {
          setPagination({
            page: paginationData.page || page,
            limit: paginationData.limit || pagination.limit,
            total: paginationData.total || technicians.length,
            pages: paginationData.pages || 1,
            hasNext: paginationData.hasNext || false,
            hasPrev: paginationData.hasPrev || false,
          });
        } else {
          // If no pagination data from API, assume we got all technicians
          // and need to handle pagination client-side
          const startIndex = (page - 1) * pagination.limit;
          const endIndex = startIndex + pagination.limit;
          const paginatedTechnicians = technicians.slice(startIndex, endIndex);

          setCurrentPageTechnicians(paginatedTechnicians);
          setFilteredTechnicians(paginatedTechnicians);

          setPagination({
            page,
            limit: pagination.limit,
            total: technicians.length,
            pages: Math.ceil(technicians.length / pagination.limit),
            hasNext: page < Math.ceil(technicians.length / pagination.limit),
            hasPrev: page > 1,
          });
        }

        setHasFetchedWithLocation(true);
      } else {
        await fetchTechniciansForService(serviceName, page);
        toast.success(`Showing all technicians for ${serviceName}`);
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
      await fetchTechniciansForService(serviceName, page);
      toast.error("Failed to load technicians. Showing all technicians.");
    } finally {
      setTechniciansLoading(false);
    }
  };

  const fetchTechniciansForService = async (
    serviceName: string,
    page: number = 1
  ): Promise<void> => {
    try {
      setTechniciansLoading(true);

      const serviceNameMap: Record<string, string> = {
        Refrigerator: "Refrigerator",
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

      // For sorting, we need to fetch ALL technicians and sort them globally
      // Use a large limit to get all technicians when sorting
      const effectiveLimit = sortBy !== "default" ? 1000 : pagination.limit;
      const effectivePage = sortBy !== "default" ? 1 : page;

      const response = await TechnicianMangementService.getPublicTechnicians({
        service: mappedServiceName,
        page: effectivePage,
        limit: effectiveLimit,
        search: debouncedLocationSearch || undefined,
        location: debouncedLocationSearch || undefined,
        sortBy: sortBy,
      });

      if (response && response.data) {
        const responseData = response.data.data || response.data;
        let technicians: Technician[] = responseData?.technicians || [];
        const paginationData = responseData?.pagination;

        // Fetch review stats for all technicians
        technicians = await fetchAllTechniciansReviewStats(technicians);

        // If we're sorting, handle pagination client-side
        if (sortBy !== "default" && technicians.length > 0) {
          // Apply client-side sorting as a backup (in case backend sorting fails)
          technicians = sortTechniciansClientSide(technicians, sortBy);

          // Now paginate the sorted results
          const startIndex = (page - 1) * pagination.limit;
          const endIndex = startIndex + pagination.limit;
          const paginatedTechnicians = technicians.slice(startIndex, endIndex);

          // Set the paginated technicians for display
          setCurrentPageTechnicians(paginatedTechnicians);
          setFilteredTechnicians(paginatedTechnicians);

          // Update pagination info
          setPagination({
            page: page,
            limit: pagination.limit,
            total: technicians.length,
            pages: Math.ceil(technicians.length / pagination.limit),
            hasNext: page < Math.ceil(technicians.length / pagination.limit),
            hasPrev: page > 1,
          });

          // Store all technicians for future sorting/pagination
          setTechnicians(technicians);
        } else {
          // Default behavior - backend handles pagination
          setCurrentPageTechnicians(technicians);
          setFilteredTechnicians(technicians);
          setTechnicians(technicians);

          if (paginationData) {
            setPagination({
              page: paginationData.page || page,
              limit: paginationData.limit || pagination.limit,
              total: paginationData.total || 0,
              pages: paginationData.pages || 1,
              hasNext: paginationData.hasNext || false,
              hasPrev: paginationData.hasPrev || false,
            });
          }
        }
      }
    } catch (error: any) {
      console.error("ERROR DETAILS:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      setCurrentPageTechnicians([]);
      setFilteredTechnicians([]);
      setPagination((prev) => ({
        ...prev,
        page,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
      }));

      toast.error("Failed to load technicians. Please try again.");
    } finally {
      setTechniciansLoading(false);
    }
  };

  // Add client-side sorting as backup
  const sortTechniciansClientSide = (
    technicians: Technician[],
    sortBy: string
  ): Technician[] => {
    const sorted = [...technicians];

    switch (sortBy) {
      case "rating":
        return sorted.sort((a, b) => {
          const ratingA = a.reviewStats?.averageRating || a.averageRating || 0;
          const ratingB = b.reviewStats?.averageRating || b.averageRating || 0;
          const countA = a.reviewStats?.totalReviews || a.ratingCount || 0;
          const countB = b.reviewStats?.totalReviews || b.ratingCount || 0;

          // Sort by rating (highest first)
          if (ratingB !== ratingA) return ratingB - ratingA;
          // Then by number of reviews (most first)
          if (countB !== countA) return countB - countA;
          // Then by experience (most first)
          return (b.experienceYears || 0) - (a.experienceYears || 0);
        });

      case "experience":
        return sorted.sort((a, b) => {
          const expA = a.experienceYears || 0;
          const expB = b.experienceYears || 0;
          const ratingA = a.reviewStats?.averageRating || a.averageRating || 0;
          const ratingB = b.reviewStats?.averageRating || b.averageRating || 0;

          // Sort by experience (highest first)
          if (expB !== expA) return expB - expA;
          // Then by rating (highest first)
          if (ratingB !== ratingA) return ratingB - ratingA;
          // Then by number of reviews
          const countA = a.reviewStats?.totalReviews || a.ratingCount || 0;
          const countB = b.reviewStats?.totalReviews || b.ratingCount || 0;
          return countB - countA;
        });

      default:
        return sorted;
    }
  };

  useEffect(() => {
    if (service && debouncedLocationSearch.trim() !== "") {
      const searchTechnicians = async () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        await fetchTechniciansForService(service.name, 1);
      };

      searchTechnicians();
    } else if (
      service &&
      debouncedLocationSearch.trim() === "" &&
      pagination.page === 1
    ) {
      // Only refetch if we're on page 1 and search is cleared
      fetchTechniciansForService(service.name, 1);
    }
  }, [debouncedLocationSearch, service]);

  const getTechnicianDisplayData = (tech: Technician) => {
    const city = tech.personalInfo?.address?.city || "";
    const state = tech.personalInfo?.address?.state || "";
    const workArea = tech.workAreas?.[0] || "";

    const services = tech.services || [];
    const specialization =
      services.length > 0 ? services.slice(0, 2).join(", ") : "General Service";

    const shortAddress =
      city && state
        ? `${city}, ${state}`
        : workArea
        ? workArea
        : "Location not specified";

    const realRating =
      tech.reviewStats?.averageRating || tech.averageRating || 0;
    const realRatingCount =
      tech.reviewStats?.totalReviews || tech.ratingCount || 0;

    return {
      id: tech._id,
      name: tech.displayName || "Technician",
      profilePhoto: tech.profilePictureUrl,
      rating: realRating,
      ratingCount: realRatingCount,
      experience: `${tech.experienceYears || 0} years`,
      specialization,
      shortAddress,
      isNearby: tech.isNearby || false,
      fullData: tech,
    };
  };

  const handleViewTechnicianProfile = (
    technicianId: string,
    serviceName: string
  ): void => {
    navigate(`/technicians/${technicianId}`, {
      state: {
        serviceName: serviceName,
        fromService: true,
      },
    });
  };

  const showLocationCTA = isLoggedIn && !userLocation;

  const getLocationDisplay = (userLocation: UserLocation | null) => {
    if (!userLocation) return "Your Location";

    if (userLocation.addressComponents?.city) {
      return userLocation.addressComponents.city;
    }

    return "Your Location";
  };

  const PaginationControls = () => {
    if (pagination.pages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      pagination.page - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div className="text-sm text-gray-600">
          Showing {filteredTechnicians.length} of {pagination.total} technicians
          {pagination.pages > 1 &&
            ` (Page ${pagination.page} of ${pagination.pages})`}
        </div>

        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
              !pagination.hasPrev
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            <ChevronLeftOutlined className="w-4 h-4" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex gap-1">
            {pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-lg border transition-colors ${
                  pagination.page === pageNum
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
              !pagination.hasNext
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            Next
            <ChevronRightOutlined className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const handlePageChange = async (newPage: number) => {
    if (!service || newPage < 1 || newPage > pagination.pages) return;

    try {
      setTechniciansLoading(true);

      // For nearby sorting, use location-based API
      if (userLocation && sortBy === "nearby") {
        await fetchTechniciansWithLocationPriority(
          service.name,
          userLocation,
          newPage
        );
      } else {
        // For default, rating, and experience, use regular API
        await fetchTechniciansForService(service.name, newPage);
      }

      // Scroll to technicians section
      const techniciansSection = document.getElementById("technicians-section");
      if (techniciansSection) {
        techniciansSection.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error changing page:", error);
      toast.error("Failed to load technicians");
    } finally {
      setTechniciansLoading(false);
    }
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

        {/* Service Header - IMPROVED MOBILE LAYOUT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Content Section */}
            <div className="order-2 lg:order-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {service.iconUrl ? (
                    <img
                      src={service.iconUrl}
                      alt={service.name}
                      className="w-6 h-6 lg:w-8 lg:h-8 object-contain"
                    />
                  ) : (
                    <BuildOutlined className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1">
                      <StarBorderOutlined className="w-4 h-4 lg:w-5 lg:h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-base lg:text-lg font-semibold text-gray-900">
                        {service.rating || 4.5}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <AccessTimeOutlined className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span className="text-sm lg:text-base">
                        {service.estimatedDuration || "2-4 hours"} service time
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm lg:text-base mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Price Card - Better Mobile Layout */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Base Price</p>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-600">
                      ₹{service.avgBasePrice || 299}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Starting price for basic inspection. Final price depends
                      on service type and appliance brand.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      document
                        .getElementById("technicians-section")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base"
                  >
                    Find Technicians
                  </button>
                </div>
              </div>
            </div>

            {/* Image Section - Hidden on Mobile */}
            <div className="order-1 lg:order-2 hidden lg:block relative ps-5 items-center">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8">
                Services We Provide
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircleOutlineOutlined className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1">
                        {feature}
                      </h3>
                      <p className="text-xs lg:text-sm text-gray-600">
                        Professional service for {feature.toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <InfoOutlined className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs lg:text-sm text-gray-700">
                  All services include a 30-day guarantee. Our technicians use
                  genuine parts and follow industry best practices.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Location Setup Section */}
        {showLocationSetup && (
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
                Set Your Location
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="lg:order-2">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                    Select on Map
                  </h3>
                  <div className="lg:h-[400px]">
                    {" "}
                    {/* Reduced height for desktop */}
                    <OSMLocationPicker
                      onLocationSelect={handleMapLocationSelect}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Manual Address Form - Full form always visible */}
                <div className="lg:order-1">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                    Enter Your Address
                  </h3>
                  <div className="space-y-3 lg:space-y-4">
                    {/* Street Address - Now properly positioned */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700 text-sm lg:text-base">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={addressForm.street}
                        onChange={handleAddressInputChange}
                        placeholder="House no, street, area"
                        className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                      <div>
                        <label className="block mb-1 font-medium text-gray-700 text-sm lg:text-base">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressInputChange}
                          placeholder="City"
                          className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium text-gray-700 text-sm lg:text-base">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressInputChange}
                          placeholder="State"
                          className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                      <div>
                        <label className="block mb-1 font-medium text-gray-700 text-sm lg:text-base">
                          PIN Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={addressForm.pincode}
                          onChange={handleAddressInputChange}
                          placeholder="PIN Code"
                          className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium text-gray-700 text-sm lg:text-base">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={addressForm.landmark}
                          onChange={handleAddressInputChange}
                          placeholder="Nearby landmark"
                          className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={handleUseManualAddress}
                        disabled={locationLoading}
                        className="flex-1 py-2 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {locationLoading
                          ? "Setting Location..."
                          : "Use This Address"}
                      </button>
                      <button
                        onClick={handleAllowLocation}
                        disabled={locationLoading}
                        className="px-4 py-2 lg:py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {locationLoading ? "Detecting..." : "Auto Detect"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expert Technicians */}
        <div
          className="bg-gray-50 border-t border-gray-200"
          id="technicians-section"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            {showLocationCTA && !showLocationSetup && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <MyLocationOutlined className="text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900 text-sm lg:text-base">
                        Find technicians near you
                      </p>
                      <p className="text-xs lg:text-sm text-blue-700">
                        Set your location to see closest available technicians
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={promptForLocation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
                  >
                    Set Location
                  </button>
                </div>
              </div>
            )}

            {/* Summary and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 lg:mb-8">
              {/* LEFT: Heading and Location */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Expert Technicians
                </h2>
                {userLocation && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 text-sm lg:text-base">
                      • Near {getLocationDisplay(userLocation)}
                    </span>
                    <button
                      onClick={handleChangeLocation}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs lg:text-sm font-medium cursor-pointer"
                      title="Change location"
                    >
                      <MyLocationOutlined className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>Change</span>
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT: Sorting Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as any)}
                    className="flex-1 sm:flex-none px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">Default Order</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="nearby">Nearby First</option>
                    <option value="experience">Sort by Experience</option>
                  </select>

                  {sortBy !== "default" && (
                    <button
                      onClick={handleClearSorting}
                      className="flex items-center gap-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      title="Clear sorting"
                    >
                      <ClearOutlined className="w-4 h-4" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>

                {allTechnicians.length > 6 && !showAllTechnicians && (
                  <button
                    onClick={() => setShowAllTechnicians(true)}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm lg:text-base cursor-pointer"
                  >
                    View All ({allTechnicians.length})
                  </button>
                )}
              </div>
            </div>

            {/* Location Search Bar */}
            <div className="mb-6 max-w-md">
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                <input
                  type="text"
                  placeholder="Search by location, city, or pincode..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {/* Show loading indicator when searching */}
                {locationSearch !== debouncedLocationSearch && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {locationSearch && (
                  <button
                    onClick={() => setLocationSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
              {locationSearch && (
                <p className="text-xs lg:text-sm text-gray-500 mt-2">
                  {locationSearch !== debouncedLocationSearch ? (
                    "Searching..."
                  ) : (
                    <>
                      Showing {filteredTechnicians.length} technicians matching
                      "{locationSearch}"
                    </>
                  )}
                </p>
              )}
            </div>

            {techniciansLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 text-sm lg:text-base">
                  Loading technicians...
                </span>
              </div>
            ) : filteredTechnicians.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {filteredTechnicians.map((tech) => {
                    if (!tech || !tech._id) {
                      console.warn("Invalid technician data:", tech);
                      return null;
                    }
                    const displayData = getTechnicianDisplayData(tech);
                    return (
                      <div
                        key={tech._id}
                        className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {displayData.profilePhoto ? (
                              <img
                                src={displayData.profilePhoto}
                                alt={displayData.name}
                                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg lg:text-xl font-semibold text-gray-600">
                                {displayData.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm lg:text-base">
                              {displayData.name}
                            </h3>
                            {tech.distance && (
                              <div className="flex items-center gap-2 text-xs lg:text-sm text-green-600">
                                <GpsFixedOutlined className="w-3 h-3 lg:w-4 lg:h-4" />
                                <span className="font-medium">
                                  {tech.distance < 1000
                                    ? `${Math.round(tech.distance)}m away`
                                    : `${(tech.distance / 1000).toFixed(
                                        1
                                      )}km away`}
                                </span>
                              </div>
                            )}
                            {tech.isNearby && !tech.distance && (
                              <div className="flex items-center gap-2 text-xs lg:text-sm text-green-600">
                                <GpsFixedOutlined className="w-3 h-3 lg:w-4 lg:h-4" />
                                <span className="font-medium">
                                  Nearby Technician
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <StarBorderOutlined className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs lg:text-sm font-medium text-gray-900">
                                {displayData.rating.toFixed(1)}
                              </span>
                              <span className="text-xs lg:text-sm text-gray-500">
                                ({displayData.ratingCount} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                            <LocationOnOutlined className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                            <span className="font-medium">
                              {displayData.shortAddress}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                            <EmojiEventsOutlined className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                            <span>Experience: {displayData.experience}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                            <BuildOutlined className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                            <span>
                              Specialization: {displayData.specialization}
                            </span>
                          </div>
                          {tech.workAreas && tech.workAreas.length > 0 && (
                            <div className="flex items-start gap-2 text-xs lg:text-sm text-gray-600">
                              <span className="mt-0.5">
                                <MiscellaneousServicesOutlined className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                              </span>
                              <span>
                                Areas: {tech.workAreas.slice(0, 3).join(", ")}
                                {tech.workAreas.length > 3 && "..."}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            handleViewTechnicianProfile(tech._id, service.name)
                          }
                          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base cursor-pointer"
                        >
                          View Profile
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls at Bottom */}
                <PaginationControls />
              </>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <BuildOutlined className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">
                  {locationSearch
                    ? "No Technicians Found"
                    : "No Technicians Available"}
                </h3>
                <p className="text-gray-600 text-sm lg:text-base mb-4">
                  {locationSearch
                    ? `No technicians found matching "${locationSearch}". Try a different location.`
                    : `Currently, there are no verified technicians for ${service.name}.`}
                </p>
                {locationSearch && (
                  <button
                    onClick={() => setLocationSearch("")}
                    className="px-4 lg:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2 text-sm lg:text-base"
                  >
                    Clear Search
                  </button>
                )}
                <button
                  onClick={() => navigate("/services")}
                  className="px-4 lg:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base"
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
                    setLocationSearch("");
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm lg:text-base"
                >
                  Show Less
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Location Picker Modal */}
      {showMapPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg lg:text-xl font-semibold">
                  Select Your Location
                </h3>
                <button
                  onClick={() => setShowMapPicker(false)}
                  className="text-gray-500 hover:text-gray-700 text-lg"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 text-sm lg:text-base mt-2">
                Click on the map to select your exact location and find nearby
                technicians
              </p>
            </div>
            <div className="p-4 lg:p-6">
              <OSMLocationPicker
                onLocationSelect={handleMapLocationSelect}
                className="w-full h-64 lg:h-96"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ServiceDetails;
