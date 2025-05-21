import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import InvoiceRoute from "./routes/Invoice_Route.js";
import VendorRoute from "./routes/Vendor_Route.js";
import UserRoute from "./routes/User_Route.js";
import ProductRoute from "./routes/Product_Route.js";
import OrderRoute from "./routes/Order_Route.js";
// Initialize Express app
const app = express();

connectDB(); // Connect to MongoDB
// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.get("/", (req, res) => {
  res.send("🧾 Invoice API is running.");
});

app.use("/api/invoices", InvoiceRoute);
app.use("/api/vendor", VendorRoute);
app.use("/api/user", UserRoute);
app.use("/api/product", ProductRoute);
app.use("/api/order", OrderRoute);

// Connect to MongoDB and start server
const PORT =  5000;;

app.listen(PORT, () => {    
    console.log(`Server is running on port ${PORT}: ${new Date().toLocaleString()}`);
    });