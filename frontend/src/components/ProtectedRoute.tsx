import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  isAuthenticated,
  getStoredUser,
  getBusinessId,
} from "../services/auth.service";
import type { Role } from "../types";

interface ProtectedRouteProps {
  requiredRoles?: Role[];
  requireBusiness?: boolean;
  children?: React.ReactNode;
}

export default function ProtectedRoute({
  requiredRoles,
  requireBusiness = false,
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  const user = getStoredUser();
  const businessId = getBusinessId();

  // Check authentication
  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check role if specified
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      return (
        <div className="error-page">
          <div className="error-container">
            <h1>403 - Access Forbidden</h1>
            <p>You do not have permission to access this resource.</p>
            <p className="error-hint">Your role: {user.role}</p>
            <a href="/dashboard">Return to Dashboard</a>
          </div>
        </div>
      );
    }
  }

  // Check business context if required
  if (requireBusiness) {
    // SUPER_ADMIN doesn't require business context for some operations
    // but BUSINESS_ADMIN and others do
    if (user.role !== "SUPER_ADMIN" && !businessId) {
      return (
        <div className="error-page">
          <div className="error-container">
            <h1>404 - Not Found</h1>
            <p>Resource not found.</p>
            <a href="/dashboard">Return to Dashboard</a>
          </div>
        </div>
      );
    }
  }

  // If children are provided (used as a wrapper), render children
  if (children) {
    return <>{children}</>;
  }

  // Otherwise render Outlet (used as a layout-level route)
  return <Outlet />;
}
