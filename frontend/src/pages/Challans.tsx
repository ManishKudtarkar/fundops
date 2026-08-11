import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Download, Eye, Plus, Printer, RefreshCw, Trash2, X } from "lucide-react";
import { apiMessage } from "../services/api";
import { getCustomers } from "../services/customer.service";
import { getProducts } from "../services/product.service";
import { confirmChallan, createChallan, deleteChallan, getChallan, getChallans } from "../services/challan.service";
import PrintableChallan from "../components/challans/PrintableChallan";
import { ChallanDocumentError } from "../services/challans/challanDocument";
import { downloadChallanPdf } from "../services/challans/challanPdf";
import type { Challan, Customer, Product } from "../types";

type DraftItem = { productId: string; quantity: number };

const skeletonWidths = [
  ["72%", "78%", "40%", "58%", "52%", "64%", "92%"],
  ["64%", "66%", "36%", "48%", "44%", "58%", "84%"],
  ["76%", "70%", "38%", "54%", "46%", "62%", "90%"],
  ["70%", "74%", "42%", "50%", "40%", "60%", "86%"],
];

export default function Challans() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [view, setView] = useState<Challan | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [customerResponse, productResponse, challanResponse] = await Promise.all([
        getCustomers({ page: 1, limit: 100 }),
        getProducts({ page: 1, limit: 100 }),
        getChallans({ page: 1, limit: 100 }),
      ]);

      setCustomers(customerResponse.customers);
      setProducts(productResponse.products);
      setChallans(challanResponse.challans);
    } catch (exception) {
      const message = apiMessage(exception, "Unable to load sales challans");

      setError(
        message === "Requested resource was not found." || message === "Challan not found"
          ? "Unable to load sales challans"
          : message
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function addItem() {
    if (products.length) {
      setItems([...items, { productId: products[0].id, quantity: 1 }]);
    }
  }

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems(items.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems(items.filter((_, currentIndex) => currentIndex !== index));
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customerId || items.length === 0) {
      return;
    }

    try {
      const created = await createChallan({ customerId, items });

      setModal(false);
      setCustomerId("");
      setItems([]);
      setView(created);

      await load();
      window.dispatchEvent(new Event("fundops:data-changed"));
    } catch (exception) {
      setError(apiMessage(exception, "Failed to create challan"));
    }
  }

  async function openChallanDetails(challan: Challan) {
    setView(challan);
    setDetailError("");
    setDetailLoading(true);

    try {
      const detailedChallan = await getChallan(challan.id);
      setView(detailedChallan);
    } catch (exception) {
      setDetailError(apiMessage(exception, "Unable to load challan details."));
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleConfirm(id: string) {
    if (!window.confirm("Confirm this challan? Inventory will be deducted.")) {
      return;
    }

    try {
      const updated = await confirmChallan(id);
      setChallans((previous) => previous.map((challan) => (challan.id === id ? updated : challan)));
      window.dispatchEvent(new Event("fundops:data-changed"));
    } catch (exception) {
      setError(apiMessage(exception, "Failed to confirm challan"));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this challan? This cannot be undone.")) {
      return;
    }

    try {
      await deleteChallan(id);
      await load();
      window.dispatchEvent(new Event("fundops:data-changed"));
    } catch (exception) {
      setError(apiMessage(exception, "Failed to delete challan"));
    }
  }

  function handlePrint() {
    if (!view) {
      return;
    }

    if (typeof window.print !== "function") {
      setDetailError("Unable to open print preview. Please try again.");
      return;
    }

    window.print();
  }

  async function handleDownloadPdf() {
    if (!view || pdfLoading) {
      return;
    }

    setPdfLoading(true);
    setDetailError("");

    try {
      await downloadChallanPdf(view);
    } catch (exception) {
      if (exception instanceof ChallanDocumentError) {
        setDetailError(exception.message);
      } else {
        setDetailError("Unable to generate the challan PDF. Please try again.");
      }
    } finally {
      setPdfLoading(false);
    }
  }

  function openCreateModal() {
    setError("");
    setView(null);
    setItems([]);
    setCustomerId("");
    setModal(true);
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const hasChallans = challans.length > 0;
  const showEmptyState = !loading && !error && !hasChallans;

  return <>
    <div className="sales-challans-page">
      <div className="page-heading sales-challans-heading">
        <div className="page-heading-copy">
          <h1>Sales Challans</h1>
          <p>Create, review and confirm customer delivery challans.</p>
        </div>

        <button className="primary-button sales-challan-create-button" onClick={openCreateModal}>
          <Plus size={16} /> New Challan
        </button>
      </div>

      {error && (
        <div className="page-alert page-alert--error" role="alert">
          <div>
            <strong>Unable to load sales challans</strong>
            <p>{error}</p>
          </div>
          <button className="secondary-button page-alert-action" onClick={load}>
            <RefreshCw size={15} /> Try Again
          </button>
        </div>
      )}

      <section className="page-card challan-card">
        <div className="card-header challan-card-header">
          <div>
            <h2>Challan List</h2>
            <p>{challans.length} challans</p>
          </div>

          <button className="secondary-button challan-refresh-button" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        <div className="table-wrapper challan-table-wrapper">
          <table className="challan-table" aria-busy={loading}>
            <thead>
              <tr>
                <th>Challan</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Qty</th>
                <th>Status</th>
                <th>Created</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading &&
                skeletonWidths.map((row, rowIndex) => (
                  <tr className="challan-skeleton-row" key={`challan-skeleton-${rowIndex}`}>
                    {row.map((width, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`}>
                        <span className="skeleton-line" style={{ width }} />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading &&
                challans.map((challan) => (
                  <tr key={challan.id}>
                    <td>
                      <strong className="challan-number">{challan.challanNumber}</strong>
                    </td>
                    <td className="challan-customer">{challan.customer?.name || challan.customerId}</td>
                    <td>{challan.items?.length || 0}</td>
                    <td>{challan.totalQuantity}</td>
                    <td>
                      <span className={`badge challan-status ${challan.status.toLowerCase()}`}>
                        {challan.status}
                      </span>
                    </td>
                    <td className="challan-created">{formatDate(challan.createdAt)}</td>
                    <td className="actions actions-right">
                      <button
                        className="table-icon-button"
                        type="button"
                        onClick={() => openChallanDetails(challan)}
                        aria-label={`View ${challan.challanNumber}`}
                        title="View challan"
                      >
                        <Eye size={16} />
                      </button>

                      {challan.status === "DRAFT" && (
                        <>
                          <button
                            className="table-action-button table-action-button--confirm"
                            type="button"
                            onClick={() => handleConfirm(challan.id)}
                          >
                            <CheckCircle2 size={15} />
                            Confirm
                          </button>

                          <button
                            className="table-icon-button table-icon-button--danger"
                            type="button"
                            onClick={() => handleDelete(challan.id)}
                            aria-label={`Delete ${challan.challanNumber}`}
                            title="Delete challan"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {showEmptyState && (
            <div className="empty-state challan-empty-state">
              <h3>No sales challans yet</h3>
              <p>Create your first challan to start tracking customer deliveries.</p>
              <button className="primary-button" onClick={openCreateModal}>
                <Plus size={16} /> New Challan
              </button>
            </div>
          )}
        </div>
      </section>

      {modal && (
        <div className="modal-backdrop">
          <div className="modal wide-modal challan-modal">
            <div className="modal-header">
              <div>
                <h2>New Sales Challan</h2>
                <p>Create a draft challan for a customer delivery.</p>
              </div>

              <button className="icon-button" type="button" onClick={() => setModal(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <form className="challan-form" onSubmit={create}>
              <label className="form-group">
                <span>Customer</span>
                <select required value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} — {customer.businessName}
                    </option>
                  ))}
                </select>
              </label>

              <div className="item-builder challan-item-builder">
                <div className="builder-title">
                  <strong>Items</strong>
                  <button type="button" className="secondary-button" onClick={addItem}>
                    <Plus size={15} /> Add Item
                  </button>
                </div>

                {items.map((item, index) => (
                  <div className="builder-row challan-builder-row" key={index}>
                    <select value={item.productId} onChange={(event) => updateItem(index, { productId: event.target.value })}>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} — {product.sku} (Stock: {product.currentStock})
                        </option>
                      ))}
                    </select>

                    <input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} />

                    <button type="button" className="icon-button table-icon-button table-icon-button--danger" onClick={() => removeItem(index)} aria-label="Remove item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {items.length === 0 && <p className="muted">Add at least one product.</p>}
              </div>

              <div className="modal-actions challan-modal-actions">
                <button type="button" className="secondary-button" onClick={() => setModal(false)}>
                  Cancel
                </button>
                <button className="primary-button" disabled={!customerId || items.length === 0}>
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {view && (
        <div className="modal-backdrop">
          <div className="modal wide-modal challan-modal challan-details-modal">
            <div className="modal-header">
              <div>
                <h2>{view.challanNumber}</h2>
                <p>{view.customer?.name || view.customerId}</p>
              </div>

              <button className="icon-button no-print" type="button" onClick={() => setView(null)} aria-label="Close challan details">
                <X size={18} />
              </button>
            </div>

            <div className="challan-details-body">
              {detailLoading && <div className="challan-detail-loading">Loading challan details...</div>}

              {!detailLoading && detailError && (
                <div className="page-alert page-alert--error challan-detail-error" role="alert">
                  <div>
                    <strong>Unable to load challan details</strong>
                    <p>{detailError}</p>
                  </div>
                </div>
              )}

              {!detailLoading && !detailError && <PrintableChallan challan={view} />}
            </div>

            <div className="modal-actions challan-modal-actions no-print">
              <button className="secondary-button" type="button" onClick={handlePrint} disabled={detailLoading || pdfLoading || !!detailError}>
                <Printer size={15} /> Print Challan
              </button>

              <button className="primary-button" type="button" onClick={handleDownloadPdf} disabled={detailLoading || pdfLoading || !!detailError}>
                <Download size={15} /> {pdfLoading ? "Generating PDF..." : "Download PDF"}
              </button>

              <button className="secondary-button" type="button" onClick={() => setView(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </>;
}
