import api from "./api";

// ============================================================
// INVOICE SERVICE
// File: src/services/invoiceService.js
// ============================================================

// api.js baseURL is "http://localhost:8080", and the backend
// controller is mapped to "/api/invoices".
const INVOICE_BASE_URL = "/api/invoices";

const extractData = (response) => response?.data;

const assertId = (id) => {
    if (id === null || id === undefined || id === "") {
        throw new Error("Invoice ID is required.");
    }
};

// GET /api/invoices
const getAllInvoices = async () => {
    const response = await api.get(INVOICE_BASE_URL);
    return extractData(response);
};

// GET /api/invoices/{id}
const getInvoiceById = async (id) => {
    assertId(id);

    const response = await api.get(
        `${INVOICE_BASE_URL}/${encodeURIComponent(id)}`
    );

    return extractData(response);
};

// GET /api/invoices/job-card/{jobCardId}
const getInvoiceByJobCard = async (jobCardId) => {
    if (jobCardId === null || jobCardId === undefined || jobCardId === "") {
        throw new Error("Job card ID is required.");
    }

    const response = await api.get(
        `${INVOICE_BASE_URL}/job-card/${encodeURIComponent(jobCardId)}`
    );

    return extractData(response);
};

// POST /api/invoices   body: { jobCardId, notes }  (or { estimateId, notes })
const createInvoice = async (invoiceData) => {
    if (!invoiceData || typeof invoiceData !== "object") {
        throw new Error("Valid invoice data is required.");
    }

    const response = await api.post(INVOICE_BASE_URL, invoiceData);
    return extractData(response);
};

// PATCH /api/invoices/{id}/issue
const issueInvoice = async (id) => {
    assertId(id);

    const response = await api.patch(
        `${INVOICE_BASE_URL}/${encodeURIComponent(id)}/issue`
    );

    return extractData(response);
};

// PATCH /api/invoices/{id}/cancel
const cancelInvoice = async (id) => {
    assertId(id);

    const response = await api.patch(
        `${INVOICE_BASE_URL}/${encodeURIComponent(id)}/cancel`
    );

    return extractData(response);
};

const invoiceService = {
    getAllInvoices,
    getInvoiceById,
    getInvoiceByJobCard,
    createInvoice,
    issueInvoice,
    cancelInvoice,
};

export {
    getAllInvoices,
    getInvoiceById,
    getInvoiceByJobCard,
    createInvoice,
    issueInvoice,
    cancelInvoice,
};

export default invoiceService;