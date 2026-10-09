import api from "./api";

const paymentService = {

    // =========================================================
    // GET ALL PAYMENTS
    // =========================================================

    async getAllPayments() {
        const response = await api.get("/api/payments");
        return response.data;
    },


    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    async getPaymentById(id) {
        const response = await api.get(`/api/payments/${id}`);
        return response.data;
    },


    // =========================================================
    // GET PAYMENTS BY INVOICE
    // =========================================================

    async getPaymentsByInvoice(invoiceId) {
        const response = await api.get(
            `/api/payments/invoice/${invoiceId}`
        );

        return response.data;
    },


    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    async createPayment(invoiceId, paymentData) {
        const response = await api.post(
            `/api/payments/invoice/${invoiceId}`,
            {
                amount: Number(paymentData.amount),
                paymentMethod: paymentData.paymentMethod,
                paymentDate: paymentData.paymentDate || null,
                referenceNumber:
                    paymentData.referenceNumber?.trim() || null,
                notes:
                    paymentData.notes?.trim() || null,
            }
        );

        return response.data;
    },
};

export default paymentService;