// import { vendorModel } from "../Model/Vendor_schema.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { productModel } from "../Model/Product_schema.js";
// import { orderModel } from "../Model/Order_schema.js";

// export const authMiddleware = (req, res, next) => {
//   const token = req?.headers["authorization"]
//     ? req?.headers["authorization"]
//     : "";
//   if (!token) {
//     return res
//       .status(200)
//       .json({ status: false, message: "Token not provided" });
//   }
//   // token = token.split(" ")[1];

//   jwt.verify(token, "Evvi_Solutions_Private_Limited", (err, decoded) => {
//     if (err) {
//       if (err.name === "TokenExpiredError") {
//         return res
//           .status(200)
//           .json({ status: false, statusCode: 700, message: "Token expired" });
//       } else {
//         return res
//           .status(200)
//           .json({ status: false, message: "Invalid token" });
//       }
//     }

//     req.user = decoded;
//     next();
//   });
// };

// export const registerVendor = async (req, res) => {
//   try {
//     const { name, email, companyname, phone_number, password, gstin, address , bankDetails} =
//     req.body;
//     console.log("Received Details",req.body.bankDetails[0]);
//     const existingVendor = await vendorModel.findOne({ email });
//     if (existingVendor) {
//       return res
//         .status(400)
//         .json({ message: "Vendor with this email already exists" });
//     }

//     const hashed_password = await bcrypt.hash(password, 10);
//     const bank_account = vendorBankDetails(req.body.bankDetails);
//     const vendor_address = addressDetails(address);
//     // console.log("Check Bank",bank_account);
//     const newVendor = new vendorModel({
//       name,
//       email,
//       company_name: companyname,
//       phone_number,
//       hashed_password,
//       gstin: gstin ? gstin : "",
//       address: vendor_address, // Attach bank details separately
//       bankDetails : bank_account
//     });
//     await newVendor.save();

//     return res.status(201).json({
//       status: true,
//       message: "Vendor registered successfully Wait for Admin to Verify",
//       vendor: {
//         id: newVendor?._id,
//         name: newVendor?.name,
//         email: newVendor?.email,
//         company_name: newVendor?.company_name,
//         phone_number: newVendor?.phone_number,
//         address: newVendor?.address,
//         bankDetails : newVendor?.bankDetails,
//         gstin: newVendor?.gstin,
//       },
//     });
//   } catch (error) {
//     console.log(error); // Log the error for debugging
//     res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// export const vendorLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if email and password are provided
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Please enter required fields" });
//     }

//     // Find the vendor by email
//     const existingVendor = await vendorModel.findOne({ email });
//     if (!existingVendor) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Vendor not found" });
//     }

//     // Check if the password is correct
//     const passwordMatch = await bcrypt.compare(
//       password,
//       existingVendor.hashed_password
//     );
//     if (!passwordMatch) {
//       return res
//         .status(401)
//         .json({ status: false, message: "Invalid password" });
//     }
//     if (!existingVendor._id || !existingVendor.email || !existingVendor.role) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Vendor data is incomplete" });
//     }
//     // Generate JWT token
//     const token = jwt.sign(
//       {
//         id: existingVendor._id,
//         email: existingVendor.email,
//         role: existingVendor.role,
//       },
//       process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
//       { expiresIn: "5h" }
//     );

//     // Update the vendor's status to 'true' if currently 'false'
//     if (existingVendor.is_approved === false) {
//       return res.status(400).json({
//         status: false,
//         message: "Be Patient for Admin Approval and Notify through Mail",
//       }); // Save the updated status
//     }

//     // Respond with the token and vendor details
//     return res
//       .status(200)
//       .header("auth-token", token)
//       .json({
//         status: true,
//         message: "Login successful",
//         token,
//         vendor: {
//           id: existingVendor._id,
//           email: existingVendor.email,
//           name: existingVendor.name,
//           status: existingVendor.status, // Vendor's updated status
//         },
//       });
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     return res
//       .status(500)
//       .json({ status: false, message: "Server error", error: error.message });
//   }
// };

// export const getVendorProfile = async (req, res) => {
//   if (req.user.role === "admin"  || req.user.role === "vendor") {
//     console.log("Consolelog", req.body.vendorId)
//     try {
//       const vendorId = req.body.vendorId || req.user.id;
//       const vendor = await vendorModel
//         .findById(vendorId)
//         .select("-hashed_password");

//       // Check if the vendor exists
//       if (!vendor) {
//         return res
//           .status(404)
//           .json({ status: false, message: "Vendor not found" });
//       }

//       // Return the vendor profile details
//       return res.status(200).json({
//         status: true,
//         message: "Vendor profile retrieved successfully",
//         vendor: {
//           id: vendor._id,
//           name: vendor.name,
//           email: vendor.email,
//           company_name: vendor.company_name,
//           phone_number: vendor.phone_number,
//           address: vendor.address,
//           is_approved: vendor.is_approved,
//           status: vendor.status,
//           bank_account: vendor.bank_account, // Assuming bank details are stored here
//         },
//       });
//     } catch (error) {
//       console.error(error); // Log error for debugging
//       return res
//         .status(500)
//         .json({ status: false, message: "Server error", error: error.message });
//     }
//   } else {
//     return res
//       .status(403)
//       .json({ status: false, message: "Unauthorized access" });
//   }
// };

// export const getAllVendors = async (req, res) => {
//   if (req.user.role === "admin") {
//     // Assuming only admins can get all vendors
//     try {
//       // Fetch all vendors excluding the hashed password field
//       const vendors = await vendorModel.find().select("-hashed_password");

//       if (!vendors || vendors.length === 0) {
//         return res
//           .status(404)
//           .json({ status: false, message: "No vendors found" });
//       }

//       // Return the list of vendors
//       return res.status(200).json({
//         status: true,
//         message: "Vendors retrieved successfully",
//         vendors: vendors.map((vendor) => ({
//           id: vendor._id,
//           name: vendor.name,
//           email: vendor.email,
//           company_name: vendor.company_name,
//           phone_number: vendor.phone_number,
//           address: vendor.address,
//           is_approved: vendor.is_approved,
//           status: vendor.status, // Bank details can be included if necessary
//         })),
//       });
//     } catch (error) {
//       console.error(error); // Log error for debugging
//       return res
//         .status(500)
//         .json({ status: false, message: "Internal Server error" });
//     }
//   } else {
//     return res
//       .status(403)
//       .json({ status: false, message: "Unauthorized access" });
//   }
// };

// export const deleteVendor = async (req, res) => {
//   if (req.user.role === "admin") {
//     // Assuming only admins can change vendor status
//     try {
//       const { vendorId } = req.params; // Assuming vendorId is passed as a URL parameter

//       // Check if vendor ID is provided
//       if (!vendorId) {
//         return res
//           .status(400)
//           .json({ status: false, message: "Vendor ID is required" });
//       }

//       // Find the vendor and update the status to 'inactive'
//       const updatedVendor = await vendorModel
//         .findByIdAndUpdate(
//           vendorId,
//           { status: "inactive" },
//           { new: true } // Return the updated vendor
//         )
//         .select("-hashed_password"); // Exclude hashed_password

//       if (!updatedVendor) {
//         return res
//           .status(404)
//           .json({ status: false, message: "Vendor not found" });
//       }

//       // Return success response
//       return res.status(200).json({
//         status: true,
//         message: "Vendor status set to inactive",
//         vendor: updatedVendor,
//       });
//     } catch (error) {
//       console.error(error); // Log error for debugging
//       return res
//         .status(500)
//         .json({ status: false, message: "Server error", error: error.message });
//     }
//   } else {
//     return res
//       .status(403)
//       .json({ status: false, message: "Unauthorized access" });
//   }
// };
// // Example vendorBankDetails function

// const addressDetails = (addresses) => {
//   // Validate that addresses is an array and has at least one address object
//   if (!Array.isArray(addresses) || addresses.length === 0) {
//     throw new Error("No addresses provided");
//   }

//   return addresses.map(({ flatNo, area, city, state, pincode }) => {
//     // Validate each address object
//     if (!flatNo || !area || !city || !state || !pincode) {
//       throw new Error("Incomplete address details");
//     }

//     // Format the address according to your schema
//     return {
//       flatNo: flatNo,
//       area: area,
//       city: city,
//       state: state,
//       pincode: pincode,
//       createdAt: new Date(), // Add a timestamp if needed
//     };
//   });
// };

// export const approveVendor = async (req, res) => {
//   if (req.user.role == "admin") {
//     try {
//       const { vendorId, status } = req.body;
//       console.log(req.body);
//       if (!vendorId) {
//         return res
//           .status(401)
//           .json({ status: false, message: "Vendor ID Required" });
//       }

//       const approvedVendor = await vendorModel.findByIdAndUpdate(
//         vendorId, // This is the ID of the document to update
//         { is_approved: status }, // This is the update object
//         { new: true } // Optional: returns the updated document
//       );

//       if (!approvedVendor) {
//         return res
//           .status(404)
//           .json({ status: false, message: "Vendor not found" });
//       }

//       return res
//         .status(200)
//         .json({ status: true, message: "Vendor Approved Successfully" });

//     } catch (err) {
//       return res
//         .status(500)
//         .json({ status: false, message: "Internal Server Error", error: err.message });
//     }
//   } else {
//     return res
//       .status(403)
//       .json({ status: false, message: "Unauthorized access" });
//   }
// };

// export const countProductByVendor = async (req, res) => {
//   if (req.user.role == "admin") {
//     try {
//       const { vendorId } = req.body;
//       if (!vendorId) {
//         return res
//           .status(401)
//           .json({ status: false, message: "Vendor ID required" });
//       }
//       await productModel
//         .findById({ vendorId: vendorId })
//         .then((vendorProductList) => {
//           return res.status(200).json({
//             status: true,
//             message: "product count fetched Successfully",
//             count: vendorProductList.length,
//           });
//         });
//     } catch {
//       return res
//         .status(404)
//         .json({ status: false, message: "no product Found" });
//     }
//   } else {
//     return res
//       .status(403)
//       .json({ status: false, message: "Unauthorized access" });
//   }
// };

// export const bulkApproveVendors = async (req, res) => {
//   try {
//     const { vendorIds } = req.body; // Array of vendor IDs to be approved

//     // Update the is_approved and status for all vendors in the array
//     const result = await vendorModel.updateMany(
//       { _id: { $in: vendorIds } },
//       { $set: { is_approved: true, status: "active" } }
//     );

//     if (result.nModified === 0) {
//       return res.status(404).json({ message: "No vendors found to approve." });
//     }

//     return res
//       .status(200)
//       .json({ message: `${result.nModified} vendors approved successfully.` });
//   } catch (error) {
//     console.error("Error approving vendors:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error. Please try again later." });
//   }
// };
// // const vendorBankDetails = (bank_account) => {
// //   // Destructure properties from the bankAccount object
// //   const [
// //     {
// //       account_holder_name,
// //       account_number,
// //       account_type,
// //       ifscCode,
// //       bank_name,
// //       branch_name,
// //       city,
// //       state,
// //     },
// //   ] = bank_account;

// //   console.log("BANK",
// //     account_holder_name,
// //     account_number,
// //     bank_name,
// //     account_type,
// //     ifscCode,
// //     branch_name,
// //     city,
// //     state
// //   );
// //   // Validate bank account details
// //   // if (
// //   //   !account_holder_name ||
// //   //   !bank_name ||
// //   //   !account_number ||
// //   //   !ifscCode ||
// //   //   !branch_name ||
// //   //   !city ||
// //   //   !state ||
// //   //   !account_type
// //   //   // !vendorID
// //   // ) {
// //   //   throw new Error("Incomplete bank account details or Vendor Id Requried");
// //   // }

// //   return {
// //     // vendorId: vendorID,
// //     account_holder_name: account_holder_name,
// //     bank_name: bank_name,
// //     account_number: account_number,
// //     ifsc_code: ifscCode,
// //     branch_name: branch_name,
// //     city: city,
// //     state: state,
// //     account_type: account_type,
// //     createdAt: new Date(), // Add a timestamp if needed
// //   };
// // };

// const vendorBankDetails = (bank_account) => {
//   // Handle both array and object formats
//   const account =
//     Array.isArray(bank_account) && bank_account.length > 0
//       ? bank_account[0]
//       : bank_account;

//   // Destructure fields safely
//   const {
//     account_holder_name,
//     account_number,
//     account_type,
//     ifsc_code,
//     bank_name,
//     branch_name,
//     city,
//     state,
//   } = account || {};

//   console.log("BANK",
//     account_holder_name,
//     account_number,
//     bank_name,
//     account_type,
//     ifsc_code,
//     branch_name,
//     city,
//     state
//   );

//   if (
//     !account_holder_name ||
//     !bank_name ||
//     !account_number ||
//     !ifsc_code ||
//     !branch_name ||
//     !city ||
//     !state ||
//     !account_type
//   ) {
//     throw new Error("Incomplete bank account details");
//   }

//   return {
//     account_holder_name,
//     bank_name,
//     account_number,
//     ifsc_code,
//     branch_name,
//     city,
//     state,
//     account_type,
//     createdAt: new Date(),
//   };
// };

// export const createBankAccount = async (req, res) => {
//   try {
//     // Format the bank account details using the vendorBankDetails function
//     const formattedBankDetails = vendorBankDetails(req.body, vendorId);

//     // Create a new bank account instance
//     const newBankAccount = new bankAccountModel(formattedBankDetails);

//     // Save the bank account to the database
//     await newBankAccount.save().then(() => {
//       return res
//         .status(201)
//         .json({ status: true, message: "Bank Details Submitted Successfully" });
//     });

//     // Return the saved bank account
//   } catch (error) {
//     console.error("Error creating bank account:", error);
//     res
//       .status(500)
//       .json({ status: false, message: "Failed to create bank account" });
//     throw new Error("Failed to create bank account");
//   }
// };

// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await productModel
//       .find({ vendor_id: req.user.id })
//       .populate("category_id", "name")
//       .populate("sub_category_id","name")
//       .populate("vendor_id","name email") // Populate the category name from Category model
//       .exec();

//     return res
//       .status(200)
//       .json({ status: true, message: "Product details", products });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ status: false, message: "Error fetching products", error });
//   }
// };

// export const vendor_dashboard = async (req, res) => {
//   try {
//     const vendorId = req.user.id; // Assuming vendor authentication provides `req.user`
//     console.log(vendorId);
//     // Count total products added by the vendor
//     const productCount = await productModel.countDocuments({
//       vendor_id: vendorId
//     });
//     console.log(productCount);
//     // Count orders containing products added by the vendor
//     const orderCount = await orderModel.countDocuments({
//       "items.vendor_id": vendorId,
//     });
//     console.log(orderCount);
//     // Calculate total sales amount for vendor's products
//     const totalSales = await orderModel.aggregate([
//       { $unwind: "$items" },
//       { $match: { "items.vendor_id": vendorId } },
//       { $group: { _id: null, total: { $sum: "$items.price" } } },
//     ]);
//     console.log(totalSales);
//     // Count out-of-stock products by the vendor
//     const outOfStockCount = await productModel.countDocuments({
//       vendor_id: vendorId,
//       stock: 0,
//     });

//     return res.status(200).json({
//       status: true,
//       data: {
//         productCount,
//         orderCount,
//         totalSales: totalSales[0]?.total || 0,
//         outOfStockCount,
//       },
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ status: false, message: "Internal server error", error });
//   }
// };

import { vendorModel } from "../Model/Vendor_schema.js";
// import { bankAccountModel } from "../Model/BankAccount_schema.js";
import { OfflineVendorBill } from "../Model/OfflineVendorBill_schema.js"; // by kiran
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { productModel } from "../Model/Product_schema.js";
import { orderModel } from "../Model/Order_schema.js";

//new code for report
import { categoryModel } from "../Model/Categories_schema.js";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import handlebars from "handlebars";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

// for path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const authMiddleware = (req, res, next) => {
  const token = req?.headers["authorization"]
    ? req?.headers["authorization"]
    : "";
  if (!token) {
    return res
      .status(200)
      .json({ status: false, message: "Token not provided" });
  }
  // token = token.split(" ")[1];

  jwt.verify(token, "Evvi_Solutions_Private_Limited", (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(200)
          .json({ status: false, statusCode: 700, message: "Token expired" });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "Invalid token" });
      }
    }

    req.user = decoded;
    next();
  });
};
// export const registerVendor = async (req, res) => {
//   try {
//     const { name, email, companyname, phone_number, password, gstin, address } =
//       req.body;
//     console.log(req.body);
//     const existingVendor = await vendorModel.findOne({ email });
//     if (existingVendor) {
//       return res
//         .status(400)
//         .json({ message: "Vendor with this email already exists" });
//     }

//     const hashed_password = await bcrypt.hash(password, 10);
//     const bank_account = vendorBankDetails(bankDetails);
//     const vendor_address = addressDetails(address);
//     // console.log(bank_account);
//     const newVendor = new vendorModel({
//       name,
//       email,
//       company_name: companyname,
//       phone_number,
//       hashed_password,
//       gstin: gstin ? gstin : "",
//       address: vendor_address, // Attach bank details separately
//     });
//     await newVendor.save();

//     return res.status(201).json({
//       status: true,
//       message: "Vendor registered successfully Wait for Admin to Verify",
//       vendor: {
//         id: newVendor?._id,
//         name: newVendor?.name,
//         email: newVendor?.email,
//         company_name: newVendor?.company_name,
//         phone_number: newVendor?.phone_number,
//         address: newVendor?.address,
//         gstin: newVendor?.gstin,
//       },
//     });
//   } catch (error) {
//     console.log(error); // Log the error for debugging
//     res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };
export const registerVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      companyname,
      phone_number,
      password,
      gstin,
      address,
      bankDetails,
    } = req.body;

    // 1. Check if vendor already exists
    const existingVendor = await vendorModel.findOne({ email });
    if (existingVendor) {
      return res
        .status(400)
        .json({ message: "Vendor with this email already exists" });
    }

    // 2. Hash password
    const hashed_password = await bcrypt.hash(password, 10);

    // 3. Format address
    const vendor_address = addressDetails(address);

    // 4. Create vendor (without bank account first)
    const newVendor = new vendorModel({
      name,
      email,
      company_name: companyname,
      phone_number,
      hashed_password,
      gstin: gstin || "",
      address: vendor_address,
      // bank_account will be added later
    });

    const savedVendor = await newVendor.save();

    // 5. Create and save bank account using vendor ID
    const formattedBankDetails = vendorBankDetails(
      [bankDetails],
      savedVendor._id
    );
    const bankAccountDoc = await bankAccountModel.create(formattedBankDetails);

    // 6. Update vendor with bank account reference
    savedVendor.bank_account = bankAccountDoc._id;
    await savedVendor.save();

    // 7. Return response
    return res.status(201).json({
      status: true,
      message: "Vendor registered successfully. Wait for Admin to Verify.",
      vendor: {
        id: savedVendor._id,
        name: savedVendor.name,
        email: savedVendor.email,
        company_name: savedVendor.company_name,
        phone_number: savedVendor.phone_number,
        address: savedVendor.address,
        gstin: savedVendor.gstin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter required fields" });
    }

    // Find the vendor by email
    const existingVendor = await vendorModel.findOne({ email });
    if (!existingVendor) {
      return res
        .status(404)
        .json({ status: false, message: "Vendor not found" });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(
      password,
      existingVendor.hashed_password
    );
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid password" });
    }
    if (!existingVendor._id || !existingVendor.email || !existingVendor.role) {
      return res
        .status(404)
        .json({ status: false, message: "Vendor data is incomplete" });
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        id: existingVendor._id,
        email: existingVendor.email,
        role: existingVendor.role,
      },
      process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
      { expiresIn: "5h" }
    );

    // Update the vendor's status to 'true' if currently 'false'
    if (existingVendor.is_approved === false) {
      return res.status(400).json({
        status: false,
        message: "Be Patient for Admin Approval and Notify through Mail",
      }); // Save the updated status
    }

    // Respond with the token and vendor details
    return res
      .status(200)
      .header("auth-token", token)
      .json({
        status: true,
        message: "Login successful",
        token,
        vendor: {
          id: existingVendor._id,
          email: existingVendor.email,
          name: existingVendor.name,
          status: existingVendor.status, // Vendor's updated status
        },
      });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

export const getVendorProfile = async (req, res) => {
  if (req.user.role === "vendor") {
    try {
      // Assuming the vendor's ID is stored in `req.user.id` after authentication
      const vendorId = req.body.vendorId || req.user.id;

      // Find the vendor by ID, excluding the password field
      const vendor = await vendorModel
        .findById(vendorId)
        .select("-hashed_password");

      // Check if the vendor exists
      if (!vendor) {
        return res
          .status(404)
          .json({ status: false, message: "Vendor not found" });
      }

      // Return the vendor profile details
      return res.status(200).json({
        status: true,
        message: "Vendor profile retrieved successfully",
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          company_name: vendor.company_name,
          phone_number: vendor.phone_number,
          address: vendor.address,
          is_approved: vendor.is_approved,
          status: vendor.status,
          bank_account: vendor.bank_account, // Assuming bank details are stored here
        },
      });
    } catch (error) {
      console.error(error); // Log error for debugging
      return res
        .status(500)
        .json({ status: false, message: "Server error", error: error.message });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const getAllVendors = async (req, res) => {
  if (req.user.role === "admin") {
    // Assuming only admins can get all vendors
    try {
      // Fetch all vendors excluding the hashed password field
      const vendors = await vendorModel.find().select("-hashed_password");

      if (!vendors || vendors.length === 0) {
        return res
          .status(404)
          .json({ status: false, message: "No vendors found" });
      }

      // Return the list of vendors
      return res.status(200).json({
        status: true,
        message: "Vendors retrieved successfully",
        vendors: vendors.map((vendor) => ({
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          company_name: vendor.company_name,
          phone_number: vendor.phone_number,
          address: vendor.address,
          is_approved: vendor.is_approved,
          status: vendor.status, // Bank details can be included if necessary
        })),
      });
    } catch (error) {
      console.error(error); // Log error for debugging
      return res
        .status(500)
        .json({ status: false, message: "Internal Server error" });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const deleteVendor = async (req, res) => {
  if (req.user.role === "admin") {
    // Assuming only admins can change vendor status
    try {
      const { vendorId } = req.params; // Assuming vendorId is passed as a URL parameter

      // Check if vendor ID is provided
      if (!vendorId) {
        return res
          .status(400)
          .json({ status: false, message: "Vendor ID is required" });
      }

      // Find the vendor and update the status to 'inactive'
      const updatedVendor = await vendorModel
        .findByIdAndUpdate(
          vendorId,
          { status: "inactive" },
          { new: true } // Return the updated vendor
        )
        .select("-hashed_password"); // Exclude hashed_password

      if (!updatedVendor) {
        return res
          .status(404)
          .json({ status: false, message: "Vendor not found" });
      }

      // Return success response
      return res.status(200).json({
        status: true,
        message: "Vendor status set to inactive",
        vendor: updatedVendor,
      });
    } catch (error) {
      console.error(error); // Log error for debugging
      return res
        .status(500)
        .json({ status: false, message: "Server error", error: error.message });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};
// Example vendorBankDetails function

const addressDetails = (addresses) => {
  // Validate that addresses is an array and has at least one address object
  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new Error("No addresses provided");
  }

  return addresses.map(({ flatNo, area, city, state, pincode }) => {
    // Validate each address object
    if (!flatNo || !area || !city || !state || !pincode) {
      throw new Error("Incomplete address details");
    }

    // Format the address according to your schema
    return {
      flatNo: flatNo,
      area: area,
      city: city,
      state: state,
      pincode: pincode,
      createdAt: new Date(), // Add a timestamp if needed
    };
  });
};

export const approveVendor = async (req, res) => {
  if (req.user.role == "admin") {
    try {
      const { vendorId, status } = req.body;
      console.log(req.body);
      if (!vendorId) {
        return res
          .status(401)
          .json({ status: false, message: "Vendor ID Required" });
      }

      const approvedVendor = await vendorModel.findByIdAndUpdate(
        vendorId, // This is the ID of the document to update
        { is_approved: status }, // This is the update object
        { new: true } // Optional: returns the updated document
      );

      if (!approvedVendor) {
        return res
          .status(404)
          .json({ status: false, message: "Vendor not found" });
      }

      return res
        .status(200)
        .json({ status: true, message: "Vendor Approved Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const countProductByVendor = async (req, res) => {
  if (req.user.role == "admin") {
    try {
      const { vendorId } = req.body;
      if (!vendorId) {
        return res
          .status(401)
          .json({ status: false, message: "Vendor ID required" });
      }
      await productModel
        .findById({ vendorId: vendorId })
        .then((vendorProductList) => {
          return res.status(200).json({
            status: true,
            message: "product count fetched Successfully",
            count: vendorProductList.length,
          });
        });
    } catch {
      return res
        .status(404)
        .json({ status: false, message: "no product Found" });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const bulkApproveVendors = async (req, res) => {
  try {
    const { vendorIds } = req.body; // Array of vendor IDs to be approved

    // Update the is_approved and status for all vendors in the array
    const result = await vendorModel.updateMany(
      { _id: { $in: vendorIds } },
      { $set: { is_approved: true, status: "active" } }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "No vendors found to approve." });
    }

    return res
      .status(200)
      .json({ message: `${result.nModified} vendors approved successfully.` });
  } catch (error) {
    console.error("Error approving vendors:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
const vendorBankDetails = (bank_account, vendorID) => {
  // Destructure properties from the bankAccount object
  const [
    {
      accountHolderName,
      accountNumber,
      accountType,
      ifscCode,
      bankName,
      branchName,
      city,
      state,
    },
  ] = bank_account;
  // console.log(
  //   accountHolderName,
  //   accountNumber,
  //   accountType,
  //   ifscCode,
  //   bankName,
  //   branchName,
  //   city,
  //   state
  // );
  // Validate bank account details
  if (
    !accountHolderName ||
    !bankName ||
    !accountNumber ||
    !ifscCode ||
    !branchName ||
    !city ||
    !state ||
    !accountType ||
    !vendorID
  ) {
    throw new Error("Incomplete bank account details or Vendor Id Requried");
  }

  // Format the bank details according to your schema
  return {
    vendorId: vendorID,
    account_holder_name: accountHolderName,
    bank_name: bankName,
    account_number: accountNumber,
    ifsc_code: ifscCode,
    branch_name: branchName,
    city: city,
    state: state,
    account_type: accountType,
    createdAt: new Date(), // Add a timestamp if needed
  };
};

export const createBankAccount = async (req, res) => {
  try {
    // Format the bank account details using the vendorBankDetails function
    const formattedBankDetails = vendorBankDetails(req.body, vendorId);

    // Create a new bank account instance
    const newBankAccount = new bankAccountModel(formattedBankDetails);

    // Save the bank account to the database
    await newBankAccount.save().then(() => {
      return res
        .status(201)
        .json({ status: true, message: "Bank Details Submitted Successfully" });
    });

    // Return the saved bank account
  } catch (error) {
    console.error("Error creating bank account:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to create bank account" });
    throw new Error("Failed to create bank account");
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({ vendor_id: req.user.id })
      .populate("category_id", "name")
      .populate("sub_category_id", "name")
      .populate("vendor_id", "name email") // Populate the category name from Category model
      .exec();

    return res
      .status(200)
      .json({ status: true, message: "Product details", products });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Error fetching products", error });
  }
};

export const vendor_dashboard = async (req, res) => {
  try {
    const vendorId = req.user.id; // Assuming vendor authentication provides `req.user`
    console.log(vendorId);
    // Count total products added by the vendor
    const productCount = await productModel.countDocuments({
      vendor_id: vendorId,
    });
    console.log(productCount);
    // Count orders containing products added by the vendor
    const orderCount = await orderModel.countDocuments({
      "items.vendor_id": vendorId,
    });
    console.log(orderCount);
    // Calculate total sales amount for vendor's products
    const totalSales = await orderModel.aggregate([
      { $unwind: "$items" },
      { $match: { "items.vendor_id": vendorId } },
      { $group: { _id: null, total: { $sum: "$items.price" } } },
    ]);
    console.log(totalSales);
    // Count out-of-stock products by the vendor
    const outOfStockCount = await productModel.countDocuments({
      vendor_id: vendorId,
      stock: 0,
    });

    return res.status(200).json({
      status: true,
      data: {
        productCount,
        orderCount,
        totalSales: totalSales[0]?.total || 0,
        outOfStockCount,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};

//dont delete the code

// export const onlineStockReport = async (req, res) => {
//   const vendorId = req.params.id;

//   if (!vendorId) {
//     return res.status(400).json({ message: "Vendor ID is required" });
//   }

//   try {
//     const products = await productModel.aggregate([
//       {
//         $match: {
//           vendor_id: new mongoose.Types.ObjectId(vendorId),
//         },
//       },
//       {
//         $lookup: {
//           from: "categories",
//           localField: "category_id",
//           foreignField: "_id",
//           as: "category",
//         },
//       },

//       { $unwind: "$category" }, // the file
//       {
//         $match: {
//           "category.storeType": "online",
//         },
//       },
//       {
//         $lookup: {
//           from: "subcategories",
//           localField: "sub_category_id",
//           foreignField: "_id",
//           as: "subcategory",
//         },
//       },
//       { $unwind: "$subcategory" },
//     ]);

//     // products.forEach((product) => {
//     //   if (product.variants && product.variants.length > 0) {
//     //     product.variants = product.variants.map((variant) => {
//     //       let status = "Available";
//     //       if (variant.stock === 0) status = "Out of Stock";
//     //       else if (variant.stock < 20) status = "Low on Stock";
//     //       return {
//     //         ...variant,
//     //         stock_status: status,
//     //       };
//     //     });
//     //   }
//     // });

//     // template path
//     const templatePath = path.join(__dirname, "..", "views", "stockReport.hbs");
//     const templateHtml = fs.readFileSync(templatePath, "utf-8");
//     const template = handlebars.compile(templateHtml);
//     const heading = "Online Stock Report";
//     const html = template({ products, heading });

//     // pdf downloading and generations
//     const pdfBuffer = await (async () => {
//       const browser = await puppeteer.launch({
//         args: ["--no-sandbox", "--disable-set-uid-sandbox"],
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

//     // used for stockreport pdf name
//     const formatDateManually = (date) => {
//       const d = new Date(date);
//       return `${String(d.getDate()).padStart(2, "0")}-${String(
//         d.getMonth() + 1
//       ).padStart(2, "0")}-${d.getFullYear()}`;
//     };

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename=stock_report_${formatDateManually(
//         Date.now()
//       )}.pdf`,
//       "Content-Length": pdfBuffer.length,
//     });
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error("Error fetching vendor stock report:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// new code
// export const onlineStockReportSearch = async (req, res) => {

//   try {
//     const search = req.query.search || null

//     const products = await productModel
//       .find({name:search})
//       .populate({ path: "category_id", select: "name storeType" });

//     const filteredProducts = products.filter(
//       (product) => product.category_id?.storeType === "online"
//     );

//     console.log(filteredProducts);
//     res.json({ message: "this is online stock report search" });
//   } catch (error) {
//     console.error("Error fetching vendor Online stock report:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching vendor Online stock report",
//     });
//   }
// };

//

// export const onlineStockReportSearch =async (req, res) => {
//   try {
//     const search = req.query.search;

//     // Case-insensitive regex search on product name
//     const products = await productModel.find({
//       name: { $regex: search, $options: "i" },
//     }).populate({ path: 'category_id', select:'name storeType'})

//     console.log(products[0].category_id.name)
//     res.json(products);
//   } catch (error) {
//     console.error("Error searching products:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// for online stock report - kiran
export const onlineStockReport = async (req, res) => {
  try {
    // to check validation for user role for vendor
    if (!req.user.id === "vendor") {
      return
      res.status(400).json({ success: false, message: "Unauthorized access" });
    }
    const vendorId = req.user?.id;  //logged in user
    const search = req.query.search?.trim() || "";
    const stock_status = req.query.status?.trim().toLowerCase() || "";

    console.log("Vendor ID:", vendorId);
    console.log("Search Query:", search);
    console.log("Stock Status Filter:", stock_status);

    // Validate vendorId   -  to validate mongoose ObjectId
    if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing vendor ID" });
    }
  
    // Validate vendor existence - valdation  to verify the req.user.id vendorId is in vendorModel
    //   to validate vendor id in vendorModel
    const vendor = await vendorModel.findById(vendorId);
    if (!vendor) {
      return res
      .status(404)
      .json({ success: false, message: "Vendor not found in Vendor collection" });
    }

    // to validate vendorId in productModel in vendor_id
    const vendorVerify = await productModel.find({ vendor_id: vendorId });
    if (!vendorVerify) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found in Products collections" });
    }
 
    //  fetch products belonging to this vendor
    const products = await productModel
      .find({ vendor_id: vendorId })
      .populate({ path: "category_id", select: "name storeType" })
      .lean();

    // console.log("Total Products", products);


    // let filteredProducts = products;
    // filter the pproducts with category Store Type Online
    let filteredProducts = products.filter(
      (product) => product.category_id?.storeType === "online"
    );

    // filter by product name or category name
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filteredProducts = filteredProducts.filter(
        (product) =>
          searchRegex.test(product.name) ||
          searchRegex.test(product.category_id?.name || "")
      );
    }

    // stock_status filter
    if (stock_status) {
      const stockRegex = new RegExp(stock_status, "i");
      filteredProducts = filteredProducts
        .filter((product) =>
          product.variants.some(
            (variant) =>
              variant.stock_status && stockRegex.test(variant.stock_status)
          )
        )
        .map((product) => ({
          ...product,
          variants: product.variants.filter(
            (variant) =>
              variant.stock_status && stockRegex.test(variant.stock_status)
          ),
        }));
    }

    // console.log("Filtered Products:", filteredProducts);
    // console.log("Filtered Products Count:", filteredProducts.length);

    // to verify the number of searched and status match the filtered products using filterProducts.length===0
    if (filteredProducts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No matching products found" });
    }

    res.status(200).json({
      success: true,
      data: filteredProducts,
      heading: "Online"
    });
  } catch (error) {
    console.error("Error filtering products:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
/*************************************************************************************************************************** */


// for offline stock report - kiran
export const offlineStockReport = async (req, res) => {
  try {
    // to check validation for user role for vendor
    if (!req.user.id === "vendor") {
      return;
      res.status(400).json({ success: false, message: "Unauthorized access" });
    }
    const vendorId = req.user?.id; //logged in user
    const search = req.query.search?.trim() || "";
    const stock_status = req.query.status?.trim().toLowerCase() || "";

    console.log("Vendor ID:", vendorId);
    console.log("Search Query:", search);
    console.log("Stock Status Filter:", stock_status);

    // Validate vendorId   -  to validate mongoose ObjectId
    if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing vendor ID" });
    }

    // Validate vendor existence - valdation  to verify the req.user.id vendorId is in vendorModel
    //   to validate vendor id in vendorModel
    const vendor = await vendorModel.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found in Vendor collection",
      });
    }

    // to validate vendorId in productModel in vendor_id
    const vendorVerify = await productModel.find({ vendor_id: vendorId });
    if (!vendorVerify) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found in Products collections",
      });
    }

    //  fetch products belonging to this vendor
    const products = await productModel
      .find({ vendor_id: vendorId })
      .populate({ path: "category_id", select: "name storeType" })
      .lean();

    // console.log("Total Products", products);

    // let filteredProducts = products;
    // filter the pproducts with category Store Type Online
    let filteredProducts = products.filter(
      (product) => product.category_id?.storeType === "offline"
    );

    // filter by product name or category name
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filteredProducts = filteredProducts.filter(
        (product) =>
          searchRegex.test(product.name) ||
          searchRegex.test(product.category_id?.name || "")
      );
    }

    // stock_status filter
    if (stock_status) {
      const stockRegex = new RegExp(stock_status, "i");
      filteredProducts = filteredProducts
        .filter((product) =>
          product.variants.some(
            (variant) =>
              variant.stock_status && stockRegex.test(variant.stock_status)
          )
        )
        .map((product) => ({
          ...product,
          variants: product.variants.filter(
            (variant) =>
              variant.stock_status && stockRegex.test(variant.stock_status)
          ),
        }));
    }

    // console.log("Filtered Products:", filteredProducts);
    // console.log("Filtered Products Count:", filteredProducts.length);

    // to verify the number of searched and status match the filtered products using filterProducts.length===0
    if (filteredProducts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No matching products found" });
    }

    res.status(200).json({
      success: true,
      data: filteredProducts,
      heading: "Offline",
    });
  } catch (error) {
    console.error("Error filtering products:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
/********************************************************************************************************************/



// offline vendor bill generation for offline stores to print 80mm print (pdf) - by kirans //completed
export const offlineVendorBill = async (req, res) => {
  try {
    // Only save the fields you want
    console.log("this is req.body", req.body);
    const {
      userName,
      phone,
      date,
      paymentMethod,
      paid,
      items,
      totalAmount,
      totalGST,
      grandTotal,
      invoice_number,
    } = req.body;

    const invoice = new OfflineVendorBill({
      userName,
      phone,
      date,
      paymentMethod,
      paid,
      items,
      totalAmount,
      totalGST,
      grandTotal,
      invoice_number,
    });

    await invoice.save();
    res.status(201).json({ message: "Invoice saved" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server error offline vendor bill generation issues" });
  }
};

// for search single product by kiran
export const searchSingleProduct = async (req, res) => {
  const q = req.query.q;

  try {
    const results = await productModel.aggregate([
      {
        $match: {
          name: { $regex: new RegExp(q, "i") },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $match: {
          "category.storeType": "offline",
        },
      },
    ]);
    const vendorIds = results
      .map((product) => product.vendor_id) // adjust if vendor_id is elsewhere (like product.category.vendor_id)
      .filter((id) => id !== undefined); // filter out undefined vendor IDs if any

    console.log("Vendor IDs:", vendorIds);

    // Fetch vendor documents matching those IDs
    const vendorDetails = await vendorModel.find({ _id: { $in: vendorIds } });
    console.log("Vendor Models:", vendorDetails);
    res.json({
      products: results,
      vendors: vendorDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error in  Get vendor offline bill generation search bar",
    });
  }
};
