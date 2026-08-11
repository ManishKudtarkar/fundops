import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Search,
  X,
  History,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { apiMessage } from "../services/api";
import { createStockMovement, getProducts } from "../services/product.service";
import { getInventoryMovements } from "../services/inventory.service";
import type { Product, StockMovement } from "../types";

function Badge({ type }: { type: string }) {
  const cls =
    type === "IN"
      ? "badge confirmed"
      : type === "OUT"
      ? "badge cancelled"
      : "badge draft";
  return <span className={cls}>{type}</span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="form-group">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function Inventory() {
  // Stock table state
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [error, setError] = useState("");

  // Stock movement modal state
  const [selected, setSelected] = useState<Product | null>(null);
  const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  // Movement history state
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movTotal, setMovTotal] = useState(0);
  const [movLoading, setMovLoading] = useState(false);
  const [movError, setMovError] = useState("");
  const [showHistory, setShowHistory] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

  // History filters
  const [hSearch, setHSearch] = useState("");
  const [hProduct, setHProduct] = useState("");
  const [hType, setHType] = useState("");
  const [hDateFrom, setHDateFrom] = useState("");
  const [hDateTo, setHDateTo] = useState("");
  const [hPage, setHPage] = useState(1);
  const H_LIMIT = 20;

  async function loadProducts() {
    setError("");
    try {
      const r = await getProducts({
        search: search || undefined,
        lowStock,
        page: 1,
        limit: 100,
      });
      setProducts(r.products);
    } catch (e) {
      setError(apiMessage(e, "Failed to load inventory"));
    }
  }

  async function loadMovements(page = hPage) {
    setMovLoading(true);
    setMovError("");
    try {
      const filters: Record<string, unknown> = { page, limit: H_LIMIT };
      if (hSearch) filters.search = hSearch;
      if (hProduct) filters.productId = hProduct;
      if (hType) filters.movementType = hType;
      if (hDateFrom) filters.dateFrom = hDateFrom;
      if (hDateTo) filters.dateTo = hDateTo;

      const r = await getInventoryMovements(filters as Parameters<typeof getInventoryMovements>[0]);
      setMovements(r.movements);
      setMovTotal(r.pagination.total);
    } catch (e) {
      setMovError(apiMessage(e, "Failed to load movement history"));
    } finally {
      setMovLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(loadProducts, 200);
    return () => clearTimeout(t);
  }, [search, lowStock]);

  useEffect(() => {
    if (showHistory) loadMovements(1);
  }, [showHistory]);

  useEffect(() => {
    const handler = () => {
      loadProducts();
      if (showHistory) loadMovements(hPage);
    };
    window.addEventListener("fundops:data-changed", handler);
    return () => window.removeEventListener("fundops:data-changed", handler);
  }, [showHistory, hPage]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    try {
      await createStockMovement(selected.id, {
        quantity: Number(quantity),
        movementType: type,
        reason: reason || `${type === "IN" ? "Stock received" : type === "OUT" ? "Stock issued" : "Stock adjusted"}`,
      });
      setSelected(null);
      setQuantity(1);
      setReason("");
      await loadProducts();
      await loadMovements(1);
      setHPage(1);
      window.dispatchEvent(new Event("fundops:data-changed"));
    } catch (e) {
      setError(apiMessage(e, "Stock movement failed"));
    }
  }

  function applyHistoryFilters() {
    setHPage(1);
    loadMovements(1);
  }

  function clearHistoryFilters() {
    setHSearch("");
    setHProduct("");
    setHType("");
    setHDateFrom("");
    setHDateTo("");
    setHPage(1);
    setTimeout(() => loadMovements(1), 0);
  }

  function handlePageChange(newPage: number) {
    setHPage(newPage);
    loadMovements(newPage);
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const totalPages = Math.ceil(movTotal / H_LIMIT);

  return (
    <>
      <div className="products-page">
        <div className="products-header">
          <div className="products-header-content">
            <div>
              <h1>Inventory</h1>
              <p>Track stock levels and record stock movements.</p>
            </div>
          </div>
          <div>
            <button className="secondary-button" onClick={loadProducts}>
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="products-filters">
          <div className="products-search search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or SKU..."
            />
          </div>
          <label className="products-low-stock">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => setLowStock(e.target.checked)}
            />{" "}
            <span>Low stock only</span>
          </label>
          <div className="products-refresh">
            <button className="secondary-button" onClick={loadProducts}>
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        {/* Stock table */}
        <section className="product-catalog dashboard-card page-card">
          <div className="card-header">
            <div>
              <h2>Stock Levels</h2>
              <p>{products.length} tracked products</p>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Location</th>
                  <th>Current Stock</th>
                  <th>Min. Stock</th>
                  <th>Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>{p.sku}</td>
                    <td>{p.location}</td>
                    <td className={p.currentStock <= p.minimumStock ? "stock-low" : ""}>
                      {p.currentStock}
                    </td>
                    <td>{p.minimumStock}</td>
                    <td>
                      <div className="mini-progress">
                        <span
                          style={{
                            width: `${Math.min(
                              100,
                              p.minimumStock
                                ? Math.max(5, (p.currentStock / p.minimumStock) * 100)
                                : 100
                            )}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="actions">
                      <button
                        className="small-action in"
                        onClick={() => {
                          setSelected(p);
                          setType("IN");
                        }}
                        title="Receive stock"
                      >
                        <ArrowDownToLine size={15} /> IN
                      </button>
                      <button
                        className="small-action out"
                        onClick={() => {
                          setSelected(p);
                          setType("OUT");
                        }}
                        title="Issue stock"
                      >
                        <ArrowUpFromLine size={15} /> OUT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="empty-state">No inventory items found.</div>
          )}
        </section>

        {/* Movement History */}
        <section className="dashboard-card page-card" style={{ marginTop: "1.5rem" }}>
          <div
            className="card-header"
            style={{ cursor: "pointer" }}
            onClick={() => setShowHistory((v) => !v)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <History size={18} />
              <div>
                <h2>Movement History</h2>
                <p>All stock IN / OUT / ADJUSTMENT records</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                className="secondary-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilters((v) => !v);
                }}
                title="Toggle filters"
              >
                <Filter size={15} /> Filters
              </button>
              {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {showHistory && (
            <>
              {/* Filters panel */}
              {showFilters && (
                <div className="products-filters" style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
                  <div className="products-search search-field">
                    <Search size={16} />
                    <input
                      value={hSearch}
                      onChange={(e) => setHSearch(e.target.value)}
                      placeholder="Search product or SKU..."
                    />
                  </div>
                  <select
                    value={hProduct}
                    onChange={(e) => setHProduct(e.target.value)}
                    style={{ height: "38px", borderRadius: "8px", border: "1px solid var(--border)", padding: "0 0.75rem" }}
                  >
                    <option value="">All Products</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                  <select
                    value={hType}
                    onChange={(e) => setHType(e.target.value)}
                    style={{ height: "38px", borderRadius: "8px", border: "1px solid var(--border)", padding: "0 0.75rem" }}
                  >
                    <option value="">All Types</option>
                    <option value="IN">IN</option>
                    <option value="OUT">OUT</option>
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                  </select>
                  <input
                    type="date"
                    value={hDateFrom}
                    onChange={(e) => setHDateFrom(e.target.value)}
                    title="From date"
                    style={{ height: "38px", borderRadius: "8px", border: "1px solid var(--border)", padding: "0 0.75rem" }}
                  />
                  <input
                    type="date"
                    value={hDateTo}
                    onChange={(e) => setHDateTo(e.target.value)}
                    title="To date"
                    style={{ height: "38px", borderRadius: "8px", border: "1px solid var(--border)", padding: "0 0.75rem" }}
                  />
                  <button className="primary-button" onClick={applyHistoryFilters}>
                    Apply
                  </button>
                  <button className="secondary-button" onClick={clearHistoryFilters}>
                    Clear
                  </button>
                </div>
              )}

              {movError && <div className="alert error" style={{ margin: "1rem 1.5rem" }}>{movError}</div>}

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Previous</th>
                      <th>New Stock</th>
                      <th>Reference</th>
                      <th>By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movLoading && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "2rem" }}>
                          Loading movements...
                        </td>
                      </tr>
                    )}
                    {!movLoading && movements.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
                          No movement records found.
                        </td>
                      </tr>
                    )}
                    {!movLoading &&
                      movements.map((m) => (
                        <tr
                          key={m.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedMovement(m)}
                          title="Click to view details"
                        >
                          <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                            {formatDate(m.createdAt)}
                          </td>
                          <td>
                            <strong>{m.product?.name ?? m.productId}</strong>
                          </td>
                          <td>{m.product?.sku ?? "—"}</td>
                          <td>
                            <Badge type={m.movementType} />
                          </td>
                          <td>
                            <strong
                              className={
                                m.movementType === "IN"
                                  ? "text-success"
                                  : m.movementType === "OUT"
                                  ? "text-danger"
                                  : ""
                              }
                            >
                              {m.movementType === "IN" ? "+" : m.movementType === "OUT" ? "-" : ""}
                              {m.quantity}
                            </strong>
                          </td>
                          <td>{m.previousStock}</td>
                          <td>
                            <strong>{m.newStock}</strong>
                          </td>
                          <td style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                            {m.referenceType === "SALES_CHALLAN" ? (
                              <span title={m.referenceId ?? ""}>Challan</span>
                            ) : (
                              m.referenceType
                            )}
                          </td>
                          <td style={{ fontSize: "0.78rem" }}>
                            {m.createdBy?.name ?? "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 1.5rem",
                    borderTop: "1px solid var(--border)",
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                  }}
                >
                  <span>
                    Showing {(hPage - 1) * H_LIMIT + 1}–{Math.min(hPage * H_LIMIT, movTotal)} of{" "}
                    {movTotal} records
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="secondary-button"
                      disabled={hPage <= 1}
                      onClick={() => handlePageChange(hPage - 1)}
                      style={{ padding: "0.25rem 0.75rem" }}
                    >
                      Previous
                    </button>
                    <span style={{ padding: "0.25rem 0.5rem" }}>
                      {hPage} / {totalPages}
                    </span>
                    <button
                      className="secondary-button"
                      disabled={hPage >= totalPages}
                      onClick={() => handlePageChange(hPage + 1)}
                      style={{ padding: "0.25rem 0.75rem" }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Stock Movement Modal */}
      {selected && (
        <div className="modal-backdrop">
          <div className="modal small-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {type === "IN"
                    ? "Receive Stock"
                    : type === "OUT"
                    ? "Issue Stock"
                    : "Adjust Stock"}
                </h2>
                <p>
                  {selected.name} · {selected.sku} · Available{" "}
                  {selected.currentStock}
                </p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submit}>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  {(["IN", "OUT"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={type === t ? "primary-button" : "secondary-button"}
                      style={{ flex: 1 }}
                      onClick={() => setType(t)}
                    >
                      {t === "IN" ? "Stock IN" : "Stock OUT"}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Quantity">
                <input
                  type="number"
                  min="1"
                  max={type === "OUT" ? selected.currentStock : undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                />
              </Field>
              <Field label="Reason">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for movement"
                  required
                />
              </Field>
              {type === "OUT" && selected.currentStock < quantity && (
                <div className="alert error" style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }}>
                  Insufficient stock. Available: {selected.currentStock}
                </div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setSelected(null)}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  disabled={type === "OUT" && selected.currentStock < quantity}
                >
                  {type === "IN" ? "Receive Stock" : "Issue Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Detail Modal */}
      {selectedMovement && (
        <div className="modal-backdrop">
          <div className="modal small-modal">
            <div className="modal-header">
              <div>
                <h2>Movement Details</h2>
                <p>{formatDate(selectedMovement.createdAt)}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedMovement(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "0 0 1rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Product", selectedMovement.product?.name ?? selectedMovement.productId],
                    ["SKU", selectedMovement.product?.sku ?? "—"],
                    ["Location", selectedMovement.product?.location ?? "—"],
                    ["Movement Type", selectedMovement.movementType],
                    ["Quantity", String(selectedMovement.quantity)],
                    ["Previous Stock", String(selectedMovement.previousStock)],
                    ["New Stock", String(selectedMovement.newStock)],
                    ["Reference Type", selectedMovement.referenceType],
                    ["Reference ID", selectedMovement.referenceId ?? "—"],
                    ["Reason", selectedMovement.reason],
                    ["Recorded By", selectedMovement.createdBy?.name ?? "—"],
                    ["Date", formatDate(selectedMovement.createdAt)],
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td
                        style={{
                          padding: "0.5rem 0.75rem",
                          fontWeight: 600,
                          width: "40%",
                          color: "var(--muted)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {label}
                      </td>
                      <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.9rem" }}>
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => setSelectedMovement(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
