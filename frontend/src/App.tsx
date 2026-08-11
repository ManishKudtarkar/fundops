import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Challans from "./pages/Challans";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import PlatformDashboard from "./pages/PlatformDashboard";
import Businesses from "./pages/Businesses";
import Employees from "./pages/Employees";
import FollowUps from "./pages/FollowUps";
import AuditLogs from "./pages/AuditLogs";
import RouteGuard from "./components/RouteGuard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes - All require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* General Dashboard - All authenticated users */}
            <Route
              path="/dashboard"
              element={
                <RouteGuard>
                  <Dashboard />
                </RouteGuard>
              }
            />

            {/* Platform Admin Routes - SUPER_ADMIN only */}
            <Route
              path="/platform-dashboard"
              element={
                <RouteGuard requiredRoles={["SUPER_ADMIN"]}>
                  <PlatformDashboard />
                </RouteGuard>
              }
            />
            <Route
              path="/businesses"
              element={
                <RouteGuard requiredRoles={["SUPER_ADMIN"]}>
                  <Businesses />
                </RouteGuard>
              }
            />

            {/* Business Routes - BUSINESS_ADMIN */}
            <Route
              path="/employees"
              element={
                <RouteGuard
                  requiredRoles={["BUSINESS_ADMIN"]}
                  requireBusiness
                >
                  <Employees />
                </RouteGuard>
              }
            />

            {/* Business Routes - All business roles */}
            <Route
              path="/customers"
              element={
                <RouteGuard
                  requiredRoles={["BUSINESS_ADMIN", "SALES", "ACCOUNTS"]}
                  requireBusiness
                >
                  <Customers />
                </RouteGuard>
              }
            />
            <Route
              path="/products"
              element={
                <RouteGuard
                  requiredRoles={["BUSINESS_ADMIN", "SALES", "WAREHOUSE"]}
                  requireBusiness
                >
                  <Products />
                </RouteGuard>
              }
            />
            <Route
              path="/inventory"
              element={
                <RouteGuard
                  requiredRoles={["BUSINESS_ADMIN", "WAREHOUSE"]}
                  requireBusiness
                >
                  <Inventory />
                </RouteGuard>
              }
            />
            <Route
              path="/challans"
              element={
                <RouteGuard
                  requiredRoles={["BUSINESS_ADMIN", "SALES", "ACCOUNTS"]}
                  requireBusiness
                >
                  <Challans />
                </RouteGuard>
              }
            />
            <Route
              path="/followups"
              element={
                <RouteGuard
                  requiredRoles={["BUSINESS_ADMIN", "SALES"]}
                  requireBusiness
                >
                  <FollowUps />
                </RouteGuard>
              }
            />
            <Route
              path="/audit"
              element={
                <RouteGuard
                  requiredRoles={["BUSINESS_ADMIN", "SUPER_ADMIN"]}
                >
                  <AuditLogs />
                </RouteGuard>
              }
            />
          </Route>
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
