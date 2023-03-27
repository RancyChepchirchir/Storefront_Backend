"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_1 = require("../order");
const product_1 = require("../product");
const user_1 = require("../user");
const orderStore = new order_1.OrderStore();
const productStore = new product_1.ProductStore();
const userStore = new user_1.UserStore();
describe('Order Model', () => {
    it('createOrder method should add a order and its products', async () => {
        const user = await userStore.create({
            first_name: 'Test',
            last_name: 'Test',
            email: 'test@test.com',
            password: '1234',
        });
        const product = await productStore.create({
            name: 'Test product',
            price: 0,
            category: 'Test',
        });
        const result = await orderStore.createOrder(user.id, [
            {
                product_id: product.id,
                quantity: 12,
            },
        ]);
        expect(result).toEqual([
            {
                id: result[0].id,
                order_id: result[0].order_id,
                product_id: product.id,
                quantity: 12,
            },
        ]);
    });
    it('getAllOrders method should return a list of orders', async () => {
        const user = await userStore.create({
            first_name: 'Test',
            last_name: 'Test',
            email: 'test@test.com',
            password: '1234',
        });
        const product = await productStore.create({
            name: 'Test product',
            price: 0,
            category: 'Test',
        });
        const result = await orderStore.createOrder(user.id, [
            {
                product_id: product.id,
                quantity: 12,
            },
        ]);
        const orders = await orderStore.getAllOrders();
        expect(orders.length).toBeGreaterThanOrEqual(1);
        expect(orders).toContain({
            id: result[0].order_id,
            status: 'active',
            user_id: user.id,
        });
    });
    it('getOrder method should return the correct order', async () => {
        const user = await userStore.create({
            first_name: 'Test',
            last_name: 'Test',
            email: 'test@test.com',
            password: '1234',
        });
        const product = await productStore.create({
            name: 'Test product',
            price: 0,
            category: 'Test',
        });
        const result = await orderStore.createOrder(user.id, [
            {
                product_id: product.id,
                quantity: 12,
            },
        ]);
        const order = await orderStore.getOrder(result[0].order_id);
        expect(order).toEqual({
            id: result[0].order_id,
            status: 'active',
            user_id: user.id,
        });
    });
    it('getOrdersByUser method should return the correct orders from a user', async () => {
        const user = await userStore.create({
            first_name: 'Test',
            last_name: 'Test',
            email: 'test@test.com',
            password: '1234',
        });
        const product = await productStore.create({
            name: 'Test product',
            price: 0,
            category: 'Test',
        });
        const result = await orderStore.createOrder(user.id, [
            {
                product_id: product.id,
                quantity: 12,
            },
        ]);
        const orders = await orderStore.getOrdersByUser(user.id);
        expect(orders).toContain({
            id: result[0].order_id,
            user_id: user.id,
            status: 'active',
        });
    });
    it('getProductsFromOrder method should return a list of products in the order', async () => {
        const user = await userStore.create({
            first_name: 'Test',
            last_name: 'Test',
            email: 'test@test.com',
            password: '1234',
        });
        const product = await productStore.create({
            name: 'Test product',
            price: 0,
            category: 'Test',
        });
        const testOrderProducts = await orderStore.createOrder(user.id, [
            {
                product_id: product.id,
                quantity: 12,
            },
        ]);
        const result = await orderStore.getProductsFromOrder(testOrderProducts[0].order_id);
        expect(result[0]).toEqual(product);
    });
    it('deleteOrder method should remove the order', async () => {
        const user = await userStore.create({
            first_name: 'Test',
            last_name: 'Test',
            email: 'test@test.com',
            password: '1234',
        });
        const product = await productStore.create({
            name: 'Test product',
            price: 0,
            category: 'Test',
        });
        const testOrderProducts = await orderStore.createOrder(user.id, [
            {
                product_id: product.id,
                quantity: 12,
            },
        ]);
        const result = await orderStore.deleteOrder(testOrderProducts[0].order_id);
        const items = await orderStore.getAllOrders();
        expect(items).not.toContain(result.deletedOrder);
    });
});
