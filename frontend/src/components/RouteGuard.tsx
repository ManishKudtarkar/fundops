import { getStoredUser, getBusinessId } from "../services/auth.service";
import type { Role } from "../types";

interface RouteGuardProps {
  requiredRoles?: Role[];
  requireBusiness?: boolean;
  children: React.ReactNode;
}

export default function RouteGuard({
  requiredRoles,
  requireBusiness = false,
  children,
}: RouteGuardProps) {
  const user = getStoredUser();
  const businessId = getBusinessId();

  // Check role if specified
  if (requiredRoles && requiredRoles.length > 0) {
    if (!user || !requiredRoles.includes(user.role)) {
      return (
        <div className="error-page">
          <div className="error-container">
            <h1>403 - Access Forbidden</h1>
            <p>You do not have permission to access this resource.</p>
            {user && <p className="error-hint">Your role: {user.role}</p>}
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
    if (user?.role !== "SUPER_ADMIN" && !businessId) {
      return (
        <div className="error-page">
          <div className="error-container">
            <h1>404 - Not Found</h1>
            <p>Business context required to access this resource.</p>
            <a href="/dashboard">Return to Dashboard</a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
