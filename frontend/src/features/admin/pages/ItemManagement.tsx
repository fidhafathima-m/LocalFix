/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  InventoryOutlined,
  AddOutlined,
  ExpandMoreOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
  ChevronLeftOutlined,
} from "@mui/icons-material";
import Search from "../components/Search"
import { AddItemModal } from "../components/categoryManagement/AddItemModal";
import { EditItemModal } from "../components/categoryManagement/EditItemModal";
import { ItemManagementService } from "../../../services/admin/ItemManagementService";
import type { Item, CreateItemData, UpdateItemData } from "../../../services/common/adminApi";

const ItemManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const service = location.state?.service || {
    name: 'Service',
    id: '',
  };
  const category = location.state?.category || {
    name: 'Category',
    id: '',
  };

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // Load items from backend
  const loadItems = async (page: number = 1, search?: string) => {
    try {
      console.log("🔄 Loading items...", { page, search, serviceId: service.id });
      setLoading(true);
      
      const response = await ItemManagementService.getItemsByService(service.id, page, itemsPerPage, search);
      
      console.log("📡 Processed API Response:", response);
      
      // Now response should be the direct data: { items: [], total: 0, ... }
      if (response && typeof response === 'object') {
        console.log("✅ Items data loaded:", response.items?.length || 0);
        setItems(response.items || []);
        setTotalCount(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } else {
        console.error("❌ Invalid final data structure:", response);
        setItems([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error: any) {
      console.error("💥 Error loading items:", error);
      toast.error(error.message || "Failed to load items");
      setItems([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(currentPage, searchQuery);
  }, [currentPage, searchQuery, service.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const handleCreateItem = async (itemData: CreateItemData) => {
    try {
      const response = await ItemManagementService.createItem({
        ...itemData,
        serviceId: service.id,
      });
      
      if (response && response.item) {
        toast.success("Item created successfully");
        setShowAddModal(false);
        await loadItems(currentPage, searchQuery); // Refresh the list
        return { success: true };
      } else {
        toast.error("Failed to create item");
        return { success: false, message: "Failed to create item" };
      }
    } catch (error: any) {
      console.error("Error creating item:", error);
      toast.error(error.message || "Failed to create item");
      return { 
        success: false, 
        message: error.message || "Failed to create item" 
      };
    }
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = async (itemId: string, updateData: UpdateItemData) => {
    try {
      const response = await ItemManagementService.updateItem(itemId, updateData);
      
      if (response && response.item) {
        toast.success("Item updated successfully");
        setShowEditModal(false);
        setSelectedItem(null);
        await loadItems(currentPage, searchQuery); // Refresh the list
        return { success: true };
      } else {
        toast.error("Failed to update item");
        return { success: false, message: "Failed to update item" };
      }
    } catch (error: any) {
      console.error("Error updating item:", error);
      toast.error(error.message || "Failed to update item");
      return { 
        success: false, 
        message: error.message || "Failed to update item" 
      };
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone. The item will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await ItemManagementService.deleteItem(id);
      
      if (response) {
        toast.success("Item deleted successfully");
        await loadItems(currentPage, searchQuery); // Refresh the list
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error(error.message || "Failed to delete item");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Stats calculations - now based on real data
  const totalItems = totalCount;
  const activeItems = items.filter(item => item.isActive).length;
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);

  if (loading && items.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Category" />
        <div className="flex-1 overflow-y-auto ml-[240px]">
          <div className="p-6">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading items...</span>
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
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
              >
                <ChevronLeftOutlined className="w-5 h-5" />
                Back to Services
              </button>
              <h1 className="text-2xl font-bold mb-1">Item Management</h1>
              <p className="text-gray-600">
                Manage items for {service.name} in {category.name}, view their details, and control item status.
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-blue-100 rounded-md mr-3">
                  <InventoryOutlined className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-xl font-bold">{totalItems}</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-green-100 rounded-md mr-3">
                  <InventoryOutlined className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Items</p>
                  <p className="text-xl font-bold">{activeItems}</p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-purple-100 rounded-md mr-3">
                  <InventoryOutlined className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-xl font-bold">₹{totalValue}</p>
                </div>
              </div>
            </div>

            {/* Search and filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-auto flex-1">
                  <div className="relative">
                    <Search
                      value={searchQuery}
                      onChange={handleSearch}
                    />
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
                    Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    {items.length > 0 ? (
                      items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {/* Item Info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                <InventoryOutlined className="h-5 w-5 text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {item.description}
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">
                              {item.sku}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₹{item.price}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* Created */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                className="p-1 rounded-full text-green-600 hover:bg-green-100 cursor-pointer"
                                onClick={() => handleEdit(item)}
                                title="Edit Item"
                              >
                                <EditOutlined className="h-5 w-5" />
                              </button>
                              <button
                                className="p-1 rounded-full text-red-600 hover:bg-red-100 cursor-pointer"
                                onClick={() => handleDelete(item.id)}
                                title="Delete Item"
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
                          colSpan={7}
                          className="px-6 py-8 text-center text-sm text-gray-500"
                        >
                          {searchQuery ? (
                            <div>
                              <p>No items found matching "{searchQuery}"</p>
                              <button
                                onClick={() => setSearchQuery("")}
                                className="mt-2 text-blue-600 hover:text-blue-800"
                              >
                                Clear search
                              </button>
                            </div>
                          ) : (
                            <p>No items found. Create your first item!</p>
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
                    Showing {items.length} of {totalCount} items
                  </span>

                  <div className="flex space-x-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
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
                      onClick={() => setCurrentPage(prev => prev + 1)}
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
        <AddItemModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateItem}
          serviceName={service.name}
          categoryName={category.name}
        />
      )}
      {showEditModal && selectedItem && (
        <EditItemModal
          item={selectedItem}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdateItem}
          serviceName={service.name}
          categoryName={category.name}
        />
      )}
    </>
  );
};

export default ItemManagement;