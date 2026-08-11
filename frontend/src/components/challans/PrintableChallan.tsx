import type { Challan } from "../../types";
import {
  buildChallanDocumentModel,
  ChallanDocumentError,
  formatDocumentDate,
  formatGeneratedDateTime,
  formatInr,
} from "../../services/challans/challanDocument";

interface PrintableChallanProps {
  challan: Challan;
}

export default function PrintableChallan({ challan }: PrintableChallanProps) {
  let model;

  try {
    model = buildChallanDocumentModel(challan);
  } catch (error) {
    const message = error instanceof ChallanDocumentError ? error.message : "Unable to generate the challan PDF. Please try again.";

    return (
      <div className="challan-print-error" role="alert">
        <strong>Unable to prepare challan document</strong>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <article className="challan-print-sheet" aria-label="Sales challan document">
      <header className="challan-print-header">
        <div>
          <p className="challan-print-brand">FUN DOPS</p>
          <p className="challan-print-subbrand">ERP Portal</p>
        </div>

        <div className="challan-print-title-block">
          <h3>SALES CHALLAN</h3>
          <p className="challan-print-number">{model.challanNumber}</p>
          <p className="challan-print-status">{model.status}</p>
        </div>

        <div className="challan-print-meta">
          <div>
            <span>Created Date</span>
            <strong>{formatDocumentDate(model.createdAt)}</strong>
          </div>
        </div>
      </header>

      <section className="challan-print-section">
        <div className="challan-print-section-header">
          <h4>CUSTOMER DETAILS</h4>
        </div>

        <div className="challan-print-grid">
          <div>
            <span>Customer</span>
            <strong>{model.customerName}</strong>
          </div>
          <div>
            <span>Business Name</span>
            <strong>{model.businessName}</strong>
          </div>
          <div>
            <span>Mobile</span>
            <strong>{model.mobile}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{model.email}</strong>
          </div>
          <div className="challan-print-address">
            <span>Address</span>
            <strong>{model.address}</strong>
          </div>
        </div>
      </section>

      <section className="challan-print-section">
        <div className="challan-print-section-header">
          <h4>ITEMS</h4>
        </div>

        <table className="challan-print-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {model.lines.map((line) => (
              <tr key={`${line.srNo}-${line.sku}`}>
                <td>{line.srNo}</td>
                <td>{line.productName}</td>
                <td>{line.sku}</td>
                <td>{line.quantity}</td>
                <td>{formatInr(line.unitPrice)}</td>
                <td>{formatInr(line.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="challan-print-summary">
        <div>
          <span>Total Items</span>
          <strong>{model.totalItems}</strong>
        </div>
        <div>
          <span>Total Quantity</span>
          <strong>{model.totalQuantity}</strong>
        </div>
        <div>
          <span>Subtotal</span>
          <strong>{formatInr(model.subtotal)}</strong>
        </div>
        <div>
          <span>Total Amount</span>
          <strong>{formatInr(model.totalAmount)}</strong>
        </div>
      </section>

      <footer className="challan-print-footer">
        <div>
          <strong>FundOps ERP Portal</strong>
          <p>Computer-generated Sales Challan</p>
          <p>Generated on: {formatGeneratedDateTime(model.generatedAt)}</p>
        </div>

        <div className="challan-print-signature">
          <span>Authorized Signature</span>
          <div className="challan-signature-line" />
        </div>
      </footer>
    </article>
  );
}
