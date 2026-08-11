import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Users,
} from "lucide-react";

import api from "../services/api";

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  address: string;
  status: "LEAD" | "ACTIVE" | "INACTIVE";
  followUpDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerForm {
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  status: "LEAD" | "ACTIVE" | "INACTIVE";
  followUpDate: string;
  address: string;
  notes: string;
}

const emptyForm: CustomerForm = {
  name: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  customerType: "RETAIL",
  status: "ACTIVE",
  followUpDate: "",
  address: "",
  notes: "",
};

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [form, setForm] = useState<CustomerForm>(emptyForm);

  // --------------------------------------------------
  // LOAD CUSTOMERS
  // --------------------------------------------------

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers");

      console.log("Customers API response:", response.data);

      const data = response.data?.data;

      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (Array.isArray(data?.customers)) {
        setCustomers(data.customers);
      } else {
        setCustomers([]);
      }
    } catch (err: any) {
      console.error("Failed to load customers:", err);

      if (err?.response?.status === 401) {
        setError("Authentication required. Please login again.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Failed to load customers"
        );
      }

      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.mobile?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.businessName?.toLowerCase().includes(query) ||
        customer.gstNumber?.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  // --------------------------------------------------
  // FORM HELPERS
  // --------------------------------------------------

  const updateField = (
    field: keyof CustomerForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      businessName: customer.businessName || "",
      gstNumber: customer.gstNumber || "",
      customerType: customer.customerType || "RETAIL",
      status: customer.status || "ACTIVE",
      followUpDate: convertToDateTimeLocal(
        customer.followUpDate
      ),
      address: customer.address || "",
      notes: customer.notes || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);
    setForm(emptyForm);
  };

  // --------------------------------------------------
  // DATETIME
  // --------------------------------------------------

  const convertToDateTimeLocal = (
    value?: string | null
  ) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(
      2,
      "0"
    );

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  /**
   * IMPORTANT:
   *
   * The backend Zod schema expects:
   *
   * z.string().datetime()
   *
   * Therefore datetime-local:
   *
   * 2026-08-11T10:56
   *
   * is converted to:
   *
   * 2026-08-11T10:56:00.000Z
   */

  const convertDateForApi = (value: string) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString();
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validateForm = () => {
    if (form.name.trim().length < 2) {
      return "Customer name must be at least 2 characters.";
    }

    const mobile = form.mobile.replace(/\D/g, "");

    if (mobile.length < 10) {
      return "Mobile number must be at least 10 digits.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (form.businessName.trim().length < 2) {
      return "Business name is required.";
    }

    if (form.address.trim().length < 5) {
      return "Address must be at least 5 characters.";
    }

    return null;
  };

  // --------------------------------------------------
  // CREATE / UPDATE
  // --------------------------------------------------

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),

        mobile: form.mobile.trim(),

        email: form.email.trim(),

        businessName: form.businessName.trim(),

        gstNumber: form.gstNumber.trim(),

        customerType: form.customerType,

        status: form.status,

        address: form.address.trim(),

        notes: form.notes.trim(),

        // FIX:
        // datetime-local → ISO datetime
        followUpDate: form.followUpDate
          ? convertDateForApi(form.followUpDate)
          : "",
      };

      console.log("Customer payload:", payload);

      if (editingCustomer) {
        await api.put(
          `/customers/${editingCustomer.id}`,
          payload
        );

        setSuccess("Customer updated successfully.");
      } else {
        await api.post("/customers", payload);

        setSuccess("Customer created successfully.");
      }

      setShowModal(false);
      setEditingCustomer(null);
      setForm(emptyForm);

      await loadCustomers();
    } catch (err: any) {
      console.error(
        "Customer save error:",
        err?.response?.data || err
      );

      if (err?.response?.status === 401) {
        setError(
          "Authentication required. Please login again."
        );
      } else if (
        err?.response?.status === 400
      ) {
        setError(
          err?.response?.data?.message ||
            "Validation failed. Please check the form."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Failed to save customer."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const handleDelete = async (
    customer: Customer
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/customers/${customer.id}`
      );

      setSuccess(
        `${customer.name} deleted successfully.`
      );

      await loadCustomers();
    } catch (err: any) {
      console.error(
        "Delete customer error:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete customer."
      );
    }
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (
    value?: string | null
  ) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-IN");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="customers-page">
      {/* HEADER */}

      <div className="page-heading">
        <div>
          <h1>Customers</h1>

          <p>
            Manage your customer relationships and
            follow-ups.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateModal}
        >
          <Plus size={17} />
          Add Customer
        </button>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* ERROR */}

      {error && !showModal && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* SEARCH */}

      <div className="customers-toolbar">
        <div className="customer-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by customer name, mobile, email or business..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={loadCustomers}
          disabled={loading}
        >
          <RefreshCw
            size={15}
            className={
              loading ? "spin" : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* CUSTOMER LIST */}

      <div className="customer-card">
        <div className="customer-card-header">
          <div>
            <h2>Customer List</h2>

            <p>
              {filteredCustomers.length}{" "}
              customer
              {filteredCustomers.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <div className="customer-count">
            <Users size={18} />

            {customers.length}
          </div>
        </div>

        {loading ? (
          <div className="customer-empty">
            <RefreshCw
              size={28}
              className="spin"
            />

            <h3>Loading customers...</h3>

            <p>
              Getting customer data from the
              server.
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="customer-empty">
            <Users size={42} />

            <h3>
              {search
                ? "No customers found"
                : "No customers yet"}
            </h3>

            <p>
              {search
                ? "Try another search term."
                : "Add your first customer to get started."}
            </p>

            {!search && (
              <button
                className="primary-button"
                onClick={openCreateModal}
              >
                <Plus size={16} />
                Add Customer
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Business</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-name">
                          <strong>
                            {customer.name}
                          </strong>

                          {customer.email && (
                            <span>
                              {customer.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        {customer.mobile}
                      </td>

                      <td>
                        {customer.businessName}
                      </td>

                      <td>
                        <span className="type-badge">
                          {customer.customerType}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${customer.status.toLowerCase()}`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          customer.followUpDate
                        )}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="edit-button"
                            title="Edit customer"
                            onClick={() =>
                              openEditModal(
                                customer
                              )
                            }
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            title="Delete customer"
                            onClick={() =>
                              handleDelete(
                                customer
                              )
                            }
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="customer-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p>
                  {editingCustomer
                    ? "Update customer information."
                    : "Create a new customer record."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL ERROR */}

            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="customer-form"
            >
              <div className="form-grid">
                {/* NAME */}

                <div className="form-group">
                  <label>
                    Customer Name *
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                {/* MOBILE */}

                <div className="form-group">
                  <label>
                    Mobile Number *
                  </label>

                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(event) =>
                      updateField(
                        "mobile",
                        event.target.value
                      )
                    }
                    placeholder="9876543210"
                    required
                  />
                </div>

                {/* EMAIL */}

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="customer@example.com"
                  />
                </div>

                {/* BUSINESS */}

                <div className="form-group">
                  <label>
                    Business Name *
                  </label>

                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(event) =>
                      updateField(
                        "businessName",
                        event.target.value
                      )
                    }
                    placeholder="Enter business name"
                    required
                  />
                </div>

                {/* GST */}

                <div className="form-group">
                  <label>GST Number</label>

                  <input
                    type="text"
                    value={form.gstNumber}
                    onChange={(event) =>
                      updateField(
                        "gstNumber",
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="24ABCDE1234F1Z5"
                  />
                </div>

                {/* CUSTOMER TYPE */}

                <div className="form-group">
                  <label>
                    Customer Type *
                  </label>

                  <select
                    value={form.customerType}
                    onChange={(event) =>
                      updateField(
                        "customerType",
                        event.target.value
                      )
                    }
                  >
                    <option value="RETAIL">
                      Retail
                    </option>

                    <option value="WHOLESALE">
                      Wholesale
                    </option>

                    <option value="DISTRIBUTOR">
                      Distributor
                    </option>
                  </select>
                </div>

                {/* STATUS */}

                <div className="form-group">
                  <label>Status *</label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="LEAD">
                      Lead
                    </option>

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </div>

                {/* FOLLOW UP */}

                <div className="form-group">
                  <label>
                    Follow-up Date
                  </label>

                  <input
                    type="datetime-local"
                    value={form.followUpDate}
                    onChange={(event) =>
                      updateField(
                        "followUpDate",
                        event.target.value
                      )
                    }
                  />

                  <small className="field-help">
                    Optional
                  </small>
                </div>

                {/* ADDRESS */}

                <div className="form-group full-width">
                  <label>
                    Address *
                  </label>

                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      updateField(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="Enter complete customer address"
                    rows={4}
                    required
                  />
                </div>

                {/* NOTES */}

                <div className="form-group full-width">
                  <label>Notes</label>

                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      updateField(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Additional notes..."
                    rows={4}
                  />
                </div>
              </div>

              {/* ACTIONS */}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />

                      {editingCustomer
                        ? "Update Customer"
                        : "Create Customer"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;