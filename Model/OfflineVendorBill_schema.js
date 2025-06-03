import mongoose from "mongoose";
const OfflineVendorBillSchema = new mongoose.Schema({
  invoice_number: String,
  userName: String,
  phone: String,
  date: String,
  paymentMethod: String,
  paid: Boolean,
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
      amount: Number,
      gst: Number,
      totalWithGST: Number,
    },
  ],
  totalAmount: Number,
  totalGST: Number,
  grandTotal: Number,
  createdAt: { type: Date, default: Date.now },
});
export const OfflineVendorBill = mongoose.model(
  "offlinevendorinvoice",
  OfflineVendorBillSchema
);
