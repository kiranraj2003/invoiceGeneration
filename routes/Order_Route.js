import express from 'express';
import * as Order from '../Controller/Order_Controller.js';

const OrderRoute = express.Router();

// Route to create a new order
OrderRoute.post('/createorder', Order.createOrder);


//localhost:5000/api/order/getallorder
http: OrderRoute.get("/getallorder", Order.getAllOrders);

export default OrderRoute;