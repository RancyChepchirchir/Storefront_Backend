"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_1 = require("../models/product");
const VerifyAuthToken_1 = __importDefault(require("../middleware/VerifyAuthToken"));
const productStore = new product_1.ProductStore();
const productRouter = express_1.default.Router();
// Handler
const getAllProducts = async (req, res) => {
    try {
        const products = await productStore.index();
        res.json(products);
    }
    catch (e) {
        res.status(500).send(e);
    }
};
const getProduct = async (req, res) => {
    try {
        const product = await productStore.show(parseInt(req.params['id']));
        if (product) {
            res.status(200).json(product);
        }
        else {
            res.status(404).send('Product not found');
        }
    }
    catch (e) {
        res.status(500).send(e);
    }
};
const updateProduct = async (req, res) => {
    try {
        const product_id = parseInt(req.params['id']);
        const newProduct = req.body;
        if (!newProduct.category || !newProduct.name || !newProduct.price) {
            throw new Error('Missing product properties');
        }
        const existingProduct = await productStore.show(product_id);
        if (existingProduct) {
            const updatedProduct = await productStore.update(product_id, newProduct);
            res.status(200).json(updatedProduct);
        }
        else {
            res.status(404).send('Could not update product, id not found');
        }
    }
    catch (e) {
        res.status(500).send(e);
    }
};
const addProduct = async (req, res) => {
    try {
        const newProduct = req.body;
        const createdProduct = await productStore.create(newProduct);
        res.status(201).json(createdProduct);
    }
    catch (e) {
        res.status(500).send(e);
    }
};
const deleteProduct = async (req, res) => {
    try {
        const product_id = parseInt(req.params['id']);
        const deletedProduct = await productStore.delete(product_id);
        res.status(200).json(deletedProduct);
    }
    catch (e) {
        res.status(500).send(e);
    }
};
// Routes
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProduct);
productRouter.put('/:id', VerifyAuthToken_1.default, updateProduct);
productRouter.post('/', VerifyAuthToken_1.default, addProduct);
productRouter.delete('/:id', VerifyAuthToken_1.default, deleteProduct);
exports.default = productRouter;
