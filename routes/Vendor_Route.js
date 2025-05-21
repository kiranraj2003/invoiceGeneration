// import express from "express";
// import * as Vendor from "../Controller/Vendor_Controller.js";
// import * as Product from "../Controller/Product_Controller.js";
// import * as Review from "../Controller/Review_Controller.js";
// import * as Category from "../Controller/Category_Controller.js";
// import * as subCategory from "../Controller/SubCategory_Controller.js";
// import * as orders from "../Controller/Order_controller.js";
// // import orders from "razorpay/dist/types/orders.js";

// const VendorRoute = express.Router();

// VendorRoute.post("/registerVendor", Vendor.registerVendor);

// VendorRoute.post("/loginVendor", Vendor.vendorLogin);

// VendorRoute.post(
//   "/productCreate",
//   Vendor.authMiddleware,
//   Product.createProduct
// );
// VendorRoute.post(
//   "/updateProduct",
//   Vendor.authMiddleware,
//   Product.updateProduct
// );
// VendorRoute.post(
//   "/deleteproduct",
//   Vendor.authMiddleware,
//   Product.deleteProduct
// );
// VendorRoute.get("/productList", Vendor.authMiddleware, Vendor.getAllProducts);
// VendorRoute.post(
//   "/getAllCategory",
//   Vendor.authMiddleware,
//   Category.getAllCategories
// );
// VendorRoute.post(
//   "/subCategorybyCategory",
//   Vendor.authMiddleware,
//   subCategory.getSubCategoryByCategory
// );
// VendorRoute.get(
//   "/getProductById",
//   Vendor.authMiddleware,
//   Product.getProductById
// );
// VendorRoute.get(
//   "/vendor_dashboard",
//   Vendor.authMiddleware,
//   Vendor.vendor_dashboard
// );
// VendorRoute.get(
//   "/Vendor_orders",
//   Vendor.authMiddleware,
//   orders.getVendorOrders
// );
// VendorRoute.put(
//   "/vendorOrderStatus/:orderId",
//   Vendor.authMiddleware,
//   orders.updateOrderStatus
// );
// VendorRoute.get(
//   "/reviews/:vendorId",
//   Vendor.authMiddleware,
//   Review.getReviewByVendorId
// );
// VendorRoute.get(
//   "/reviews/highestRatedProducts",
//   Vendor.authMiddleware,
//   Review.getHighestRatedProducts
// );

// // VendorRoute.get("/productSaleByVendor",Vendor.authMiddleware,Vendor.productSaleByVendor)
// VendorRoute.post(
//   "/offlineBilling",
//   Vendor.authMiddleware,
//   orders.createOfflineOrder
// );
// export default VendorRoute;




import express from "express";
import * as Vendor from "../Controller/Vendor_Controller.js";

const VendorRoute = express.Router();

VendorRoute.post("/registerVendor", Vendor.registerVendor);

export default VendorRoute;