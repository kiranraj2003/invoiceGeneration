// models/Invoice.js
import mongoose from "mongoose";


const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: { type: String, unique: true, required: true },

    // user: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Can be null for walk-in customers
    },

    // store: { type: String, enum: ["online", "offline"], required: true },
    store: { type: String, enum: ["online", "offline"], required: false },

    // vendors: [
    //   {
    //     vendor_id: { type: String, required: true },
    //     products: [
    //       {
    //         product_id: { type: String, required: true },
    //         quantity: { type: Number, required: true },
    //         price: { type: Number, required: true },
    //         total_price: { type: Number, required: true },
    //         gst_percentage: { type: Number, required: true },
    //         gst_amount: { type: Number, required: true },
    //       },
    //     ],
    //     vendor_total: { type: Number, required: true },
    //     vendor_gst: { type: Number, required: true },
    //   },
    // ],
    parentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Orders",
      required: true,
    },
    vendors: [
      {
        vendor_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendors",
          required: true,
        },
        vendor_name: String,
        products: [
          {
            product_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
              required: true,
            },
            product_name: {
              type: String,
              required: true,
            },
            discount: { type: Number, default: 0 },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }, // Price per unit
            total_price: { type: Number, required: true }, // quantity * price
            gst_percentage: { type: Number, required: true }, // GST Rate (e.g., 18%)
            gst_amount: { type: Number, required: true }, // GST for this product
          },
        ],
        vendor_total: { type: Number, required: true }, // Total price for this vendor
        vendor_gst: { type: Number, required: true }, // GST for this vendor
      },
    ],
    // total_price: { type: Number, required: true },
    // discount: { type: Number, default: 0 },
    // gst_total: { type: Number, required: true },
    // final_price: { type: Number, required: true },
    total_price: { type: Number, required: false },
    discount: { type: Number, default: 0 },
    gst_total: { type: Number, required: false },
    final_price: { type: Number, required: false },

    invoiceUrl: { type: String },
    pdf: {
      data: Buffer,
      contentType: String,
    },
    // pdfPath: { type: String, required: true },
    qrCodeURL: {
      type: String,
      required: false,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    invoice_created_at: { type: Date, default: Date.now },
    invoice_updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "invoice_created_at",
      updatedAt: "invoice_updated_at",
    },
  }
);

export const invoiceModel = mongoose.model("Invoice", invoiceSchema);
