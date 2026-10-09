import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================================
// File: src/services/invoicePdfService.js
// ============================================================

const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

// "₹" is not in jsPDF's built-in fonts, so "Rs." is used.
const formatCurrency = (value) =>
    `Rs. ${toNumber(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (value) => {
    if (!value) return "-";

    // Avoid timezone conversion for date-only values.
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-");
        return `${day}-${month}-${year}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getInvoiceNumber = (invoice) =>
    invoice?.invoiceNumber || `INV-${invoice?.id ?? "UNKNOWN"}`;

const getStatus = (invoice) =>
    String(invoice?.status || "DRAFT").toUpperCase();

const getItemType = (type) => {
    switch (String(type || "").toUpperCase()) {
        case "PART":
            return "Spare Part";
        case "SERVICE":
            return "Service";
        case "LABOUR":
            return "Labour";
        case "OTHER":
            return "Other";
        default:
            return type || "Item";
    }
};

const getCustomerName = (invoice) =>
    invoice?.customerName || invoice?.customer?.name || "Customer";

const getVehicleNumber = (invoice) =>
    invoice?.vehicleNumber ||
    invoice?.vehicle?.registrationNumber ||
    invoice?.vehicle?.registration ||
    "Not provided";

const getJobCardNumber = (invoice) =>
    invoice?.jobCardNumber ||
    (invoice?.jobCardId ? `JC-${invoice.jobCardId}` : "Not provided");

const getFileName = (invoice) => {
    const safeInvoiceNumber = String(getInvoiceNumber(invoice))
        // eslint-disable-next-line no-control-regex
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
        .replace(/\s+/g, "-");

    return `${safeInvoiceNumber}.pdf`;
};

// ============================================================
// DOWNLOAD INVOICE AS PDF
// ============================================================

const downloadInvoicePdf = (invoice) => {
    if (!invoice || typeof invoice !== "object" || Array.isArray(invoice)) {
        throw new Error(
            "Invoice details are unavailable. Please open the invoice again."
        );
    }

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    const invoiceNumber = getInvoiceNumber(invoice);
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    const invoiceDate = formatDate(invoice.invoiceDate || invoice.createdAt);
    const invoiceStatus = getStatus(invoice);
    const customerName = getCustomerName(invoice);
    const vehicleNumber = getVehicleNumber(invoice);
    const jobCardNumber = getJobCardNumber(invoice);

    // ---------------- HEADER ----------------

    doc.setFillColor(190, 24, 35);
    doc.rect(0, 0, pageWidth, 37, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("DR.CARCARE", margin, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("AUTOMOTIVE SERVICE & BILLING", margin, 23);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("INVOICE", pageWidth - margin, 17, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(invoiceNumber, pageWidth - margin, 25, { align: "right" });

    // ---------------- CUSTOMER / INVOICE INFO ----------------

    let y = 48;

    doc.setTextColor(35, 35, 35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text("BILL TO", margin, y);
    doc.text("INVOICE DETAILS", pageWidth / 2 + 5, y);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(`Customer: ${customerName}`, margin, y);
    doc.text(`Invoice No: ${invoiceNumber}`, pageWidth / 2 + 5, y);

    y += 7;

    doc.text(`Vehicle: ${vehicleNumber}`, margin, y);
    doc.text(`Invoice Date: ${invoiceDate}`, pageWidth / 2 + 5, y);

    y += 7;

    doc.text(`Job Card: ${jobCardNumber}`, margin, y);
    doc.text(`Status: ${invoiceStatus}`, pageWidth / 2 + 5, y);

    // ---------------- ITEMS TABLE ----------------

    y += 10;

    const tableRows = items.map((item, index) => {
        const quantity = toNumber(item?.quantity);
        const unitPrice = toNumber(item?.unitPrice);
        const itemTax = toNumber(item?.taxAmount);

        const lineTotal =
            item?.totalAmount !== null && item?.totalAmount !== undefined
                ? toNumber(item.totalAmount)
                : quantity * unitPrice + itemTax;

        return [
            index + 1,
            getItemType(item?.itemType),
            item?.description || "Item",
            quantity.toLocaleString("en-IN"),
            formatCurrency(unitPrice),
            formatCurrency(itemTax),
            formatCurrency(lineTotal),
        ];
    });

    autoTable(doc, {
        startY: y,

        head: [["#", "Type", "Description", "Qty", "Unit Price", "Tax", "Total"]],

        body: tableRows.length
            ? tableRows
            : [["-", "-", "No invoice items available", "-", "-", "-", "-"]],

        theme: "grid",

        margin: { left: margin, right: margin },

        styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 3,
            overflow: "linebreak",
            textColor: [45, 45, 45],
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
        },

        headStyles: {
            fillColor: [190, 24, 35],
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },

        alternateRowStyles: { fillColor: [248, 248, 248] },

        columnStyles: {
            0: { cellWidth: 8, halign: "center" },
            1: { cellWidth: 20 },
            2: { cellWidth: "auto" },
            3: { cellWidth: 12, halign: "right" },
            4: { cellWidth: 25, halign: "right" },
            5: { cellWidth: 20, halign: "right" },
            6: { cellWidth: 25, halign: "right" },
        },
    });

    // ---------------- TOTALS ----------------

    let totalsY = (doc.lastAutoTable?.finalY || y) + 10;

    const subtotal = toNumber(invoice.subtotal);
    const discountAmount = toNumber(invoice.discountAmount);
    const taxAmount = toNumber(invoice.taxAmount);
    const totalAmount = toNumber(invoice.totalAmount);
    const paidAmount = toNumber(invoice.paidAmount);

    const outstandingAmount =
        invoice.outstandingAmount !== null &&
        invoice.outstandingAmount !== undefined
            ? toNumber(invoice.outstandingAmount)
            : Math.max(totalAmount - paidAmount, 0);

    const totals = [
        ["Subtotal", formatCurrency(subtotal)],
        ["Discount", `- ${formatCurrency(discountAmount)}`],
        ["Tax", formatCurrency(taxAmount)],
        ["Total Amount", formatCurrency(totalAmount)],
        ["Paid Amount", formatCurrency(paidAmount)],
        ["Outstanding Balance", formatCurrency(outstandingAmount)],
    ];

    const totalsHeight = 7 * totals.length + 8;

    if (totalsY + totalsHeight > pageHeight - 27) {
        doc.addPage();
        totalsY = 20;
    }

    const totalsX = pageWidth - margin - 78;
    const totalsWidth = 78;

    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(totalsX, totalsY, totalsWidth, totalsHeight, 2, 2, "S");

    let rowY = totalsY + 8;

    totals.forEach(([label, value]) => {
        const isTotal = label === "Total Amount";
        const isOutstanding = label === "Outstanding Balance";

        if (isTotal) {
            doc.setDrawColor(190, 24, 35);
            doc.line(totalsX + 4, rowY - 4, totalsX + totalsWidth - 4, rowY - 4);
        }

        doc.setFont("helvetica", isTotal || isOutstanding ? "bold" : "normal");
        doc.setFontSize(isTotal ? 10 : 8);

        if (isOutstanding && outstandingAmount > 0) {
            doc.setTextColor(190, 24, 35);
        } else {
            doc.setTextColor(45, 45, 45);
        }

        doc.text(label, totalsX + 4, rowY);
        doc.text(value, totalsX + totalsWidth - 4, rowY, { align: "right" });

        rowY += 7;
    });

    // ---------------- NOTES ----------------

    const notes = String(invoice.notes || "").trim();

    if (notes) {
        let notesY = totalsY + totalsHeight + 10;

        if (notesY > pageHeight - 35) {
            doc.addPage();
            notesY = 20;
        }

        doc.setTextColor(45, 45, 45);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Notes", margin, notesY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        const wrappedNotes = doc.splitTextToSize(notes, pageWidth - margin * 2);
        doc.text(wrappedNotes, margin, notesY + 6);
    }

    // ---------------- FOOTERS ----------------

    const pageCount = doc.internal.getNumberOfPages();

    for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);

        doc.setDrawColor(220, 220, 220);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        doc.setTextColor(110, 110, 110);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text("DR.CARCARE | Thank you for choosing us.", margin, pageHeight - 9);

        doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 9, {
            align: "right",
        });
    }

    // ---------------- DOWNLOAD ----------------

    doc.save(getFileName(invoice));
};

export default downloadInvoicePdf;