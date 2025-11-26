/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  CategoryOutlined,
  AddOutlined,
  ExpandMoreOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from "../../../../interface/admin/IAdminApi";
import { CategoryManagementService } from "../../../../services/admin/CategoryManagementService";
import { AdminSidebar } from "../adminDashboard/actions/AdminSidebar";
import { AddCategoryModal } from "./modals/AddCategoryModal";
import { EditCategoryModal } from "./modals/EditCategoryModal";
import Search from "../adminDashboard/actions/Search";
import { useDebounce } from "../../../../hooks/useDebounce";

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const categoriesPerPage = 10;

  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearchLoading(true);
    } else {
      setSearchLoading(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  // Update the loadCategories function
  const loadCategories = async (
    page: number = 1,
    search?: string,
    status?: string
  ) => {
    try {
      setLoading(true);

      const response = await CategoryManagementService.getCategories(
        page,
        categoriesPerPage,
        search,
        status !== "All Status" ? status : undefined // Only send if not 'All Status'
      );

      if (response && Array.isArray(response.categories)) {
        setCategories(response.categories);
        setTotalCount(response.total);
        setTotalPages(response.totalPages);
      } else {
        console.error("Invalid response structure:", response);
        // Set empty state
        setCategories([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error: any) {
      console.error("Error loading categories:", error);
      toast.error(error.message || "Failed to load categories");
      // Set empty state on error
      setCategories([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(
      currentPage,
      debouncedSearchQuery,
      statusFilter !== "All Status" ? statusFilter : undefined
    );
  }, [currentPage, debouncedSearchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchQuery]);

  const handleCreateCategory = async (categoryData: CreateCategoryData) => {
    try {
      const response = await CategoryManagementService.createCategory(
        categoryData
      );

      if (response.success) {
        toast.success("Category created successfully");
        setShowAddModal(false);
        await loadCategories(currentPage, debouncedSearchQuery); // Refresh the list
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error("Error creating category:", error);
      return {
        success: false,
        message: error.message || "Failed to create category",
      };
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (
    categoryId: string,
    updateData: UpdateCategoryData
  ) => {
    try {
      const response = await CategoryManagementService.updateCategory(
        categoryId,
        updateData
      );

      if (response.success) {
        toast.success("Category updated successfully");
        setShowEditModal(false);
        setSelectedCategory(null);
        await loadCategories(currentPage, debouncedSearchQuery); // Refresh the list
        return { success: true };
      } else {
        toast.error(response.message || "Failed to update category");
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error(error.message || "Failed to update category");
      return {
        success: false,
        message: error.message || "Failed to update category",
      };
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone. The category will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await CategoryManagementService.deleteCategory(id);

      if (response.success) {
        toast.success("Category deleted successfully");
        await loadCategories(currentPage, debouncedSearchQuery); // Refresh the list
      } else {
        toast.error(response.message || "Failed to delete category");
      }
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Stats calculations
  const totalCategories = totalCount;
  const totalServices = categories.reduce(
    (sum, category) => sum + (category.serviceCount || 0),
    0
  );

  if (loading && categories.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Category" />
        <div className="flex-1 overflow-y-auto ml-[240px]">
          <div className="p-6">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading categories...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar activePage="Category" />

        {/* Main content*/}
        <div className="flex-1 overflow-y-auto ml-[240px]">
          {/* Dashboard content */}
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">Category Management</h1>
              <p className="text-gray-600">
                Manage service categories, view their details, and control
                category status.
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-blue-100 rounded-md mr-3">
                  <CategoryOutlined className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Categories</p>
                  <p className="text-xl font-bold">{totalCategories}</p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-purple-100 rounded-md mr-3">
                  <CategoryOutlined className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Services</p>
                  <p className="text-xl font-bold">{totalServices}</p>
                </div>
              </div>
            </div>

            {/* Search and filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-auto flex-1">
                  <div className="relative">
                    <Search value={searchQuery} onChange={handleSearch} />
                    {/* Add loading indicator for debounced search */}
                    {searchLoading && (
                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
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
                    Add Category
                  </button>
                </div>
              </div>
            </div>

            {/* Categories table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Services
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created On
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          {/* Category Info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                {category.iconUrl ? (
                                  <img
                                    src={category.iconUrl}
                                    alt={category.name}
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <CategoryOutlined className="h-5 w-5 text-gray-600" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {category.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {category.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {category.description}
                            </div>
                          </td>

                          {/* Services Count - You might want to fetch this from a different endpoint */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {category.serviceCount || 0}
                            </div>
                            <div className="text-sm text-gray-500">
                              services
                            </div>
                          </td>

                          {/* Created */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                className="p-1 rounded-full text-blue-600 hover:bg-blue-100 cursor-pointer"
                                onClick={() =>
                                  navigate("/admin/service-management", {
                                    state: { category },
                                  })
                                }
                                title="View Services"
                              >
                                Services
                              </button>
                              <button
                                className="p-1 rounded-full text-green-600 hover:bg-green-100 cursor-pointer"
                                onClick={() => handleEdit(category)}
                                title="Edit Category"
                              >
                                <EditOutlined className="h-5 w-5" />
                              </button>
                              <button
                                className="p-1 rounded-full text-red-600 hover:bg-red-100 cursor-pointer"
                                onClick={() => handleDelete(category.id)}
                                title="Delete Category"
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
                          colSpan={5}
                          className="px-6 py-8 text-center text-sm text-gray-500"
                        >
                          {searchQuery ? (
                            <div>
                              <p>
                                No categories found matching "{searchQuery}"
                              </p>
                              <button
                                onClick={() => setSearchQuery("")}
                                className="mt-2 text-blue-600 hover:text-blue-800"
                              >
                                Clear search
                              </button>
                            </div>
                          ) : (
                            <p>
                              No categories found. Create your first category!
                            </p>
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
                    Showing {categories.length} of {totalCount} categories
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
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateCategory}
        />
      )}
      {showEditModal && selectedCategory && (
        <EditCategoryModal
          category={selectedCategory}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleUpdateCategory}
        />
      )}
    </>
  );
};

export default CategoryManagement;
