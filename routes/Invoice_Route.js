// routes/invoiceRoutes.js
import express from "express";
import {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
  downloadInvoicePdf,
  getInvoiceByNumber
} from "../Controller/Invoice_Controller.js";

const InvoiceRoute = express.Router();

// Route to create an invoice(new invoice)
//localhost:5000/api/invoices/create
InvoiceRoute.post("/createinvoice", createInvoice);

// Route to get all invoices
//localhost:5000/api/invoices/getallinvoices
InvoiceRoute.get("/getallinvoices", getAllInvoices);

//localhost:5000/api/invoices/getinvoicebyid/64f8e4b2c9d3f1a5b8e4b2c9
// Route to get invoice by object ID
InvoiceRoute.get("/getinvoicebyid/:id", getInvoiceById);

// Route to download invoice PDF
//localhost:5000/api/invoices/download/INV-1747376668719
InvoiceRoute.get("/download/:invoiceNumber", downloadInvoicePdf);

// Route to get invoice by invoice number
//localhost:5000/api/invoices/getinvoicebynumber/INV-1747376668719
InvoiceRoute.get("/getinvoicebynumber/:invoiceNumber", getInvoiceByNumber);

export default InvoiceRoute;
