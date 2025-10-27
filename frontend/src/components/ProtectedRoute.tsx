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

  console.log("🔍 ProtectedRoute Debug:", {
    pathname: location.pathname,
    isLoggedIn,
    user: user ? { 
      roles: user.roles, 
      applicationStatus: user.applicationStatus 
    } : null,
    allowedRoles
  });

  if (requireAuth && !isLoggedIn) {
    console.log("🔍 Redirecting: Not logged in");
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
    const primaryRole = user.roles[0];
    const isApplyPage = location.pathname === "/technicians/apply";

    console.log("🔍 Role check - redirecting:", {
      primaryRole,
      applicationStatus: user.applicationStatus,
      isApplyPage,
      currentPath: location.pathname
    });

    switch (primaryRole) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "serviceProvider":
        // CRITICAL: Allow access to apply page regardless of status
        if (user.applicationStatus === "approved" && !isApplyPage) {
          console.log("🔍 Redirecting to technician dashboard - approved status");
          return <Navigate to="/technicians/dashboard" replace />;
        } else if (
          ["submitted", "under_review"].includes(user.applicationStatus || "") && 
          !isApplyPage
        ) {
          console.log("🔍 Redirecting to pending dashboard - submitted/under_review status");
          return <Navigate to="/pending-technician/dashboard" replace />;
        } else if (!user.applicationStatus && !isApplyPage) {
          console.log("🔍 Redirecting to apply page - no application status");
          return <Navigate to="/technicians/application" replace />;
        }
        // If it's the apply page, allow access regardless of status
        console.log("🔍 Allowing access to apply page");
        break;
      default:
        return <Navigate to="/" replace />;
    }
  }

  console.log("🔍 Allowing access to:", location.pathname);
  return children;
};

export default ProtectedRoute;