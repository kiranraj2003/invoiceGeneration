import express from 'express';
import * as Order from '../Controller/Order_Controller.js';
import * as Product from '../Controller/Product_Controller.js';
import { productModel } from '../Model/Product_schema.js';
const ProductRoute = express.Router();


ProductRoute.post('/createproduct', Product.createProduct);
ProductRoute.get('/getallproducts',Product.getAllProducts)


export default ProductRoute;