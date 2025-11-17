// OrderDetails.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../../../../components/common/Footer";
import Header from "../../../../../components/common/Header";
import ActionButtons from "./sections/ActionButtons";
import CustomerInformation from "./sections/CustomerInformation";
import OrderHeader from "./sections/OrderHeader";
import PricePayment from "./sections/PricePayment";
import ServiceInformation from "./sections/ServiceInformation";
import ServiceProgress from "./sections/ServiceProcess";
import { technicianOrderService } from "../../../../../services/technician/technicianOrderService";
import type { TechnicianOrder } from "../../../../../interface/technician/IOrderService";
import { useAppSelector, useAppDispatch } from "../../../../../hooks/redux";
import { selectTechnicianProfile } from "../../../../../store/slices/technicianSlice";
import { selectUser } from "../../../../../store/slices/authSlice";
import { fetchTechnicianProfile } from "../../../../../store/thunks/technicianThunks";

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [order, setOrder] = useState<TechnicianOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const technicianProfile = useAppSelector(selectTechnicianProfile);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const loadTechnicianProfile = async () => {
      if (!technicianProfile && user) {
        try {
          console.log("Fetching technician profile...");
          await dispatch(fetchTechnicianProfile()).unwrap();
        } catch (error) {
          console.error("Failed to fetch technician profile:", error);
        }
      }
    };

    loadTechnicianProfile();
  }, [dispatch, technicianProfile, user]);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get all orders and find the specific one
        const response = await technicianOrderService.getTechnicianOrders(
          1,
          100
        );

        if (response.success && response.data.orders) {
          const foundOrder = response.data.orders.find(
            (order: TechnicianOrder) => order._id === orderId
          );

          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError("Order not found");
          }
        } else {
          setError("Failed to load orders");
        }
      } catch (err) {
        console.error("Failed to load order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId]);

  // Debug logs
  useEffect(() => {
    console.log("Technician Profile:", technicianProfile);
    console.log("Technician ID:", technicianProfile?._id);
    console.log("User:", user);
  }, [technicianProfile, user]);

  const handleUpdateOrderStatus = async (
    newStatus: string,
    reason?: string
  ) => {
    if (!orderId) return;

    try {
      await technicianOrderService.updateOrderStatus(
        orderId,
        newStatus,
        reason
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header userType="serviceProvider" isApproved={true} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header userType="serviceProvider" isApproved={true} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-600 mb-4">{error || "Order not found"}</p>
            <button
              onClick={() => navigate("/technician/dashboard?tab=orders")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Orders
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper function to get customer info
  const getCustomerInfo = (order: TechnicianOrder) => {
    if (typeof order.userId === "object" && order.userId !== null) {
      return {
        name: order.userId.fullName || "Customer",
        email: order.userId.email || "No email",
        phone: order.userId.phone || "No phone",
      };
    }
    return {
      name: "Customer",
      email: "No email",
      phone: "No phone",
    };
  };

  const customerInfo = getCustomerInfo(order);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header userType="serviceProvider" isApproved={true} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <OrderHeader
          order={order}
          onBack={() => navigate("/technician/dashboard?tab=orders")}
        />
        <ServiceProgress status={order.status} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <CustomerInformation
            customerInfo={customerInfo}
            address={order.address}
            orderId={order._id}
          />
          <ServiceInformation order={order} />
        </div>
        <PricePayment order={order} />
        <ActionButtons
          order={order}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          technicianId={technicianProfile?._id || user?._id}
        />
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetails;
