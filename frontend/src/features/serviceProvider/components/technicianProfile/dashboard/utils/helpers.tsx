// utils/helpers.ts
import {
  AccessTime,
  CheckCircle,
  Build,
  DirectionsCar,
  Cancel,
  Pending,
  CheckCircleOutline,
} from "@mui/icons-material";
import type { TechnicianProfile } from "../../../../../../interface/technician/ITechnicianApi";
import type { TechnicianOrderUser } from "../types";
import type { TechnicianOrder } from "../../../../../../interface/technician/IOrderService";

// Type guard to check if value is a valid string array for languages
export function isValidStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

// Type guard for TechnicianOrderUser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTechnicianOrderUser(user: any): user is TechnicianOrderUser {
  return user && typeof user === "object" && "fullName" in user;
}

// Safe array filter helper
export const safeArrayFilter = <T,>(
  array: T[] | undefined | null,
  predicate: (item: T) => boolean
): T[] => {
  return array?.filter(predicate) || [];
};

// Safe array map helper
export const safeArrayMap = <T, U>(
  array: T[] | undefined | null,
  mapper: (item: T) => U
): U[] => {
  return array?.map(mapper) || [];
};

// Safe array slice helper
export const safeArraySlice = <T,>(
  array: T[] | undefined | null,
  start?: number,
  end?: number
): T[] => {
  return array?.slice(start, end) || [];
};

// Format currency
export const formatCurrency = (amount: number | undefined | null) => {
  const safeAmount = amount || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

// Format date
export const formatDate = (dateString: string | undefined | null) => {
  if (!dateString || dateString === "Not specified") return "Not specified";

  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime())
      ? date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Not specified";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Not specified";
  }
};

// Format date time with optional format type
export const formatDateTime = (
  dateString: string | undefined | null,
  formatType: "full" | "date" | "time" = "full"
) => {
  if (!dateString) return "Not available";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    switch (formatType) {
      case "date":
        return date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      case "time":
        return date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      default:
        return date.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

// Get customer info with better error handling
export const getCustomerInfo = (order: TechnicianOrder) => {
  try {
    if (!order.userId) {
      return {
        name: "Customer",
        phone: "Not provided",
        email: "Not provided",
      };
    }

    // Handle object case
    if (isTechnicianOrderUser(order.userId)) {
      return {
        name: order.userId.fullName || "Customer",
        phone: order.userId.phone || "Not provided",
        email: order.userId.email || "Not provided",
      };
    }

    // Handle string case - try to parse if it's JSON
    if (typeof order.userId === "string") {
      try {
        const parsedUser = JSON.parse(order.userId);
        if (isTechnicianOrderUser(parsedUser)) {
          return {
            name: parsedUser.fullName || "Customer",
            phone: parsedUser.phone || "Not provided",
            email: parsedUser.email || "Not provided",
          };
        }
      } catch {
        // If parsing fails, check if it contains user data
        if (
          order.userId.includes("fullName") ||
          order.userId.includes("phone")
        ) {
          const nameMatch = order.userId.match(
            /fullName["']?:\s*["']([^"']+)["']/
          );
          const phoneMatch = order.userId.match(
            /phone["']?:\s*["']([^"']+)["']/
          );
          const emailMatch = order.userId.match(
            /email["']?:\s*["']([^"']+)["']/
          );

          return {
            name: nameMatch ? nameMatch[1] : "Customer",
            phone: phoneMatch ? phoneMatch[1] : "Not provided",
            email: emailMatch ? emailMatch[1] : "Not provided",
          };
        }

        // If it's just a plain string (user ID)
        return {
          name: "Customer",
          phone: "Not provided",
          email: "Not provided",
        };
      }
    }
  } catch (error) {
    console.error("Error getting customer info:", error);
  }

  // Final fallback
  return {
    name: "Customer",
    phone: "Not provided",
    email: "Not provided",
  };
};

// Get languages as array
export const getLanguagesArray = (languages: unknown): string[] => {
  if (!languages) return [];

  if (isValidStringArray(languages)) {
    return languages.filter((lang) => lang && String(lang).trim() !== "");
  }

  if (typeof languages === "string") {
    if (languages.trim() === "") return [];

    try {
      const parsed = JSON.parse(languages);
      if (isValidStringArray(parsed)) {
        return parsed.filter((lang) => lang && String(lang).trim() !== "");
      }
    } catch {
      if (languages.includes(",")) {
        return languages
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang !== "");
      }
      return [languages.trim()];
    }
  }

  return [];
};

// Get location
export const getLocation = (profile: TechnicianProfile) => {
  const address = profile.personalInfo?.address;
  if (
    address?.city &&
    address?.state &&
    address.city !== "Not specified" &&
    address.state !== "Not specified"
  ) {
    return `${address.city}, ${address.state}`;
  }
  if (profile.workAreas && profile.workAreas.length > 0) {
    return profile.workAreas[0];
  }
  return "Location not set";
};

// Get status color
export const getStatusColor = (status: string | undefined) => {
  const safeStatus = status || "unknown";

  switch (safeStatus) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "accepted":
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-purple-100 text-purple-800";
    case "on_the_way":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get status icon
export const getStatusIcon = (status: string | undefined) => {
  const safeStatus = status || "unknown";

  switch (safeStatus) {
    case "pending":
      return <Pending className="h-4 w-4" />;
    case "accepted":
      return <CheckCircleOutline className="h-4 w-4" />;
    case "confirmed":
      return <CheckCircle className="h-4 w-4" />;
    case "in_progress":
      return <Build className="h-4 w-4" />;
    case "on_the_way":
      return <DirectionsCar className="h-4 w-4" />;
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
    case "refunded":
      return <Cancel className="h-4 w-4" />;
    default:
      return <AccessTime className="h-4 w-4" />;
  }
};
