import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  AccessTimeOutlined,
  StarBorderOutlined,
  CheckCircleOutlined,
  ArrowForwardOutlined,
} from "@mui/icons-material";
import fetchServices, { type Service } from "../data/services";
import fetchCategories, { type Category } from "../data/categories";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function for default icons (same as in data/services.ts)
  const getDefaultIcon = (serviceName: string): string => {
    const iconMap: { [key: string]: string } = {
      "AC Repair & Service": "/icons/ac.svg",
      "Washing Machine": "/icons/washing-machine.svg",
      Refrigerator: "/icons/refrigerator.svg",
      "Fan Repair": "/icons/fan.svg",
      "TV Repair": "/icons/tv.svg",
      Microwave: "/icons/microwave.svg",
    };

    return iconMap[serviceName] || "/icons/default-service.svg";
  };

  // Fetch services and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesData, categoriesData] = await Promise.all([
          fetchServices(),
          fetchCategories(),
        ]);

        console.log("📊 Loaded services:", servicesData);
        console.log("📊 Loaded categories:", categoriesData);
        console.log("🔗 Service category relationships:", 
          servicesData.map(s => ({ 
            name: s.name, 
            categoryId: s.categoryId,
            categoryName: categoriesData.find(c => c.id === s.categoryId)?.name 
          }))
        );

        setServices(servicesData);

        // Add "All Services" category at the beginning
        const allServicesCategory: Category = {
          id: "all",
          name: "All Services",
          description: "All available services",
          slug: "all",
          status: "active",
          serviceCount: servicesData.length,
          createdAt: new Date().toISOString(),
        };

        setCategories([allServicesCategory, ...categoriesData]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get icon URL for service - use backend iconUrl with fallback
  const getServiceIconUrl = (service: Service): string => {
    return service.iconUrl || getDefaultIcon(service.name);
  };

  // Get icon URL for category
  const getCategoryIconUrl = (category: Category): string => {
    if (category.id === "all") return ""; // No icon for "All Services"
    
    // Return the category's iconUrl from backend
    return category.iconUrl || "/icons/default-service.svg";
  };

  // Filter services based on selected category ID and search query
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());

    // If "All Services" is selected, show all services that match search
    if (selectedCategory === "all") {
      return matchesSearch;
    }

    // Filter by categoryId - this is the correct way since services have categoryId
    const belongsToCategory = service.categoryId === selectedCategory;
    
    return belongsToCategory && matchesSearch;
  });

  // Debug: Log filtered services when category changes
  useEffect(() => {
    console.log("🔍 Selected category ID:", selectedCategory);
    console.log("🔍 Selected category name:", 
      categories.find(cat => cat.id === selectedCategory)?.name
    );
    console.log("🔍 Filtered services count:", filteredServices.length);
    console.log("🔍 Filtered services:", filteredServices);
  }, [selectedCategory, filteredServices, categories]);

  if (loading) {
    return (
      <div className="w-full">
        <Header />
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Professional appliance repair services in Kannur with verified
              technicians
            </p>
          </div>
        </div>
        {/* Loading State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading services...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <Header />
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
          </div>
        </div>
        {/* Error State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Services
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Professional appliance repair services in Kannur with verified
              technicians and transparent pricing
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for a service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => {
              const categoryIconUrl = getCategoryIconUrl(category);
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {categoryIconUrl && (
                    <img
                      src={categoryIconUrl}
                      alt={category.name}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  {category.name}
                  {category.serviceCount && category.id !== "all" && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        selectedCategory === category.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {category.serviceCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery
                  ? `No services found matching "${searchQuery}" in ${categories.find(cat => cat.id === selectedCategory)?.name || "selected category"}`
                  : `No services available in ${categories.find(cat => cat.id === selectedCategory)?.name || "selected category"} at the moment.`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              )}
              <button
                onClick={() => setSelectedCategory("all")}
                className="mt-4 ml-4 text-blue-600 hover:text-blue-800"
              >
                View all services
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map((service) => {
                const serviceIconUrl = getServiceIconUrl(service);
                // Use real features from backend, fallback to empty array
                const features = service.features || [];
                const moreFeatures = Math.max(0, features.length - 3);

                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img
                          src={serviceIconUrl}
                          alt={service.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).src = getDefaultIcon(
                              service.name
                            );
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <StarBorderOutlined className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {service.rating || 4.5}{" "}
                          {/* Use real rating from backend */}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <AccessTimeOutlined className="w-4 h-4" />
                        <span className="text-sm">
                          {service.estimatedDuration || "2-4 hours"}
                        </span>{" "}
                        {/* Use real duration from backend */}
                      </div>
                    </div>

                    {features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            <CheckCircleOutlined className="w-3 h-3" />
                            {feature}
                          </span>
                        ))}
                        {moreFeatures > 0 && (
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{moreFeatures} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-600">
                          Starting at{" "}
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          ₹{service.avgBasePrice || 299}{" "}
                          {/* Use real price from backend */}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/service/${service.slug}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        See more
                        <ArrowForwardOutlined className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border-t border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Need help choosing the right service?
                </h2>
                <p className="text-gray-600">
                  Our customer support team is available to help you find the
                  right technician for your appliance repair needs.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Book a Service
                </button>
                <button className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200">
                  Call Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Services;