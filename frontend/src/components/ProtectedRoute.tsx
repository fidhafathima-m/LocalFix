import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";

interface ProtectedProps {
  children: React.ReactElement;
  allowedRoles: ("admin" | "user" | "serviceProvider")[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (requireAuth && !isLoggedIn) {
    if (allowedRoles.includes("admin"))
      return <Navigate to="/admin/login" replace state={{ from: location }} />;
    if (allowedRoles.includes("serviceProvider"))
      return (
        <Navigate to="/technicians/login" replace state={{ from: location }} />
      );
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check if user has at least one of the allowed roles
  if (
    requireAuth &&
    user &&
    !allowedRoles.some((role) => user.roles.includes(role))
  ) {
    // Redirect based on user's primary role (first role in array)
    const primaryRole = user.roles[0];

    switch (primaryRole) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "serviceProvider":
        // Check application status for service providers
        if (user.applicationStatus === "approved") {
          return <Navigate to="/technicians/dashboard" replace />;
        } else if (
          ["submitted", "under_review"].includes(user.applicationStatus || "")
        ) {
          return <Navigate to="/pending-technician/dashboard" replace />;
        } else {
          return <Navigate to="/technicians/application" replace />;
        }
      default:
        return <Navigate to="/" replace />;
    }
  }
  return children;
};

export default ProtectedRoute;
