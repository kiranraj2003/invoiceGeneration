// controllers/invoiceController.js
import { invoiceModel } from "../Model/Invoice_schema.js";
import { orderModel } from "../Model/Order_schema.js";
import { userModel } from "../Model/user_schema.js";
import { addressModel } from "../Model/Address_schema.js";
import { productModel } from "../Model/Product_schema.js";
import mongoose from "mongoose";
import handlebars from "handlebars";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { vendorModel } from "../Model/Vendor_schema.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const BASE_URL = "http://localhost:5000/api"; // Replace with your domain or url

// save pdf files in invoice output folder
// const savePdfToFile = async (html, filePath) => {
//   // Launch headless Chrome
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   // Set the HTML content
//   await page.setContent(html, { waitUntil: "networkidle0" });

//   // Generate PDF and save to filePath
//   await page.pdf({
//     path: filePath,
//     format: "A4",
//     margin: {
//       top: "10mm",
//       right: "10mm",
//       bottom: "10mm",
//       left: "10mm",
//     },
//     scale: 0.7,
//     printBackground: true, // important to keep background colors and images
//   });

//   await browser.close();
// };






// export const createInvoice = async (req, res) => {
//   try {
//     const invoiceData = req.body;
//     console.log("📦 Invoice data received:", invoiceData);
//     const parentOrderId = req.body.parentOrderId.$oid;
//     console.log(invoiceData);
//     console.log("💡 Request received for invoice creation");
//     console.log("📌 Extracted parentOrderId:", parentOrderId);
//     console.log("📌 Type of parentOrderId:", typeof parentOrderId);

//     if (typeof parentOrderId !== "string") {
//       console.error("❌ Invalid parentOrderId format:", parentOrderId);
//       return res.status(400).json({ message: "Invalid Order ID format" });
//     }

//     // Validate `parentOrderId`
//     if (!parentOrderId || !mongoose.Types.ObjectId.isValid(parentOrderId)) {
//       console.error("❌ Invalid Order ID format:", parentOrderId);
//       return res.status(400).json({ message: "Invalid Order ID format" });
//     }

//     // Convert to ObjectId before querying
//     const orderId = new mongoose.Types.ObjectId(parentOrderId);
//     console.log("🔍 Converted parentOrderId to ObjectId:", orderId);

//     // Fetch all orders grouped under the `parentOrderId`
//     const orders = await orderModel
//       .find({ parentOrderId: orderId })
//       .populate("products.productId vendor_id");

//     console.log("📝 Fetched Orders:", orders);

//     if (!orders.length) {
//       console.warn("⚠️ No orders found for parentOrderId:", orderId);
//       return res.status(404).json({ message: "No grouped orders found" });
//     }

//     console.log("✅ Orders found! Processing invoice...");

//     // fetch data using userId
//     const userId =
//       typeof invoiceData.userId === "object" && invoiceData.userId.$oid
//         ? invoiceData.userId.$oid
//         : invoiceData.userId;

//     const userDetails = await userModel.findById(userId);
//     console.log("this is user details", userDetails);
//     console.log("parentorderid", invoiceData.parentOrderId.$oid);
//     console.log("createdAt", invoiceData.createdAt.$date);

//     //fetching data using vendor_id
//     const vendorId =
//       typeof invoiceData.vendor_id === "object" && invoiceData.vendor_id.$oid
//         ? invoiceData.vendor_id.$oid
//         : invoiceData.vendor_id;
//     const vendorDetails = await vendorModel.findById(vendorId);
//     // console.log(vendorDetails)
//     // console.log(vendorDetails.address[0].area)

//     // create a empty map
//     const vendorMap = new Map();

//     orders.forEach((order) => {
//       order.products.forEach((item) => {
//         if (!item.productId || !item.productId.vendor_id) {
//           console.warn("⚠️ Product missing vendor details:", item);
//           return;
//         }

//         const vendorId = item.productId.vendor_id.toString();

//         if (!vendorMap.has(vendorId)) {
//           vendorMap.set(vendorId, {
//             vendor_id: vendorId,
//             vendor_name: vendorDetails.name,
//             products: [],
//             vendor_total: 0,
//             vendor_gst: 0,
//           });
//         }

//         const vendor = vendorMap.get(vendorId);
//         const gstAmount =
//           (item.productId.gst_percentage / 100) * item.price * item.quantity;

//         vendor.products.push({
//           product_id: item.productId._id,
//           product_name:item.name,
//           quantity: item.quantity,
//           discount:item.offer_percentage,
//           price: item.price,
//           total_price: item.price * item.quantity + gstAmount,
//           gst_percentage: item.productId.gst_percentage,
//           gst_amount: gstAmount,
//         });

//         vendor.vendor_total += item.price * item.quantity;
//         vendor.vendor_gst += gstAmount;
      
//       });
//     });

//     // Calculate overall invoice totals
//     const total_price = Array.from(vendorMap.values()).reduce(
//       (acc, v) => acc + v.vendor_total,
//       0
//     );
//     const gst_total = Array.from(vendorMap.values()).reduce(
//       (acc, v) => acc + v.vendor_gst,
//       0
//     );
//     const final_price = total_price + gst_total;

//     console.log("💰 Invoice calculations:", {
//       total_price,
//       gst_total,
//       final_price,
//     });

//     // 1. Generate unique invoice number
//     const invoiceNumber = `INV-${Date.now()}`;
//     invoiceData.invoice_number = invoiceNumber;

//     // 2. Generate invoice URL and QR Code
//     const invoiceUrl = `${BASE_URL}/invoices/download/${invoiceNumber}`;
//     const qrCodeURL = await QRCode.toDataURL(invoiceUrl);

//     invoiceData.invoiceUrl = invoiceUrl;
//     invoiceData.qrCodeURL = qrCodeURL;

//     const formatDateManually = (date) => {
//       const d = new Date(date);
//       const day = String(d.getDate()).padStart(2, "0");
//       const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
//       const year = d.getFullYear();
//       return `${day}-${month}-${year}`;
//     };

//     // invoiceData.vendor_id.name = vendor_name;
//     // console.log("invoiceData", userId);

//     // 3. Load and compile the Handlebars template
//     const templatePath = path.join(__dirname, "invoiceTemplate.hbs");
//     const templateHtml = fs.readFileSync(templatePath, "utf8");
//     const template = handlebars.compile(templateHtml);

//     // 4. Render final HTML with data + QR code
//     const html = template({
//       ...invoiceData,
//       createdAt: formatDateManually(invoiceData.createdAt.$date),
//       qrCodeURL,
//       userDetails: {
//         name: userDetails.name,
//         phone: userDetails.phone_number,
//         email: userDetails.email,
//       },
//       vendorDetails: {
//         name: vendorDetails.name,
//         email: vendorDetails.email,
//         company_name: vendorDetails.company_name,
//         phone_number: vendorDetails.phone_number,
//         address: {
//           flatNo: vendorDetails.address[0].flatNo,
//           area: vendorDetails.address[0].area,
//           city: vendorDetails.address[0].city,
//           state: vendorDetails.address[0].state,
//           pincode: vendorDetails.address[0].pincode,
//         },
//       },
//       vendors: Array.from(vendorMap.values()),
//       final_price : final_price,
     
//     });

//     // 5. Prepare folder and file path for saving PDF
//     const folderName = new Date()
//       .toISOString()
//       .replace(/:/g, "-")
//       .split(".")[0]
//       .replace("T", "_");
//     const outputFolder = path.join(process.cwd(), "invoices");

//     if (!fs.existsSync(outputFolder)) {
//       fs.mkdirSync(outputFolder);
//     }

//     const filePath = path.join(
//       outputFolder,
//       `${invoiceNumber}-${folderName}.pdf`
//     );

//     // 6. Save PDF file and wait for it to finish
//     // await savePdfToFile(html, filePath);

//     // 7. Also generate PDF buffer for saving in DB (optional)

//     const pdfBuffer = await (async () => {
//       const browser = await puppeteer.launch({
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//       });

//       const page = await browser.newPage();
//       await page.setContent(html, { waitUntil: "networkidle0" });

//       const pdfUint8Array = await page.pdf({
//         format: "A4",
//         printBackground: true,
//         margin: {
//           top: "10mm",
//           bottom: "10mm",
//           left: "10mm",
//           right: "10mm",
//         },
//         scale:0.7
//       });

//       await browser.close();

//       return Buffer.from(pdfUint8Array); // 🔁 Convert to proper Buffer
//     })();
    
//     console.log("this is vendor details", vendorDetails);
//     // 8. Now save the invoice document to MongoDB with pdfPath and pdf buffer
//     const finalInvoice = new invoiceModel({
//       ...invoiceData,
//       user: userDetails,
//       parentOrderId: parentOrderId,
//       vendors: Array.from(vendorMap.values()),
//       // vendors:vendorDetails,
//       pdf: {
//         data: pdfBuffer,
//         contentType: "application/pdf",
//       },
//       pdfPath: filePath,
//       qrCodeURL,
//     });

//     await finalInvoice.save();

//     // 9. Send response
//     res.status(201).json({
//       message: "Invoice created successfully",
//       invoiceId: finalInvoice._id,
//       invoiceNumber: finalInvoice.invoice_number,
//       // invoiceUrl: finalInvoice.invoiceUrl,
//       // qrCodeURL: finalInvoice.qrCodeURL,
//       // pdfPath: finalInvoice.pdfPath,
//     });
//   } catch (error) {
//     console.error("Invoice generation error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };



// export const createInvoice = async (req, res) => {
//   try {
//     const  parentOrderId  = req.body.parentOrderId;
//     console.log(parentOrderId)
    
//     // Extract and validate ObjectId
//     const orderId =
//       typeof parentOrderId === "object" && parentOrderId.$oid
//         ? parentOrderId.$oid
//         : parentOrderId;

//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       return res.status(400).json({ message: "Invalid Order ID format" });
//     }

//     const parentObjectId = new mongoose.Types.ObjectId(orderId);

//     // Fetch grouped orders with product and vendor population
//     const orders = await orderModel
//       .find({ parentOrderId: parentObjectId })
//       .populate("products.productId vendor_id");

//     if (!orders.length) {
//       return res.status(404).json({ message: "No grouped orders found" });
//     }

//     console.log("✅ Orders fetched:", orders.length);

//     // Get user and vendor from the first order (assumption: grouped orders have same user & vendor)
//     const userId = orders[0].userId;
//     const createdAt = orders[0].createdAt;

//     const userDetails = await userModel.findById(userId);

//     if (!userDetails) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Build vendor-specific map from products
//     const vendorMap = new Map();

//     for (const order of orders) {
//       for (const item of order.products) {
//         if (!item.productId || !item.productId.vendor_id) continue;

//         const vendorId = item.productId.vendor_id._id.toString();

//         if (!vendorMap.has(vendorId)) {
//           vendorMap.set(vendorId, {
//             vendor_id: vendorId,
//             vendor_name: item.productId.vendor_id.name,
//             products: [],
//             vendor_total: 0,
//             vendor_gst: 0,
//           });
//         }

//         const gstAmount =
//           (item.productId.gst_percentage / 100) * item.price * item.quantity;

//         vendorMap.get(vendorId).products.push({
//           product_id: item.productId._id,
//           product_name: item.name,
//           quantity: item.quantity,
//           discount: item.offer_percentage,
//           price: item.price,
//           total_price: item.price * item.quantity + gstAmount,
//           gst_percentage: item.productId.gst_percentage,
//           gst_amount: gstAmount,
//         });

//         vendorMap.get(vendorId).vendor_total += item.price * item.quantity;
//         vendorMap.get(vendorId).vendor_gst += gstAmount;

//       }
//     }

//     const total_price = Array.from(vendorMap.values()).reduce(
//       (acc, v) => acc + v.vendor_total,
//       0
//     );
//     const gst_total = Array.from(vendorMap.values()).reduce(
//       (acc, v) => acc + v.vendor_gst,
//       0
//     );
//     const final_price = total_price + gst_total;

//     // Generate invoice metadata
//     const invoiceNumber = `INV-${Date.now()}`;
//     const invoiceUrl = `${BASE_URL}/invoices/download/${invoiceNumber}`;
//     const qrCodeURL = await QRCode.toDataURL(invoiceUrl);

//     const formatDateManually = (date) => {
//       const d = new Date(date);
//       return `${String(d.getDate()).padStart(2, "0")}-${String(
//         d.getMonth() + 1
//       ).padStart(2, "0")}-${d.getFullYear()}`;
//     };

//     const vendorDetails = Array.from(vendorMap.values())[0]; // Just the first vendor details for invoice display
//     const vendorFull = await vendorModel.findById(vendorDetails.vendor_id);

//     const templatePath = path.join(__dirname, "invoiceTemplate.hbs");
//     const templateHtml = fs.readFileSync(templatePath, "utf8");
//     const template = handlebars.compile(templateHtml);

//     const html = template({
//       createdAt: formatDateManually(createdAt),
//       qrCodeURL,
//       parentOrderId:parentOrderId.$oid,
//       invoice_number: invoiceNumber,
//       userDetails: {
//         name: userDetails.name,
//         phone: userDetails.phone_number,
//         email: userDetails.email,
//       },
//       vendorDetails: {
//         name: vendorFull.name,
//         email: vendorFull.email,
//         company_name: vendorFull.company_name,
//         phone_number: vendorFull.phone_number,
//         address: {
//           flatNo: vendorFull.address[0].flatNo,
//           area: vendorFull.address[0].area,
//           city: vendorFull.address[0].city,
//           state: vendorFull.address[0].state,
//           pincode: vendorFull.address[0].pincode,
//         },
//       },
//       vendors: Array.from(vendorMap.values()).map((vendor) => ({
//         ...vendor,
//         products: vendor.products.map((product) => ({
//           ...product,
//           sgst: product.gst_amount / 2,
//           cgst: product.gst_amount / 2,
//         })),
//       })),
//       total_price,
//       gst_total,

//       final_price,
//     });

//     const outputFolder = path.join(process.cwd(), "invoices");
//     if (!fs.existsSync(outputFolder)) {
//       fs.mkdirSync(outputFolder);
//     }

//     const fileName = `${invoiceNumber}-${
//       new Date()
//         .toISOString()
//         .replace(/:/g, "-")
//         .replace("T", "_")
//         .split(".")[0]
//     }.pdf`;
//     const filePath = path.join(outputFolder, fileName);

//     const pdfBuffer = await (async () => {
//       const browser = await puppeteer.launch({
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//       });

//       const page = await browser.newPage();
//       await page.setContent(html, { waitUntil: "networkidle0" });

//       const pdfUint8Array = await page.pdf({
//         format: "A4",
//         printBackground: true,
//         margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
//         scale: 0.7,
//       });

//       await browser.close();
//       return Buffer.from(pdfUint8Array);
//     })();

//     const finalInvoice = new invoiceModel({
//       parentOrderId: parentObjectId,
//       invoice_number: invoiceNumber,
//       invoiceUrl,
//       qrCodeURL,
//       user: userDetails,
//       vendors: Array.from(vendorMap.values()),
//       pdf: {
//         data: pdfBuffer,
//         contentType: "application/pdf",
//       },
//       pdfPath: filePath,
//     });

//     await finalInvoice.save();

//     res.status(201).json({
//       message: "Invoice created successfully",
//       invoiceId: finalInvoice._id,
//       invoiceNumber: finalInvoice.invoice_number,
//     });
//   } catch (error) {
//     console.error("Invoice generation error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };



export const createInvoice = async (req, res) => {
  try {
    let parentOrderIdRaw = req.body.parentOrderId;
    const parentOrderId =
      typeof parentOrderIdRaw === "string"
        ? parentOrderIdRaw
        : parentOrderIdRaw?.$oid;
    // 🚀 Improved validation with logs
    console.log("📌 Extracted parentOrderId:", parentOrderId);
    console.log("📌 Type of parentOrderId:", typeof parentOrderId);

    if (typeof parentOrderId !== "string" || parentOrderId.trim() === "") {
      console.error("❌ Invalid parentOrderId format:", parentOrderId);
      return res.status(400).json({ message: "Invalid Order ID format" });
    }

    if (!mongoose.Types.ObjectId.isValid(parentOrderId)) {
      console.error("❌ Invalid Order ID format:", parentOrderId);
      return res.status(400).json({ message: "Invalid Order ID format" });
    }

    const orderId = new mongoose.Types.ObjectId(parentOrderId);
    console.log("🔍 Converted parentOrderId to ObjectId:", orderId);


    const orders = await orderModel
      .find({ parentOrderId: orderId })
      .populate("products.productId vendor_id");

    console.log("📝 Fetched Orders:", orders);

    if (!orders.length) {
      console.warn("⚠️ No orders found for parentOrderId:", orderId);
      return res.status(404).json({ message: "No grouped orders found" });
    }

    console.log("✅ Orders found! Processing invoice...");

    const userId = orders[0].userId;
    const createdAt = orders[0].createdAt;

    const paymentMethod = orders[0].paymentMethod
    const paymentStatus = orders[0].paymentStatus

    const shippingAddress = orders[0].shippingAddress;
    console.log("pppppp",shippingAddress)

    // console.log("pppppppp", paymentMethod);
    // console.log("pppppppp", paymentStatus);


    // for find user Id
    const userDetails = await userModel.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(userDetails)


    //user address using shippingAddress
    const address = await addressModel.findById(shippingAddress);
    console.log("this is address", address)
    console.log(address.street)

    // const userAddress = await addressModel.findById(userId.$oid);
    // console.log("this is address",userAddress)


    //create a empty map then using order id the product will be pushed into invoice(vendor)db
    const vendorMap = new Map();

    for (const order of orders) {
      for (const item of order.products) {
        if (!item.productId || !item.productId.vendor_id) continue;

        const vendorId = item.productId.vendor_id._id.toString();

        if (!vendorMap.has(vendorId)) {
          vendorMap.set(vendorId, {
            vendor_id: vendorId,
            vendor_name: item.productId.vendor_id.name,
            products: [],
            vendor_total: 0,
            vendor_gst: 0,
          });
        }
//  gst amount,gst percentage,final price calculation
        const gstAmount =
          (item.productId.gst_percentage / 100) * item.price * item.quantity;

        vendorMap.get(vendorId).products.push({
          product_id: item.productId._id,
          product_name: item.name,
          quantity: item.quantity,
          discount: item.offer_percentage,
          price: item.price,
          total_price: item.price * item.quantity + gstAmount,
          gst_percentage: item.productId.gst_percentage,
          gst_amount: gstAmount,
        });

        vendorMap.get(vendorId).vendor_total += item.price * item.quantity;
        vendorMap.get(vendorId).vendor_gst += gstAmount;
      }
    }

    const total_price = Array.from(vendorMap.values()).reduce(
      (acc, v) => acc + v.vendor_total,
      0
    );
    const gst_total = Array.from(vendorMap.values()).reduce(
      (acc, v) => acc + v.vendor_gst,
      0
    );
    const final_price = total_price + gst_total;


    //generating invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceUrl = `${BASE_URL}/invoices/download/${invoiceNumber}`;
    const qrCodeURL = await QRCode.toDataURL(invoiceUrl);


    const formatDateManually = (date) => {
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, "0")}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${d.getFullYear()}`;
    };

    const vendorDetails = Array.from(vendorMap.values())[0];
    const vendorFull = await vendorModel.findById(vendorDetails.vendor_id);

    //hbs template
    const templatePath = path.join(__dirname, "invoiceTemplate.hbs");
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateHtml);

    const html = template({
      createdAt: formatDateManually(createdAt),
      qrCodeURL,
      parentOrderId,
      paymentMethod,
      paymentStatus,
      invoice_number: invoiceNumber,
      userDetails: {
        name: userDetails.name,
        phone: userDetails.phone_number,
        email: userDetails.email,
      },
      userAddress: {
        street: address.street,
        area: address.area,
        city: address.city,
        state: address.state,
        country: address.country  
      },
      vendorDetails: {
        name: vendorFull.name,
        email: vendorFull.email,
        company_name: vendorFull.company_name,
        phone_number: vendorFull.phone_number,
        address: {
          flatNo: vendorFull.address[0].flatNo,
          area: vendorFull.address[0].area,
          city: vendorFull.address[0].city,
          state: vendorFull.address[0].state,
          pincode: vendorFull.address[0].pincode,
        },
      },
      vendors: Array.from(vendorMap.values()).map((vendor) => ({
        ...vendor,
        products: vendor.products.map((product) => ({
          ...product,
          sgst: product.gst_amount / 2,
          cgst: product.gst_amount / 2,
          sgst_percent: product.gst_percentage / 2,
          cgst_percent: product.gst_percentage / 2,
        })),
      })),
      total_price,
      gst_total,
      final_price,
    });

    const outputFolder = path.join(process.cwd(), "invoices");
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    // const fileName = `${invoiceNumber}-${
    //   new Date()
    //     .toISOString()
    //     .replace(/:/g, "-")
    //     .replace("T", "_")
    //     .split(".")[0]
    // }.pdf`;
    // const filePath = path.join(outputFolder, fileName);

    const pdfBuffer = await (async () => {
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfUint8Array = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
        scale: 0.7,
      });

      await browser.close();
      return Buffer.from(pdfUint8Array); // 👈 Fix: Convert Uint8Array to Buffer
    })();

    const finalInvoice = new invoiceModel({
      parentOrderId: orderId,
      invoice_number: invoiceNumber,
      invoiceUrl,
      qrCodeURL,
      user: userDetails,
      vendors: Array.from(vendorMap.values()),
      pdf: {
        data: pdfBuffer,
        contentType: "application/pdf",
      },
      // pdfPath: filePath,
    });

    await finalInvoice.save();

    res.status(201).json({
      message: "Invoice created successfully",
      invoiceId: finalInvoice._id,
      invoiceNumber: finalInvoice.invoice_number,
    });
  } catch (error) {
    console.error("❌ Invoice generation error:", error);
    res.status(500).json({ error: error.message });
  }
};


//get invoice by object id    // completed
export const getInvoiceById = async (req, res) => {
  try {
    const id = req.params.id.trim(); // trim whitespace and newlines
    const invoice = await invoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    return res.json(invoice);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//  get invoice using invoice number      //completed
export const getInvoiceByNumber = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const invoice = await invoiceModel.findOne({
      invoice_number: invoiceNumber,
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all  invoice   // completed
export const getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const invoices = await invoiceModel
      .find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// download invoice pdf   // completed
// export const downloadInvoicePdf = async (req, res) => {
//   try {
//     // const parentOrderId = req.body.parentOrderId;
//     const invoiceNumber = req.params.invoiceNumber;

//     if (!invoiceNumber) {
//       return res.status(400).json({ error: "Invoice number is required" });
//     }

//     const invoice = await invoiceModel.findOne({
//       invoice_number: invoiceNumber,
//     });

//     if (!invoice || !invoice.pdf || !invoice.pdf.data) {
//       return res
//         .status(404)
//         .json({ error: "Invoice not found or PDF missing" });
//     }

//     // Send the PDF with appropriate headers
//     res.setHeader("Content-Type", invoice.pdf.contentType || "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${invoice.invoice_number}.pdf"`
//     );

//     return res.send(invoice.pdf.data);
//   } catch (error) {
//     console.error("Download invoice error:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };




export const downloadInvoicePdf = async (req, res) => {
  try {
    const invoiceNumber = req.params.invoiceNumber;

    if (!invoiceNumber) {
      return res.status(400).json({ error: "Invoice number is required" });
    }

    const invoice = await invoiceModel.findOne({
      invoice_number: invoiceNumber,
    });

    if (!invoice || !invoice.pdf || !invoice.pdf.data) {
      return res
        .status(404)
        .json({ error: "Invoice not found or PDF missing" });
    }

    // 🛠 Ensure it's a valid Buffer
    const pdfBuffer =
      invoice.pdf.data instanceof Buffer
        ? invoice.pdf.data
        : Buffer.from(invoice.pdf.data); // Fix broken formatting from stored object

    // ✅ Set correct headers
    res.setHeader("Content-Type", invoice.pdf.contentType || "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoice.invoice_number}.pdf"`
    );

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Download invoice error:", error);
    return res.status(500).json({ error: error.message });
  }
};



