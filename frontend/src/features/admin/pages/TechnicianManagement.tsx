import React, { useState, useEffect } from "react";
import { AdminSidebar } from "../components/AdminSidebar";
import {
  SearchOutlined,
  ExpandMoreOutlined,
  FileDownloadOutlined,
  PeopleAltOutlined,
  VerifiedUserOutlined,
  PersonOffOutlined,
  PersonAddAltOutlined,
} from "@mui/icons-material";
import Search from "../components/Search";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchApplicationsFailure,
  fetchApplicationsStart,
  fetchApplicationsSuccess,
  fetchTechniciansFailure,
  fetchTechniciansStart,
  fetchTechniciansSuccess,
} from "../../../store/slices/adminSlice";
import { TechnicianMangementService } from "../../../services/admin/TechnicianManagementService";
import { useAdminActions } from "../../../hooks/useAdminActions";
import {
  QuickActionButtons,
  type ActionType,
} from "../components/technicianManagement/ActionButtons";

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
}

interface TechnicianApplication {
  _id: string;
  technicianId: string;
  email: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  personal: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
  skills: {
    services?: string[];
    yearsOfExperience?: number;
  };
  submittedAt?: string;
  createdAt: string;
}

// Type guards to distinguish between Technician and TechnicianApplication
const isTechnician = (
  item: Technician | TechnicianApplication
): item is Technician => {
  return (
    "displayName" in item && "services" in item && "experienceYears" in item
  );
};

const isTechnicianApplication = (
  item: Technician | TechnicianApplication
): item is TechnicianApplication => {
  return "personal" in item && "skills" in item;
};

const TechnicianManagement: React.FC = () => {
  const navigate = useNavigate();
  const { technicians, applications, techniciansLoading, applicationsLoading } =
    useAppSelector((state) => state.admin);
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [activeTab, setActiveTab] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const {
    actionInProgress,
    handleStatusChange,
    handleApproveApplication,
    handleRejectApplication,
  } = useAdminActions({
    onStatusUpdate: () => {
      fetchData();
    },
    redirectOnSuccess: false,
  });

  // Fetch technicians and applications
  const fetchData = async () => {
    try {
      dispatch(fetchTechniciansStart());
      dispatch(fetchApplicationsStart());

      const [techniciansResponse, applicationsResponse] = await Promise.all([
        TechnicianMangementService.getTechnicians(),
        TechnicianMangementService.getPendingTechnicians(),
      ]);

      if (techniciansResponse.data.success && techniciansResponse.data.data) {
        dispatch(
          fetchTechniciansSuccess(
            techniciansResponse.data.data.technicians || []
          )
        );
      }

      if (applicationsResponse.data.success && applicationsResponse.data.data) {
        dispatch(
          fetchApplicationsSuccess(
            applicationsResponse.data.data.applications || []
          )
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      dispatch(fetchTechniciansFailure("Failed to load technician data"));
      dispatch(fetchApplicationsFailure("Failed to load applications data"));
      toast.error("Failed to load technician data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // Filter technicians based on active tab
  const filteredTechnicians = technicians.filter((tech) => {
    if (activeTab === "pending") {
      return false;
    } else if (activeTab === "suspended") {
      return tech.status === "suspended";
    } else if (activeTab === "active") {
      return tech.status === "approved";
    } else if (activeTab === "rejected") {
      return tech.status === "rejected";
    }
    return true;
  });

  // Filter applications for pending tab
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.personal?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.personal?.phoneNumber?.includes(searchQuery);

    const matchesService =
      serviceFilter === "All Services" ||
      (app.skills?.services?.includes(serviceFilter) ?? false);

    return matchesSearch && matchesService;
  });

  // Filter technicians with all filters
  const filteredTechs = filteredTechnicians.filter((tech) => {
    const matchesSearch =
      tech.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.user?.phone?.includes(searchQuery) ||
      tech.workAreas.some((area) =>
        area.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesService =
      serviceFilter === "All Services" || tech.services.includes(serviceFilter);

    const matchesRating =
      ratingFilter === "All Ratings" ||
      (ratingFilter === "5 Star" && tech.averageRating >= 4.8) ||
      (ratingFilter === "4+ Star" && tech.averageRating >= 4.0) ||
      (ratingFilter === "3+ Star" && tech.averageRating >= 3.0);

    return matchesSearch && matchesService && matchesRating;
  });

  const getCurrentItems = (): (Technician | TechnicianApplication)[] => {
    if (activeTab === "pending") {
      return filteredApplications;
    } else {
      return filteredTechs;
    }
  };

  // Pagination calculations
  const currentItems = getCurrentItems();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItemsPage = currentItems.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);

  // Reset to page 1 when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, serviceFilter, ratingFilter, activeTab]);

  // Count calculations
  const allTechnicians = technicians.length;
  const pendingApplications = applications.length;
  const suspendedTechnicians = technicians.filter(
    (t) => t.status === "suspended"
  ).length;
  const approvedTechnicians = technicians.filter(
    (t) => t.status === "approved"
  ).length;
  const rejectedTechnicians = technicians.filter(
    (t) => t.status === "rejected"
  ).length;

  // Service badge colors
  const getServiceColor = (service: string): string => {
    const colors: Record<string, string> = {
      "AC Repair": "bg-blue-100 text-blue-800",
      "AC Installation": "bg-blue-100 text-blue-800",
      Refrigerator: "bg-green-100 text-green-800",
      "Washing Machine": "bg-indigo-100 text-indigo-800",
      "Fan Repair": "bg-purple-100 text-purple-800",
      "TV Repair": "bg-pink-100 text-pink-800",
      "Microwave Oven": "bg-orange-100 text-orange-800",
      "Water Purifier": "bg-cyan-100 text-cyan-800",
      "Geyser/Water Heater": "bg-red-100 text-red-800",
      Plumbing: "bg-teal-100 text-teal-800",
      Electrical: "bg-amber-100 text-amber-800",
    };
    return colors[service] || "bg-gray-100 text-gray-800";
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
      rejected: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
    };

    const labels: Record<string, string> = {
      approved: "Active",
      pending: "Pending",
      suspended: "Suspended",
      rejected: "Rejected",
      active: "Active",
      inactive: "Inactive",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const handleViewDetails = (
    id: string,
    type: "technician" | "application"
  ) => {
    if (type === "technician") {
      navigate(`/admin/technicians/${id}/personal-info`);
    } else {
      navigate(`/admin/pending-applications/${id}`);
    }
  };

  // Handle edit technician
  const handleEditTechnician = (
    technicianId: string,
    technicianName: string
  ) => {
    toast.success(`Edit details for ${technicianName}`);
    // edit logic
  };

  const renderTableRows = () => {
    return currentItemsPage.map((item) => {
      if (activeTab === "pending" && isTechnicianApplication(item)) {
        return (
          <tr key={item._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">
                    {item.personal?.fullName?.charAt(0) || "A"}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.personal?.fullName || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    #{item._id.slice(-6)}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {item.personal?.phoneNumber || "N/A"}
              </div>
              <div className="text-sm text-gray-500">{item.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex flex-wrap gap-1">
                {item.skills?.services?.slice(0, 2).map((service: string) => (
                  <span
                    key={service}
                    className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getServiceColor(
                      service
                    )}`}
                  >
                    {service}
                  </span>
                ))}
                {item.skills?.services && item.skills.services.length > 2 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{item.skills.services.length - 2} more
                  </span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.skills?.yearsOfExperience || 0} years
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(
                item.submittedAt || item.createdAt
              ).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <QuickActionButtons
                type="icon"
                actions={[
                  {
                    type: "approve",
                    onClick: () =>
                      handleApproveApplication(
                        item._id,
                        item.personal?.fullName || "Applicant"
                      ),
                    disabled: actionInProgress,
                    loading: actionInProgress,
                    title: "Approve Application",
                  },
                  {
                    type: "reject",
                    onClick: () =>
                      handleRejectApplication(
                        item._id,
                        item.personal?.fullName || "Applicant"
                      ),
                    disabled: actionInProgress,
                    title: "Reject Application",
                  },
                  {
                    type: "view",
                    onClick: () => handleViewDetails(item._id, "application"),
                    title: "View Application Details",
                  },
                ]}
              />
            </td>
          </tr>
        );
      } else if (isTechnician(item)) {
        return (
          <tr key={item._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-medium">
                    {item.displayName.charAt(0)}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.displayName}
                  </div>
                  <div className="text-sm text-gray-500">
                    #{item._id.slice(-6)}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {item.user?.phone || "N/A"}
              </div>
              <div className="text-sm text-gray-500">
                {item.user?.email || item.email}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex flex-wrap gap-1">
                {item.services.slice(0, 2).map((service: string) => (
                  <span
                    key={service}
                    className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getServiceColor(
                      service
                    )}`}
                  >
                    {service}
                  </span>
                ))}
                {item.services.length > 2 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{item.services.length - 2} more
                  </span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.experienceYears} years
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {getStatusBadge(item.status)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <QuickActionButtons
                type="icon"
                actions={[
                  {
                    type: "view" as ActionType,
                    onClick: () => handleViewDetails(item._id, "technician"),
                    title: "View Technician Details",
                  },
                  {
                    type: "edit" as ActionType,
                    onClick: () =>
                      handleEditTechnician(item._id, item.displayName),
                    title: "Edit Technician",
                  },
                  ...(item.status === "approved"
                    ? [
                        {
                          type: "suspend" as ActionType,
                          onClick: () =>
                            handleStatusChange(
                              item._id,
                              "suspended",
                              item.displayName
                            ),
                          disabled: actionInProgress,
                          loading: actionInProgress,
                          title: "Suspend Technician",
                        },
                      ]
                    : []),
                  ...(item.status === "suspended"
                    ? [
                        {
                          type: "activate" as ActionType,
                          onClick: () =>
                            handleStatusChange(
                              item._id,
                              "approved",
                              item.displayName
                            ),
                          disabled: actionInProgress,
                          loading: actionInProgress,
                          title: "Activate Technician",
                        },
                      ]
                    : []),
                ]}
              />
            </td>
          </tr>
        );
      }
      return null;
    });
  };

  if (techniciansLoading || applicationsLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Technicians" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading technician data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activePage="Technicians" />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto ml-[240px]">
        {/* Header with search */}
        <Search />

        {/* Dashboard content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Technician Management</h1>
              <p className="text-gray-600">
                Manage technicians, review applications, and monitor
                performance.
              </p>
            </div>
            <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <FileDownloadOutlined className="h-4 w-4 mr-2" />
              Export Technicians
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-md mr-3">
                <PeopleAltOutlined className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Technicians</p>
                <p className="text-xl font-bold">{allTechnicians}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex items-start border border-green-100">
              <div className="p-2 bg-green-100 rounded-md mr-3">
                <VerifiedUserOutlined className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Technicians</p>
                <p className="text-xl font-bold">{approvedTechnicians}</p>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg flex items-start border border-red-100">
              <div className="p-2 bg-red-100 rounded-md mr-3">
                <PersonOffOutlined className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Suspended Technicians</p>
                <p className="text-xl font-bold">{suspendedTechnicians}</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg flex items-start border border-yellow-100">
              <div className="p-2 bg-yellow-100 rounded-md mr-3">
                <PersonAddAltOutlined className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Applications</p>
                <p className="text-xl font-bold">{pendingApplications}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 transition-colors cursor-pointer ${
                  activeTab === "active"
                    ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("active")}
              >
                <span>Active Technicians</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                  {approvedTechnicians}
                </span>
              </button>
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 transition-colors  cursor-pointer ${
                  activeTab === "pending"
                    ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("pending")}
              >
                <span>Pending Applications</span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                  {pendingApplications}
                </span>
              </button>
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 transition-colors  cursor-pointer ${
                  activeTab === "suspended"
                    ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("suspended")}
              >
                <span>Suspended Technicians</span>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                  {suspendedTechnicians}
                </span>
              </button>
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 transition-colors  cursor-pointer ${
                  activeTab === "rejected"
                    ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("rejected")}
              >
                <span>Rejected Technicians</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {rejectedTechnicians}
                </span>
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or location"
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <SearchOutlined className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <div className="relative">
                  <select
                    className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                  >
                    <option>All Services</option>
                    <option>AC Repair</option>
                    <option>AC Installation</option>
                    <option>Refrigerator</option>
                    <option>Washing Machine</option>
                    <option>Fan Repair</option>
                    <option>TV Repair</option>
                    <option>Microwave Oven</option>
                    <option>Water Purifier</option>
                    <option>Geyser/Water Heater</option>
                  </select>
                  <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="md:col-start-2 md:col-span-2">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <select
                        className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                      >
                        <option>All Ratings</option>
                        <option>5 Star</option>
                        <option>4+ Star</option>
                        <option>3+ Star</option>
                      </select>
                      <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <select className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white">
                        <option>All Locations</option>
                        <option>Kannur</option>
                        <option>Kochi</option>
                        <option>Kollam</option>
                        <option>Thiruvananthapuram</option>
                        <option>Thrissur</option>
                        <option>Malappuram</option>
                        <option>Kozhikode</option>
                      </select>
                      <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {activeTab === "pending" ? (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Services
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied On
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Technician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Services
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItemsPage.length > 0 ? (
                    renderTableRows()
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="text-lg font-medium mb-2">
                            {activeTab === "pending"
                              ? "No pending applications found"
                              : activeTab === "active"
                              ? "No active technicians found"
                              : activeTab === "suspended"
                              ? "No suspended technicians found"
                              : "No rejected technicians found"}
                          </div>
                          <div className="text-sm">
                            Try adjusting your search filters
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {currentItems.length > 0 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, currentItems.length)} of{" "}
                  {currentItems.length} entries
                </span>

                <div className="flex space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        currentPage === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianManagement;
