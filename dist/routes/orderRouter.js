"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_1 = require("./../models/order");
const express_1 = __importDefault(require("express"));
const VerifyAuthToken_1 = __importDefault(require("../middleware/VerifyAuthToken"));
const orderStore = new order_1.OrderStore();
const orderRouter = express_1.default.Router();
// Handler
const addProductToOrder = async (req, res) => {
    const orderProduct = req.body;
    const order_id = parseInt(req.params['id'], 10);
    try {
        const createdOrderProduct = await orderStore.addProductToOrder(order_id, orderProduct);
        if (!createdOrderProduct) {
            throw new Error('Could not add product to order');
        }
        res.status(201).json(createdOrderProduct);
    }
    catch (e) {
        res.status(500).send(e);
    }
};
const createOrder = async (req, res) => {
    const user_id = req.body.user_id;
    const products = req.body.products;
    try {
        if (!user_id || !products || !products.length) {
            throw new Error('Invalid request. Please provide a user_id and a products array');
        }
        const orderProducts = await orderStore.createOrder(user_id, products);
        if (!orderProducts) {
            throw new Error('Could not create order');
        }
        res.status(201).json(orderProducts);
    }
    catch (e) {
        res.status(500).send(e);
    }
};
const getAllOrders = async (_req, res) => {
    try {
        const orders = await orderStore.getAllOrders();
        res.json(orders);
    }
    catch (e) {
        res.status(500).send(e);
    }
};
const getOrder = async (req, res) => {
    const order_id = parseInt(req.params['id'], 10);
    try {
        const order = await orderStore.getOrder(order_id);
        if (!order) {
            res.status(404).send(`Could not find order ${order_id}`);
            return;
        }
        res.json(order);
    }
    catch (e) {
        res.status(500).send(e);
    }
};
const getProductsFromOrder = async (req, res) => {
    const order_id = parseInt(req.params['id'], 10);
    try {
        const products = await orderStore.getProductsFromOrder(order_id);
        if (!products || !products.length) {
            res.status(404).send(`Could not find products for order ${order_id}`);
            return;
        }
        res.json(products);
    }
    catch (e) {
        res.status(500).send(e);
    }
};
const getOrdersByUser = async (req, res) => {
    const user_id = parseInt(req.params['id'], 10);
    try {
        const orders = await orderStore.getOrdersByUser(user_id);
        if (!orders || !orders.length) {
            res.status(404).send(`Could not find orders for user ${user_id}`);
            return;
        }
        res.json(orders);
    }
    catch (e) {
        res.status(500).send(e);
    }
};
const deleteOrder = async (req, res) => {
    const order_id = parseInt(req.params['id'], 10);
    try {
        const deletedOrder = await orderStore.deleteOrder(order_id);
        res.json(deletedOrder);
    }
    catch (e) {
        res.status(500).send(e);
    }
};
// Routes
orderRouter.post('/:id/product', VerifyAuthToken_1.default, addProductToOrder);
orderRouter.post('/', VerifyAuthToken_1.default, createOrder);
orderRouter.get('/:id', VerifyAuthToken_1.default, getOrder);
orderRouter.get('/:id/products', VerifyAuthToken_1.default, getProductsFromOrder);
orderRouter.get('/', VerifyAuthToken_1.default, getAllOrders);
orderRouter.get('/ordersByUser/:id', VerifyAuthToken_1.default, getOrdersByUser);
orderRouter.delete('/:id', VerifyAuthToken_1.default, deleteOrder);
exports.default = orderRouter;
