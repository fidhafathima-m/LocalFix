// utils/dateUtils.ts
export const formatDate = (dateString: string) => {
  if (!dateString || dateString === "Not specified") return "Not specified";

  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime())
      ? date.toLocaleDateString("en-US", {
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

export const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime())
      ? date.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Invalid date";
  } catch (error) {
    console.error(error);
    return "Invalid date";
  }
};

// utils/dateUtils.ts - Add this function
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};