import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import InvoiceRoute from "./routes/Invoice_Route.js";
import VendorRoute from "./routes/Vendor_Route.js";
import UserRoute from "./routes/User_Route.js";
import ProductRoute from "./routes/Product_Route.js";
import OrderRoute from "./routes/Order_Route.js";
import AdminRoute from "./routes/Admin_Route.js";
import { productModel } from "./Model/Product_schema.js";
import { vendorModel } from "./Model/Vendor_schema.js";
// Initialize Express app
const app = express();

connectDB(); // Connect to MongoDB
// Middleware
// app.use(cors()); // Enable CORS for all origins
app.use(
  cors({
    origin: "http://localhost:5173", // React app URL
    credentials: true,
  })
);

app.use(express.json()); // Parse incoming JSON requests



// Routes
app.get("/", (req, res) => {
  res.send("🧾 Invoice API is running.");
});

app.use("/invoices", InvoiceRoute);
app.use("/vendor", VendorRoute);
app.use("/user", UserRoute);
app.use("/product", ProductRoute);
app.use("/order", OrderRoute);
app.use("/admin", AdminRoute);

// Connect to MongoDB and start server
const PORT = 3000;






app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}: ${new Date().toLocaleString()}`
  );
});
