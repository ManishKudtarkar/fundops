import { useEffect, useState } from "react";
import api from "../services/api";
import type { Business } from "../types";

interface BusinessWithStats extends Business {
  userCount?: number;
  customerCount?: number;
}

export default function Businesses() {
  const [businesses, setBusinesses] = useState<BusinessWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    legalName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    gstin: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    legalName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    gstin: "",
  });

  const limit = 10;

  const fetchBusinesses = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/businesses?page=${pageNum}&limit=${limit}`
      );
      setBusinesses(response.data.data.items || []);
      setTotal(response.data.data.pagination?.total || 0);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses(page);
  }, [page]);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.adminName || !formData.adminEmail || !formData.adminPassword) {
      setCreateError("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);
      await api.post("/businesses", formData);
      setShowCreateModal(false);
      setFormData({
        name: "",
        legalName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        gstin: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });
      await fetchBusinesses(1);
      setPage(1);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || "Failed to create business");
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleViewBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setShowViewModal(true);
  };

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setEditFormData({
      name: business.name,
      legalName: business.legalName || "",
      email: business.email || "",
      phone: business.phone || "",
      address: business.address || "",
      city: business.city || "",
      state: business.state || "",
      country: business.country || "",
      postalCode: business.postalCode || "",
      gstin: business.gstin || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) return;

    try {
      setUpdating(true);
      setEditError(null);
      await api.put(`/businesses/${selectedBusiness.id}`, editFormData);
      setShowEditModal(false);
      await fetchBusinesses(page);
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update business");
    } finally {
      setUpdating(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1>Businesses</h1>
          <p>Manage all registered businesses</p>
        </div>
        <button 
          className="primary-button" 
          onClick={() => setShowCreateModal(true)}
          style={{ minHeight: "44px", fontSize: "14px" }}
        >
          + Create Business
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "20px", padding: "14px 16px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", border: "1px solid #fecaca" }}>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>Loading businesses...</div>
      ) : (
        <div className="table-container" style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div className="table-wrapper">
            <table className="data-table" style={{ width: "100%" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.length > 0 ? (
                  businesses.map((business) => (
                    <tr key={business.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ fontWeight: "600", color: "#111827" }}>{business.name}</td>
                      <td>{business.email || "-"}</td>
                      <td>{business.phone || "-"}</td>
                      <td>
                        <span
                          style={{
                            padding: "5px 8px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                            backgroundColor: business.status === "ACTIVE" ? "#dcfce7" : "#fef3c7",
                            color: business.status === "ACTIVE" ? "#166534" : "#d97706"
                          }}
                        >
                          {business.status}
                        </span>
                      </td>
                      <td>{new Date(business.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: "right" }}>
                        <button 
                          className="secondary-button" 
                          style={{ marginRight: "8px" }}
                          onClick={() => handleEditBusiness(business)}
                        >
                          Edit
                        </button>
                        <button 
                          className="secondary-button"
                          onClick={() => handleViewBusiness(business)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
                      No businesses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="secondary-button"
              >
                Previous
              </button>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="secondary-button"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Business Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)"
          }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>Create New Business</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#9ca3af" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} style={{ padding: "24px" }}>
              {createError && (
                <div style={{ marginBottom: "16px", padding: "12px 14px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", fontSize: "13px", border: "1px solid #fecaca" }}>
                  {createError}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Business Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., ABC Traders"
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Legal Name</label>
                  <input
                    type="text"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleInputChange}
                    placeholder="Legal name"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="business@example.com"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="Postal code"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>GSTIN</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    placeholder="GSTIN"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>Admin User</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Admin Name *</label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    placeholder="Administrator name"
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Admin Email *</label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    placeholder="admin@business.com"
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Admin Password *</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  placeholder="Set initial password"
                  required
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="secondary-button"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Business"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Business Modal */}
      {showViewModal && selectedBusiness && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)"
          }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>Business Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#9ca3af" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>Name</label>
                  <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{selectedBusiness.name}</p>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>Legal Name</label>
                  <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{selectedBusiness.legalName || "-"}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>Email</label>
                  <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{selectedBusiness.email || "-"}</p>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>Phone</label>
                  <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{selectedBusiness.phone || "-"}</p>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>Address</label>
                <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{selectedBusiness.address || "-"}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>City</label>
                  <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{selectedBusiness.city || "-"}</p>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>State</label>
                  <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{selectedBusiness.state || "-"}</p>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>Country</label>
                  <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{selectedBusiness.country || "-"}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>Postal Code</label>
                  <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{selectedBusiness.postalCode || "-"}</p>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>GSTIN</label>
                  <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{selectedBusiness.gstin || "-"}</p>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" }}>Status</label>
                <span style={{
                  padding: "5px 8px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "700",
                  backgroundColor: selectedBusiness.status === "ACTIVE" ? "#dcfce7" : "#fef3c7",
                  color: selectedBusiness.status === "ACTIVE" ? "#166534" : "#d97706"
                }}>
                  {selectedBusiness.status}
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="secondary-button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Business Modal */}
      {showEditModal && selectedBusiness && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)"
          }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>Edit Business</h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#9ca3af" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBusiness} style={{ padding: "24px" }}>
              {editError && (
                <div style={{ marginBottom: "16px", padding: "12px 14px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", fontSize: "13px", border: "1px solid #fecaca" }}>
                  {editError}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Business Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Legal Name</label>
                  <input
                    type="text"
                    name="legalName"
                    value={editFormData.legalName}
                    onChange={handleEditInputChange}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={editFormData.city}
                    onChange={handleEditInputChange}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={editFormData.state}
                    onChange={handleEditInputChange}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={editFormData.country}
                    onChange={handleEditInputChange}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={editFormData.postalCode}
                    onChange={handleEditInputChange}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>GSTIN</label>
                  <input
                    type="text"
                    name="gstin"
                    value={editFormData.gstin}
                    onChange={handleEditInputChange}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="secondary-button"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update Business"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
