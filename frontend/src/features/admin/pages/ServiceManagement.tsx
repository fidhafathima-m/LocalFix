/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  BuildOutlined,
  AddOutlined,
  ExpandMoreOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
  FormatListBulletedOutlined,
  ChevronLeftOutlined,
} from "@mui/icons-material";
import Search from "../components/Search";
import { AddServiceModal } from "../components/categoryManagement/AddServiceModal";
import { EditServiceModal } from "../components/categoryManagement/EditServiceModal";
import { ServiceManagementService } from "../../../services/admin/ServiceManagementService";
import type {
  Service,
  CreateServiceData,
  UpdateServiceData,
} from "../../../services/common/adminApi";

const ServiceManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || {
    name: "Category",
    id: "",
  };

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const servicesPerPage = 10;

  const loadServices = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);

      const response = await ServiceManagementService.getServicesByCategory(
        category.id,
        page,
        servicesPerPage,
        search
      );

      if (response && typeof response === "object") {
        setServices(response.services || []);
        setTotalCount(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } else {
        console.error("Invalid final data structure:", response);
        setServices([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error: any) {
      console.error("Error loading services:", error);
      toast.error(error.message || "Failed to load services");
      setServices([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices(currentPage, searchQuery);
  }, [currentPage, searchQuery, category.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const handleCreateService = async (serviceData: CreateServiceData) => {
    try {
      const response = await ServiceManagementService.createService({
        ...serviceData,
        categoryId: category.id,
      });

      if (response && response.service) {
        toast.success("Service created successfully");
        setShowAddModal(false);
        await loadServices(currentPage, searchQuery); // Refresh the list
        return { success: true };
      } else {
        toast.error("Failed to create service");
        return { success: false, message: "Failed to create service" };
      }
    } catch (error: any) {
      console.error("Error creating service:", error);
      toast.error(error.message || "Failed to create service");
      return {
        success: false,
        message: error.message || "Failed to create service",
      };
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleUpdateService = async (
    serviceId: string,
    updateData: UpdateServiceData
  ) => {
    try {
      const response = await ServiceManagementService.updateService(
        serviceId,
        updateData
      );

      if (response && response.service) {
        toast.success("Service updated successfully");
        setShowEditModal(false);
        setSelectedService(null);
        await loadServices(currentPage, searchQuery); // Refresh the list
        return { success: true };
      } else {
        toast.error("Failed to update service");
        return { success: false, message: "Failed to update service" };
      }
    } catch (error: any) {
      console.error("Error updating service:", error);
      toast.error(error.message || "Failed to update service");
      return {
        success: false,
        message: error.message || "Failed to update service",
      };
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone. The service will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await ServiceManagementService.deleteService(id);

      if (response) {
        toast.success("Service deleted successfully");
        await loadServices(currentPage, searchQuery); // Refresh the list
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast.error(error.message || "Failed to delete service");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleManageItems = (service: Service) => {
    navigate("/admin/item-management", {
      state: {
        service,
        category,
      },
    });
  };

  // Stats calculations
  const totalServices = totalCount;
  const activeServices = services.filter(
    (service) => service.status === "active"
  ).length;

  if (loading && services.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Category" />
        <div className="flex-1 overflow-y-auto ml-[240px]">
          <div className="p-6">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading services...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Category" />

        <div className="flex-1 overflow-y-auto ml-[240px]">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/admin/category-management")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
              >
                <ChevronLeftOutlined className="w-5 h-5" />
                Back to Categories
              </button>
              <h1 className="text-2xl font-bold mb-1">Service Management</h1>
              <p className="text-gray-600">
                Manage services for {category.name}, view their details, and
                control service status.
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-blue-100 rounded-md mr-3">
                  <BuildOutlined className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Services</p>
                  <p className="text-xl font-bold">{totalServices}</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-green-100 rounded-md mr-3">
                  <BuildOutlined className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Services</p>
                  <p className="text-xl font-bold">{activeServices}</p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-purple-100 rounded-md mr-3">
                  <BuildOutlined className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-xl font-bold">
                    {services.reduce(
                      (sum, service) => sum + (service.itemCount || 0),
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Search and filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-auto flex-1">
                  <div className="relative">
                    <Search value={searchQuery} onChange={handleSearch} />
                  </div>
                </div>
                <div className="w-full md:w-auto flex gap-4">
                  <div className="relative">
                    <select
                      className="appearance-none w-full md:w-40 pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                    <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <AddOutlined className="w-5 h-5" />
                    Add Service
                  </button>
                </div>
              </div>
            </div>

            {/* Services table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          {/* Service Info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                {service.iconUrl ? (
                                  <img
                                    src={service.iconUrl}
                                    alt={service.name}
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <BuildOutlined className="h-5 w-5 text-gray-600" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {service.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {service.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {service.description}
                            </div>
                          </td>

                          {/* Base Price */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₹{service.avgBasePrice}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                service.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {service.status.charAt(0).toUpperCase() +
                                service.status.slice(1)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                className="p-1 rounded-full text-blue-600 hover:bg-blue-100 cursor-pointer"
                                onClick={() => handleManageItems(service)}
                                title="Manage Items"
                              >
                                <FormatListBulletedOutlined className="h-5 w-5" />
                              </button>
                              <button
                                className="p-1 rounded-full text-green-600 hover:bg-green-100 cursor-pointer"
                                onClick={() => handleEdit(service)}
                                title="Edit Service"
                              >
                                <EditOutlined className="h-5 w-5" />
                              </button>
                              <button
                                className="p-1 rounded-full text-red-600 hover:bg-red-100 cursor-pointer"
                                onClick={() => handleDelete(service.id)}
                                title="Delete Service"
                              >
                                <DeleteOutlineOutlined className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-sm text-gray-500"
                        >
                          {searchQuery ? (
                            <div>
                              <p>No services found matching "{searchQuery}"</p>
                              <button
                                onClick={() => setSearchQuery("")}
                                className="mt-2 text-blue-600 hover:text-blue-800"
                              >
                                Clear search
                              </button>
                            </div>
                          ) : (
                            <p>No services found. Create your first service!</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                  <span className="text-sm text-gray-600">
                    Showing {services.length} of {totalCount} services
                  </span>

                  <div className="flex space-x-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
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
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
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
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
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

      {showAddModal && (
        <AddServiceModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateService}
          categoryName={category.name}
        />
      )}
      {showEditModal && selectedService && (
        <EditServiceModal
          service={selectedService}
          onClose={() => {
            setShowEditModal(false);
            setSelectedService(null);
          }}
          onSubmit={handleUpdateService}
          categoryName={category.name}
        />
      )}
    </>
  );
};

export default ServiceManagement;
