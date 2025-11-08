import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  AccessTimeOutlined,
  StarBorderOutlined,
  CheckCircleOutlined,
  ArrowForwardOutlined,
  FilterListOutlined,
  CloseOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from "@mui/icons-material";
import fetchServices, {
  type Service,
  type ServicesResponse,
} from "../../data/services";
import fetchCategories, { type Category } from "../../data/categories";
import Footer from "../../../../components/common/Footer";
import Header from "../../../../components/common/Header";
import { useDebounce } from "../../../../hooks/useDebounce";

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Track if we're using client-side filtering
  const [isUsingClientSideFiltering, setIsUsingClientSideFiltering] =
    useState(false);

  // Helper function for default icons
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

  // Fetch services with pagination
  const loadServices = async (page: number = 1, size: number = pageSize) => {
    try {
      setLoading(true);

      // Map frontend sort values to backend sort values
      let backendSortBy = "name";
      let backendSortOrder = "asc";

      switch (sortBy) {
        case "price-low":
          backendSortBy = "price";
          backendSortOrder = "asc";
          break;
        case "price-high":
          backendSortBy = "price";
          backendSortOrder = "desc";
          break;
        case "rating":
          backendSortBy = "rating";
          backendSortOrder = "desc";
          break;
        case "name":
        default:
          backendSortBy = "name";
          backendSortOrder = "asc";
          break;
      }

      const response: ServicesResponse = await fetchServices(
        page,
        size,
        debouncedSearchQuery,
        backendSortBy,
        backendSortOrder
      );

      setServices(response.services);
      setTotalItems(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(response.pagination.currentPage);

      // Update categories with service counts
      updateCategoriesWithCounts(response.services);
    } catch (err) {
      console.error("Error loading services:", err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and update with service counts
  const updateCategoriesWithCounts = (servicesData: Service[]) => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories();

        // Calculate service counts for each category
        const categoriesWithCounts = categoriesData.map((category) => ({
          ...category,
          serviceCount: servicesData.filter(
            (service) => service.categoryId === category.id
          ).length,
        }));

        // Add "All Services" category
        const allServicesCategory: Category = {
          id: "all",
          name: "All Services",
          description: "All available services",
          slug: "all",
          status: "active",
          serviceCount: servicesData.length,
          createdAt: new Date().toISOString(),
        };

        setCategories([allServicesCategory, ...categoriesWithCounts]);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    loadCategories();
  };

  // Initial data load
  useEffect(() => {
    loadServices(1, pageSize);
  }, []);

  useEffect(() => {
    // Determine which filters use client-side vs server-side
    const hasClientSideOnlyFilters =
      selectedCategory !== "all" ||
      priceRange[0] !== 0 ||
      priceRange[1] !== 5000 ||
      ratingFilter !== null;

    const hasServerSideFilters = debouncedSearchQuery || sortBy !== "name";

    setIsUsingClientSideFiltering(hasClientSideOnlyFilters);

    if (hasServerSideFilters && !hasClientSideOnlyFilters) {
      // Server-side loading for search and sort
      loadServices(currentPage, pageSize);
    } else if (hasClientSideOnlyFilters) {
      // Client-side filtering only for specific filters
      // Don't call loadServices here - we'll use the existing services
      setCurrentPage(1);
    } else {
      // No filters or only server-side filters that need initial load
      loadServices(currentPage, pageSize);
    }
  }, [
    debouncedSearchQuery,
    pageSize,
    currentPage,
    sortBy,
    selectedCategory,
    priceRange,
    ratingFilter,
  ]);

  // Get icon URLs
  const getServiceIconUrl = (service: Service): string => {
    return service.iconUrl || getDefaultIcon(service.name);
  };

  const getCategoryIconUrl = (category: Category): string => {
    if (category.id === "all") return "";
    return category.iconUrl || "/icons/default-service.svg";
  };

  // Get price range limits from actual services
  const minPrice = 0;
  const maxPrice = 5000;

  // Apply client-side filters when needed
  const filteredServices = isUsingClientSideFiltering
    ? services.filter((service) => {
        // Category filter
        const categoryMatch =
          selectedCategory === "all" || service.categoryId === selectedCategory;

        // Price filter
        const servicePrice = service.avgBasePrice || 299;
        const priceMatch =
          servicePrice >= priceRange[0] && servicePrice <= priceRange[1];

        // Rating filter
        const ratingMatch =
          ratingFilter === null || (service.rating || 4.5) >= ratingFilter;

        return categoryMatch && priceMatch && ratingMatch;
      })
    : services;

  // Calculate display values based on filtering mode
  // Calculate display values based on filtering mode
  const displayTotalItems = isUsingClientSideFiltering
    ? filteredServices.length
    : totalItems;

  const displayTotalPages = isUsingClientSideFiltering
    ? Math.ceil(filteredServices.length / pageSize)
    : totalPages;

  // Get current page items
  const getCurrentPageServices = () => {
    if (isUsingClientSideFiltering) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return filteredServices.slice(startIndex, endIndex);
    } else {
      return services;
    }
  };

  const currentPageServices = getCurrentPageServices();

  // Check if any filter is active (including sorting)
  const isAnyFilterActive =
    isUsingClientSideFiltering ||
    sortBy !== "name" ||
    debouncedSearchQuery !== "";

  // Reset filters
  const resetFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setRatingFilter(null);
    setSortBy("name");
    setSelectedCategory("all");
    setSearchQuery("");
    setIsUsingClientSideFiltering(false);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(
      displayTotalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

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
              technicians
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for a service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {/* Show loading indicator when searching */}
                {searchQuery !== debouncedSearchQuery && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-200"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Categories & Filter Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-2 flex-1">
              {categories.map((category) => {
                const categoryIconUrl = getCategoryIconUrl(category);
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentPage(1);
                    }}
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

            {/* Filter & Sort Controls */}
            <div className="flex gap-3 items-center">
              {/* Page Size Selector */}
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1); // Reset to page 1 when sorting
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters || isAnyFilterActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FilterListOutlined className="w-5 h-5" />
                Filters
                {isAnyFilterActive && (
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                )}
              </button>
              {/* Reset Filters Button */}
              {isAnyFilterActive && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <CloseOutlined className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => {
                        setPriceRange([
                          parseInt(e.target.value),
                          priceRange[1],
                        ]);
                        setCurrentPage(1);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => {
                        setPriceRange([
                          priceRange[0],
                          parseInt(e.target.value),
                        ]);
                        setCurrentPage(1);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹{minPrice}</span>
                    <span>₹{maxPrice}</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Minimum Rating
                  </label>
                  <div className="flex gap-2">
                    {[4, 3, 2, 1].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => {
                          setRatingFilter(
                            ratingFilter === stars ? null : stars
                          );
                          setCurrentPage(1);
                        }}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                          ratingFilter === stars
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <StarBorderOutlined className="w-4 h-4" />
                        {stars}+
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Results Count */}
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {Math.min(currentPageServices.length, pageSize)} of{" "}
              {displayTotalItems} services
              {displayTotalPages > 1 &&
                ` (Page ${currentPage} of ${displayTotalPages})`}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-sm text-blue-600">Loading services...</div>
            )}
          </div>

          {currentPageServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery || isAnyFilterActive
                  ? "No services match your current filters."
                  : `No services available in ${
                      categories.find((cat) => cat.id === selectedCategory)
                        ?.name || "selected category"
                    } at the moment.`}
              </p>
              {(searchQuery || isAnyFilterActive) && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      resetFilters();
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentPageServices.map((service) => {
                  const serviceIconUrl = getServiceIconUrl(service);
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
                              (e.target as HTMLImageElement).src =
                                getDefaultIcon(service.name);
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
                            {service.rating || 4.5}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <AccessTimeOutlined className="w-4 h-4" />
                          <span className="text-sm">
                            {service.estimatedDuration || "2-4 hours"}
                          </span>
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
                            ₹{service.avgBasePrice || 299}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/service/${service.slug}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          See more
                          <ArrowForwardOutlined className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {displayTotalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing page {currentPage} of {displayTotalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 cursor-pointer"
                      }`}
                    >
                      <ChevronLeftOutlined className="w-4 h-4" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg border transition-colors ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === displayTotalPages}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                        currentPage === displayTotalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 cursor-pointer"
                      }`}
                    >
                      Next
                      <ChevronRightOutlined className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
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
                  right technician.
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
