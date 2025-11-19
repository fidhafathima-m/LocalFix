import {
  BuildOutlined,
  CalendarMonthOutlined,
  CurrencyRupeeOutlined,
  Person2Outlined,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import type { DashboardOverview } from "../../../../../interface/admin/IDashboard";
import { DashboardService } from "../../../../../services/admin/DashboardService";

const ReportCards = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const data = await DashboardService.getDashboardOverview();
        setOverview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        console.error("Error fetching dashboard overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const cards = [
    {
      title: overview ? formatCurrency(overview.totalRevenue) : "₹0",
      description: "Total Revenue",
      icon: <CurrencyRupeeOutlined />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: overview ? formatNumber(overview.totalBookings) : "0",
      description: "Total Bookings",
      icon: <CalendarMonthOutlined />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: overview ? formatNumber(overview.totalUsers) : "0",
      description: "Total Users",
      icon: <Person2Outlined />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: overview ? formatNumber(overview.totalTechnicians) : "0",
      description: "Total Technicians",
      icon: <BuildOutlined />,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 animate-pulse"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <div className="text-red-600 text-center">
          Error loading data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div
            className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center mb-3`}
          >
            {card.icon}
          </div>
          <h3 className="font-medium text-gray-800 text-2xl">{card.title}</h3>
          <p className="text-gray-500 text-sm mt-1">{card.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ReportCards;
