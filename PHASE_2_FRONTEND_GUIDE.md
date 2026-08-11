# Phase 2: Frontend Updates - Implementation Guide

## Overview
Update the React frontend to support multi-tenancy with business context awareness.

---

## Task 1: Update Frontend Types

### File: `frontend/src/types/index.ts`

```typescript
// Add new role types
export type Role = "SUPER_ADMIN" | "BUSINESS_ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";

// Add Business interface
export interface Business {
  id: string;
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  gstin?: string;
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

// Update User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  businessId: string | null;  // NEW: null for SUPER_ADMIN
  businessName?: string;      // NEW: for UI display
  isActive: boolean;
  createdAt: string;
}

// Add FollowUp interface
export interface FollowUp {
  id: string;
  businessId: string;
  customerId: string;
  title: string;
  notes?: string;
  followUpDate: string;
  assignedTo?: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

// Add AuditLog interface
export interface AuditLog {
  id: string;
  businessId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
```

---

## Task 2: Update Auth Service

### File: `frontend/src/services/auth.service.ts`

```typescript
import { User } from "../types";

const AUTH_TOKEN_KEY = "fundops_token";
const USER_KEY = "fundops_user";

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User & { businessName?: string };
  };
}

class AuthService {
  // Store token and user with businessId
  login(token: string, user: User) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  getUser(): User | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // NEW: Get business context
  getBusinessId(): string | null {
    const user = this.getUser();
    return user?.businessId || null;
  }

  // NEW: Get business name for display
  getBusinessName(): string {
    const user = this.getUser();
    if (user?.role === "SUPER_ADMIN") {
      return "Platform Admin";
    }
    return user?.businessName || "Business";
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isSuperAdmin(): boolean {
    const user = this.getUser();
    return user?.role === "SUPER_ADMIN";
  }

  isBusinessAdmin(): boolean {
    const user = this.getUser();
    return user?.role === "BUSINESS_ADMIN";
  }

  hasBusinessContext(): boolean {
    const user = this.getUser();
    return !!user?.businessId;
  }
}

export default new AuthService();
```

---

## Task 3: Update Layout Component

### File: `frontend/src/components/Layout.tsx`

```typescript
import React from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = authService.getUser();
  const businessName = authService.getBusinessName();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar-brand">
          <h1>FundOps ERP</h1>
        </div>
        
        {/* NEW: Display business context */}
        <div className="business-context">
          <span className="business-name">{businessName}</span>
          {user?.role === "SUPER_ADMIN" && (
            <span className="badge badge-admin">Platform Admin</span>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <span className="role-badge">{user?.role}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <aside className="sidebar">
        <Navigation />
      </aside>

      <main className="content">
        {children}
      </main>
    </div>
  );
}

function Navigation() {
  const user = authService.getUser();

  // Base navigation for all users
  const baseNav = [
    { label: "Dashboard", path: "/dashboard", roles: ["BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
    { label: "Customers", path: "/customers", roles: ["BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
    { label: "Products", path: "/products", roles: ["BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
    { label: "Challans", path: "/challans", roles: ["BUSINESS_ADMIN", "SALES", "WAREHOUSE"] },
    { label: "Inventory", path: "/inventory", roles: ["BUSINESS_ADMIN", "WAREHOUSE"] },
    { label: "Follow-ups", path: "/followups", roles: ["BUSINESS_ADMIN", "SALES"] },
  ];

  // Admin navigation
  const adminNav = [
    { label: "Employees", path: "/employees", roles: ["BUSINESS_ADMIN"] },
    { label: "Businesses", path: "/businesses", roles: ["SUPER_ADMIN"] },
    { label: "Platform Dashboard", path: "/platform-dashboard", roles: ["SUPER_ADMIN"] },
  ];

  // Audit logs for admins
  const auditNav = [
    { label: "Audit Logs", path: "/audit", roles: ["BUSINESS_ADMIN", "SUPER_ADMIN"] },
  ];

  const allNav = [...baseNav, ...adminNav, ...auditNav];
  const visibleNav = allNav.filter(item => user && item.roles.includes(user.role));

  return (
    <nav className="navigation">
      {visibleNav.map(item => (
        <NavLink key={item.path} to={item.path}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

---

## Task 4: Update ProtectedRoute

### File: `frontend/src/components/ProtectedRoute.tsx`

```typescript
import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/auth.service";
import { Role } from "../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  requireBusiness?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requireBusiness = false,
}: ProtectedRouteProps) {
  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // Role check
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  // NEW: Business context check
  if (requireBusiness && !authService.hasBusinessContext()) {
    return <Navigate to="/select-business" />;
  }

  return <>{children}</>;
}

// Usage example:
// <ProtectedRoute requiredRoles={["BUSINESS_ADMIN", "SALES"]} requireBusiness>
//   <CustomersPage />
// </ProtectedRoute>
```

---

## Task 5: Update API Calls

### File: `frontend/src/services/api.service.ts` (or similar)

```typescript
import authService from "./auth.service";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = authService.getToken();
  const businessId = authService.getBusinessId();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // NEW: Add business context to query params if needed
  const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
  if (businessId && endpoint.includes("/api/")) {
    // businessId is already in JWT, but can be used for logging
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      authService.logout();
      window.location.href = "/login";
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// GET request
export function get(endpoint: string) {
  return apiCall(endpoint, { method: "GET" });
}

// POST request
export function post(endpoint: string, data: any) {
  return apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT request
export function put(endpoint: string, data: any) {
  return apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// DELETE request
export function delete_request(endpoint: string) {
  return apiCall(endpoint, { method: "DELETE" });
}
```

---

## Task 6: Create New Pages (Skeleton)

### File: `frontend/src/pages/PlatformDashboard.tsx`

```typescript
import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { get } from "../services/api.service";

export function PlatformDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await get("/dashboard");
        setMetrics(data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
      <div className="platform-dashboard">
        <h1>Platform Dashboard</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="metrics">
            {/* Display platform-wide metrics */}
            <div className="metric-card">
              <h3>Total Businesses</h3>
              <p className="metric-value">{metrics?.businessCount || 0}</p>
            </div>
            <div className="metric-card">
              <h3>Total Users</h3>
              <p className="metric-value">{metrics?.userCount || 0}</p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
```

### File: `frontend/src/pages/Employees.tsx`

```typescript
import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { get, post } from "../services/api.service";
import type { User } from "../types";

export function Employees() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await get("/employees");
        setEmployees(data.data.employees || []);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <ProtectedRoute requiredRoles={["BUSINESS_ADMIN"]} requireBusiness>
      <div className="employees-page">
        <h1>Team Members</h1>
        
        <form onSubmit={handleAddEmployee} className="add-employee-form">
          {/* Employee form */}
        </form>

        <table className="employees-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.role}</td>
                <td>{emp.isActive ? "Active" : "Inactive"}</td>
                <td>
                  <button>Edit</button>
                  <button>Reset Password</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
```

### File: `frontend/src/pages/FollowUps.tsx`

```typescript
import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { get, post } from "../services/api.service";
import type { FollowUp } from "../types";

export function FollowUps() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mainData, dashData] = await Promise.all([
          get("/followups"),
          get("/followups/dashboard/summary"),
        ]);
        setFollowUps(mainData.data.followUps || []);
        setDashboard(dashData.data);
      } catch (error) {
        console.error("Failed to fetch follow-ups", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ProtectedRoute requireBusiness>
      <div className="followups-page">
        <h1>Customer Follow-ups</h1>

        {/* Dashboard Summary */}
        <div className="followup-dashboard">
          <div className="summary-card">
            <h3>Today</h3>
            <p className="count">{dashboard?.today?.length || 0}</p>
          </div>
          <div className="summary-card overdue">
            <h3>Overdue</h3>
            <p className="count">{dashboard?.overdue?.length || 0}</p>
          </div>
          <div className="summary-card upcoming">
            <h3>Upcoming (7 days)</h3>
            <p className="count">{dashboard?.upcoming?.length || 0}</p>
          </div>
        </div>

        {/* Follow-ups List */}
        <table className="followups-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {followUps.map(fu => (
              <tr key={fu.id}>
                <td>{fu.customerId}</td>
                <td>{fu.title}</td>
                <td>{new Date(fu.followUpDate).toLocaleDateString()}</td>
                <td>{fu.status}</td>
                <td>{fu.assignedTo || "-"}</td>
                <td>
                  <button>Edit</button>
                  <button>Complete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
```

---

## Task 7: Update App.tsx Routes

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import PlatformDashboard from "./pages/PlatformDashboard";
import Employees from "./pages/Employees";
import Businesses from "./pages/Businesses";
import FollowUps from "./pages/FollowUps";
import AuditLogs from "./pages/AuditLogs";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          element={
            <ProtectedRoute>
              <Layout>
                <Outlet />
              </Layout>
            </ProtectedRoute>
          }
        >
          {/* Business dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Existing pages */}
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/challans" element={<ChallansPage />} />
          <Route path="/inventory" element={<InventoryPage />} />

          {/* NEW: Multi-tenant pages */}
          <Route
            path="/followups"
            element={<FollowUps />}
          />

          {/* BUSINESS_ADMIN pages */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute requiredRoles={["BUSINESS_ADMIN"]}>
                <Employees />
              </ProtectedRoute>
            }
          />

          {/* SUPER_ADMIN pages */}
          <Route
            path="/platform-dashboard"
            element={
              <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
                <PlatformDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/businesses"
            element={
              <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
                <Businesses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute requiredRoles={["BUSINESS_ADMIN", "SUPER_ADMIN"]}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Task 8: Environment Variables

Create or update `.env` file in frontend:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

---

## Testing Checklist

- [ ] Login with SUPER_ADMIN (businessId should be null)
- [ ] Login with BUSINESS_ADMIN (businessId should be set)
- [ ] Navigate to employees page (only BUSINESS_ADMIN should access)
- [ ] Navigate to platform dashboard (only SUPER_ADMIN should access)
- [ ] Create follow-up (business context validated)
- [ ] View audit logs (filtered by business)
- [ ] Logout and verify token cleared
- [ ] Verify UI shows correct business name
- [ ] Test role-based navigation visibility

---

## Common Issues

### Issue: businessId is null for BUSINESS_ADMIN
**Solution**: Check that login returns businessId in JWT. Verify auth middleware includes it.

### Issue: Navigation not hiding SUPER_ADMIN pages
**Solution**: Check that user role is properly retrieved from localStorage after login.

### Issue: API calls fail with 403
**Solution**: Verify JWT token is included in Authorization header. Check that businessId is passed correctly.

### Issue: businessName not showing in UI
**Solution**: Verify login response includes businessName. Update auth service to store it.

---

## Next Steps After Frontend

1. **Test end-to-end flows** with actual backend
2. **Add error handling** for API failures
3. **Implement loading states** and skeleton screens
4. **Add form validation** for all inputs
5. **Create business settings page** for BUSINESS_ADMIN
6. **Implement PDF download** for challans
7. **Add notifications** system
8. **Deploy to production** environment
