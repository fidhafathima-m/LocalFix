import { useState, useEffect } from "react";
import { AdminSidebar } from "../adminDashboard/actions/AdminSidebar";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { Modal } from "./Modal";
import type {
  CreateSubscriptionData,
  Subscription,
  UpdateSubscriptionData,
} from "../../../../interface/admin/ISubscription";
import { SubscriptionManagementService } from "../../../../services/admin/SubscriptionManagementService";
import toast from "react-hot-toast";

export function SubscriptionPlansAdmin() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    durationMonths: "",
    commissionRate: "",
    features: "",
    status: "active",
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await SubscriptionManagementService.getSubscriptions();
      setPlans(response.subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to fetch subscription plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (plan: Subscription) => {
    setSelectedPlan(plan);
    setIsViewModalOpen(true);
  };

  const handleEdit = (plan: Subscription) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      durationMonths: plan.durationMonths.toString(),
      commissionRate: plan.commissionRate.toString(),
      features: plan.features.join(", "),
      status: plan.status,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (plan: Subscription) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedPlan(null);
    setFormData({
      name: "",
      price: "",
      durationMonths: "",
      commissionRate: "",
      features: "",
      status: "active",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateSubscription = async () => {
    try {
      const subscriptionData: CreateSubscriptionData = {
        name: formData.name,
        price: parseFloat(formData.price),
        durationMonths: parseInt(formData.durationMonths),
        commissionRate: parseFloat(formData.commissionRate),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f),
        status: formData.status as "active" | "inactive",
      };

      await SubscriptionManagementService.createSubscription(subscriptionData);
      toast.success(
        `Subscription ${subscriptionData.name} created successfully!`
      );
      await fetchSubscriptions();
      handleCloseModals();
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to create subscription plan");
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedPlan) return;

    try {
      const updateData: UpdateSubscriptionData = {
        name: formData.name,
        price: parseFloat(formData.price),
        durationMonths: parseInt(formData.durationMonths),
        commissionRate: parseFloat(formData.commissionRate),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f),
        status: formData.status as "active" | "inactive",
      };

      await SubscriptionManagementService.updateSubscription(
        selectedPlan.id,
        updateData
      );
      toast.success(`Subscription ${updateData.name} updated successfully!`);
      await fetchSubscriptions();
      handleCloseModals();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription plan");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPlan) return;

    try {
      await SubscriptionManagementService.deleteSubscription(selectedPlan.id);
      toast.success(`Subscription ${selectedPlan.name} deleted successfully!`);
      await fetchSubscriptions();
      handleCloseModals();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Failed to delete subscription plan");
    }
  };

  const getDurationDisplay = (durationMonths: number) => {
    if (durationMonths === 1) return "1 month";
    if (durationMonths < 12) return `${durationMonths} months`;
    if (durationMonths === 12) return "1 year";
    return `${durationMonths / 12} years`;
  };

  const getStatusBadge = (status: string) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activePage="Subscription Plans" />
        <div className="flex-1 overflow-y-auto ml-[240px]">
          <main className="flex-1 p-8">
            <div className="max-w-6xl">
              <div className="animate-pulse">Loading subscription plans...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePage="Subscription Plans" />

      <div className="flex-1 overflow-y-auto ml-[240px]">
        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Subscription Plans Management
                </h1>
                <p className="text-gray-600">
                  Define subscription plans and commission rates for technicians
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
              >
                <AddOutlined className="w-4 h-4" />
                Add Plan
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {plan.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          ₹{plan.price}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getDurationDisplay(plan.durationMonths)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {plan.commissionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(plan.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleView(plan)}
                            className="text-green-500 hover:text-green-600 transition-colors"
                            title="View Plan"
                          >
                            <VisibilityOutlined className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(plan)}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                            title="Edit Plan"
                          >
                            <EditOutlined className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Delete Plan"
                          >
                            <DeleteOutlined className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {plans.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">No subscription plans found.</p>
              </div>
            )}

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                About Commission Rates
              </h3>
              <p className="text-sm text-blue-800">
                The commission rate defines the percentage that technicians pay
                for each service booking. Technicians can get reduced or zero
                commission rates based on their plan. Default commission rate is
                10%.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Add Plan Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        title="Add Subscription Plan"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateSubscription();
          }}
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Plan Name
            </label>
            <input
              type="text"
              placeholder="Enter plan name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Price (₹)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Duration (Months)
            </label>
            <input
              type="number"
              placeholder="1"
              value={formData.durationMonths}
              onChange={(e) =>
                handleInputChange("durationMonths", e.target.value)
              }
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div className="relative">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Commission Rate (%)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.commissionRate}
                onChange={(e) =>
                  handleInputChange("commissionRate", e.target.value)
                }
                className="px-4 py-2.5 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="100"
                step="0.1"
                required
              />
            </div>
            <span className="absolute right-3 bottom-3 text-gray-500">%</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Features (comma separated)
            </label>
            <input
              type="text"
              placeholder="Feature 1, Feature 2, Feature 3"
              value={formData.features}
              onChange={(e) => handleInputChange("features", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <p className="text-xs text-gray-500">
            Default commission for unsubscribed technicians is 10%. Set to 0%
            for no commission.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModals}
              className="px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-blue-500 hover:text-blue-600 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
            >
              Save Plan
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        title="Edit Subscription Plan"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateSubscription();
          }}
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Plan Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Price (₹)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Duration (Months)
            </label>
            <input
              type="number"
              value={formData.durationMonths}
              onChange={(e) =>
                handleInputChange("durationMonths", e.target.value)
              }
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div className="relative">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={formData.commissionRate}
                onChange={(e) =>
                  handleInputChange("commissionRate", e.target.value)
                }
                className="px-4 py-2.5 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="100"
                step="0.1"
                required
              />
            </div>
            <span className="absolute right-3 bottom-3 text-gray-500">%</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Features (comma separated)
            </label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => handleInputChange("features", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <p className="text-xs text-gray-500">
            Default commission for unsubscribed technicians is 10%. Set to 0%
            for no commission.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModals}
              className="px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-blue-500 hover:text-blue-600 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
            >
              Update Plan
            </button>
          </div>
        </form>
      </Modal>

      {/* View Plan Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        title="Subscription Plan Details"
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Plan Name
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedPlan.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Slug
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedPlan.slug}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Price
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  ₹{selectedPlan.price}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Duration
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {getDurationDisplay(selectedPlan.durationMonths)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Commission Rate
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedPlan.commissionRate}%
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedPlan.status)}
                </div>
              </div>
            </div>

            {selectedPlan.features && selectedPlan.features.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Features
                </label>
                <ul className="mt-2 space-y-1">
                  {selectedPlan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-900 flex items-start"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Created At
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(selectedPlan.createdAt).toLocaleDateString()} at{" "}
                  {new Date(selectedPlan.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(selectedPlan.updatedAt).toLocaleDateString()} at{" "}
                  {new Date(selectedPlan.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCloseModals}
                className="px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-blue-500 hover:text-blue-600 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Delete Subscription Plan"
      >
        {selectedPlan && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Are you sure you want to delete this subscription plan?
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      This action cannot be undone. This will permanently delete
                      the <strong>{selectedPlan.name}</strong> subscription
                      plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModals}
                className="px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-700 hover:text-gray-800 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
              >
                Delete Plan
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
