import mongoose from "mongoose";
// import { vendorModel } from "../Model/Vendor_schema";
import { vendorModel } from "../Model/Vendor_schema.js";
import { productModel } from "../Model/Product_schema.js";
import { userModel } from "../Model/user_schema.js";
// for online stock report - kiran  ( vendor side)
export const onlineStockReport = async (req, res) => {
  if (req.user.role === "vendor") {
    try {
      // to check validation for user role for vendor

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
      if (!vendorVerify || vendorVerify.length === 0) {
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
      console.log("Filtered Products Count:", filteredProducts.length);

      // to verify the number of searched and status match the filtered products using filterProducts.length===0
      if (filteredProducts.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No matching products found" });
      }

      res.status(200).json({
        success: true,
        data: [...filteredProducts],
        heading: "Online",
        role: req.user.role,
      });
    } catch (error) {
      console.error("Error filtering products:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  } else {
    res.status(403).json({ success: false, message: "unauthorized access" });
  }
};

/*************************************************************************************************************************** */

// for offline stock report - kiran   (vendor side)
export const offlineStockReport = async (req, res) => {
  if (req.user.role === "vendor") {
    try {
      // to check validation for user role for vendor

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
      if (!vendorVerify || vendorVerify.length === 0) {
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
      console.log("Filtered Products Count:", filteredProducts.length);

      // to verify the number of searched and status match the filtered products using filterProducts.length===0
      if (filteredProducts.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No matching products found" });
      }

      res.status(200).json({
        success: true,
        data: [...filteredProducts],
        heading: "Offline",
        role: req.user.role,
      });
    } catch (error) {
      console.error("Error filtering products:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  } else {
    res.status(403).json({ success: false, message: "unauthorized access" });
  }
};
/********************************************************************************************************************/

// for online vendor stock report - kiran  (admin side)

export const adminOnlineStockReport = async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access" });
  }

  try {
    const adminId = req.user?.id;
    const search = req.query.search?.trim() || "";
    const stock_status = req.query.status?.trim().toLowerCase() || "";
    const vendorId = req.query.vendorId?.trim();

    // Validate adminId
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing admin ID" });
    }

    // Validate vendorId if present
    if (vendorId && !mongoose.Types.ObjectId.isValid(vendorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid vendor ID" });
    }

    // Verify admin exists
    const admin = await userModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Build product query
    const productQuery = {};

    if (vendorId) {
      productQuery.vendor_id = vendorId;
    }
    console.log(productQuery.vendor_id);

    // Fetch products matching vendor filter (if any)
    let products = await productModel
      .find(productQuery)
      .populate({ path: "category_id", select: "name storeType" })
      .populate({ path: "vendor_id", select: "name" })
      .lean();

    console.log("--------------------------------------------", products);
    // Filter products by category storeType 'online'
    products = products.filter(
      (product) => product.category_id?.storeType === "online"
    );

    // Apply search filter on product name or category name
    if (search) {
      const searchRegex = new RegExp(search, "i");
      products = products.filter(
        (product) =>
          searchRegex.test(product.name) ||
          searchRegex.test(product.category_id?.name || "")
      );
    }

    // Apply stock status filter on variants
    if (stock_status) {
      const stockRegex = new RegExp(stock_status, "i");
      products = products
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

    // if (products.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "No matching products found" });
    // }

    // Fetch all unique vendors (for filter dropdown)
    const allProducts = await productModel
      .find({})
      .populate({ path: "vendor_id", select: "name" })
      .lean();

    // const uniqueVendors = allProducts
    //   .map((p) => p.vendor_id)
    //   .filter(
    //     (v, idx, self) =>
    //       v &&
    //       self.findIndex((x) => x._id.toString() === v._id.toString()) === idx
    //   );
    const vendors = await vendorModel
      .find({ name: { $exists: true, $ne: "" } }, { name: 1 })
      .lean();

    // Filter unique vendor names in JavaScript
    const uniqueVendorsMap = new Map();

    vendors.forEach((vendor) => {
      if (!uniqueVendorsMap.has(vendor.name)) {
        uniqueVendorsMap.set(vendor.name, vendor);
      }
    });

    const uniqueVendors = Array.from(uniqueVendorsMap.values());

    console.log(uniqueVendors);
    res.status(200).json({
      success: true,
      data: products,
      heading: "Vendor Online",
      role: req.user.role,
      vendors: uniqueVendors,
    });
  } catch (error) {
    console.error("Error filtering products:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// for offline vendor stock report - kiran  (admin side)
export const adminOfflineStockReport = async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access" });
  }

  try {
    const adminId = req.user?.id;
    const search = req.query.search?.trim() || "";
    const stock_status = req.query.status?.trim().toLowerCase() || "";
    const vendorId = req.query.vendorId?.trim();

    // Validate adminId
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing admin ID" });
    }

    // Validate vendorId if present
    if (vendorId && !mongoose.Types.ObjectId.isValid(vendorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid vendor ID" });
    }

    // Verify admin exists
    const admin = await userModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Build product query
    const productQuery = {};

    if (vendorId) {
      productQuery.vendor_id = vendorId;
    }
    console.log(productQuery.vendor_id);

    // Fetch products matching vendor filter (if any)
    let products = await productModel
      .find(productQuery)
      .populate({ path: "category_id", select: "name storeType" })
      .populate({ path: "vendor_id", select: "name" })
      .lean();

    console.log("--------------------------------------------", products);
    // Filter products by category storeType 'online'
    products = products.filter(
      (product) => product.category_id?.storeType === "offline"
    );

    // Apply search filter on product name or category name
    if (search) {
      const searchRegex = new RegExp(search, "i");
      products = products.filter(
        (product) =>
          searchRegex.test(product.name) ||
          searchRegex.test(product.category_id?.name || "")
      );
    }

    // Apply stock status filter on variants
    if (stock_status) {
      const stockRegex = new RegExp(stock_status, "i");
      products = products
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

    // if (products.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "No matching products found" });
    // }

    // Fetch all unique vendors (for filter dropdown)
    const allProducts = await productModel
      .find({})
      .populate({ path: "vendor_id", select: "name" })
      .lean();

    // const uniqueVendors = allProducts
    //   .map((p) => p.vendor_id)
    //   .filter(
    //     (v, idx, self) =>
    //       v &&
    //       self.findIndex((x) => x._id.toString() === v._id.toString()) === idx
    //   );
    const vendors = await vendorModel
      .find({ name: { $exists: true, $ne: "" } }, { name: 1 })
      .lean();

    // Filter unique vendor names in JavaScript
    const uniqueVendorsMap = new Map();

    vendors.forEach((vendor) => {
      if (!uniqueVendorsMap.has(vendor.name)) {
        uniqueVendorsMap.set(vendor.name, vendor);
      }
    });

    const uniqueVendors = Array.from(uniqueVendorsMap.values());

    console.log(uniqueVendors);
    res.status(200).json({
      success: true,
      data: products,
      heading: "Vendor Offline",
      role: req.user.role,
      vendors: uniqueVendors,
    });
  } catch (error) {
    console.error("Error filtering products:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
