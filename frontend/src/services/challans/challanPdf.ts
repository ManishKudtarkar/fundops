import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Challan } from "../../types";
import {
  buildChallanDocumentModel,
  ChallanDocumentError,
  formatDocumentDate,
  formatGeneratedDateTime,
  formatInr,
} from "./challanDocument";

function addHeader(doc: jsPDF, pageWidth: number) {
  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FUN DOPS", 14, 16);

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("ERP Portal", 14, 21);

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 24, pageWidth - 14, 24);
}

function addFooter(doc: jsPDF, pageWidth: number, pageHeight: number, generatedAt: Date) {
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 24, pageWidth - 14, pageHeight - 24);

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("FundOps ERP Portal", 14, pageHeight - 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Computer-generated Sales Challan", 14, pageHeight - 13);
  doc.text(`Generated on: ${formatGeneratedDateTime(generatedAt)}`, 14, pageHeight - 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Authorized Signature", pageWidth - 60, pageHeight - 18);
  doc.line(pageWidth - 60, pageHeight - 14, pageWidth - 16, pageHeight - 14);
}

export async function downloadChallanPdf(challan: Challan) {
  let model;

  try {
    model = buildChallanDocumentModel(challan);
  } catch (error) {
    if (error instanceof ChallanDocumentError) {
      throw error;
    }

    throw new ChallanDocumentError("Unable to generate the challan PDF. Please try again.");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 14;
  const right = 14;
  const contentWidth = pageWidth - left - right;

  addHeader(doc, pageWidth);

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SALES CHALLAN", left, 36);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Challan Number:", left, 46);
  doc.setFont("helvetica", "normal");
  doc.text(model.challanNumber, left + 33, 46);

  doc.setFont("helvetica", "bold");
  doc.text("Status:", left, 52);
  doc.setFont("helvetica", "normal");
  doc.text(model.status, left + 33, 52);

  doc.setFont("helvetica", "bold");
  doc.text("Created Date:", left, 58);
  doc.setFont("helvetica", "normal");
  doc.text(formatDocumentDate(model.createdAt), left + 33, 58);

  doc.roundedRect(left, 64, contentWidth, 34, 3, 3, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CUSTOMER DETAILS", left + 4, 71);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Customer:", left + 4, 78);
  doc.text("Business Name:", left + 4, 84);
  doc.text("Mobile:", left + 96, 78);
  doc.text("Email:", left + 96, 84);

  doc.setFont("helvetica", "normal");
  doc.text(model.customerName, left + 28, 78);
  doc.text(model.businessName, left + 39, 84);
  doc.text(model.mobile, left + 115, 78);
  doc.text(model.email, left + 115, 84);

  doc.setFont("helvetica", "bold");
  doc.text("Address:", left + 4, 90);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(model.address, contentWidth - 24);
  doc.text(addressLines, left + 24, 90);

  const tableStartY = 104;

  autoTable(doc, {
    startY: tableStartY,
    head: [["Sr. No.", "Product", "SKU", "Quantity", "Unit Price", "Total"]],
    body: model.lines.map((line) => [
      String(line.srNo),
      line.productName,
      line.sku,
      String(line.quantity),
      formatInr(line.unitPrice),
      formatInr(line.total),
    ]),
    margin: { left, right, top: tableStartY, bottom: 32 },
    theme: "grid",
    tableWidth: contentWidth,
    pageBreak: "auto",
    rowPageBreak: "avoid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: [31, 41, 55],
      lineColor: [229, 231, 235],
      lineWidth: 0.25,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [71, 85, 105],
      fontStyle: "bold",
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 16, halign: "center" },
      1: { cellWidth: 62 },
      2: { cellWidth: 30 },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 29, halign: "right" },
      5: { cellWidth: 29, halign: "right" },
    },
    didDrawPage: (data) => {
      addHeader(doc, pageWidth);
      addFooter(doc, pageWidth, pageHeight, model.generatedAt);

      if (data.pageNumber === 1) {
        doc.setTextColor(17, 24, 39);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`Customer: ${model.customerName}`, left, 98);
      }
    },
  });

  const summaryY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 104;
  const summaryTop = Math.min(summaryY + 8, pageHeight - 56);

  if (summaryTop > pageHeight - 58) {
    doc.addPage();
    addHeader(doc, pageWidth);
  }

  const summaryStart = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || summaryY;
  const summaryBoxY = Math.max(summaryStart + 8, 140);

  if (summaryBoxY + 32 > pageHeight - 34) {
    doc.addPage();
    addHeader(doc, pageWidth);
  }

  const currentY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || tableStartY;
  const summaryPanelY = Math.min(currentY + 8, pageHeight - 82);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SUMMARY", left, summaryPanelY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const summaryLines = [
    [`Total Items:`, String(model.totalItems)],
    [`Total Quantity:`, String(model.totalQuantity)],
    [`Subtotal:`, formatInr(model.subtotal)],
    [`Total Amount:`, formatInr(model.totalAmount)],
  ];

  let summaryYPosition = summaryPanelY + 7;
  summaryLines.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, left, summaryYPosition);
    doc.setFont("helvetica", "normal");
    doc.text(value, left + 34, summaryYPosition);
    summaryYPosition += 6;
  });

  const safeFileName = `FundOps_Challan_${model.challanNumber.replace(/[^A-Za-z0-9_-]/g, "_")}.pdf`;
  doc.save(safeFileName);
}
