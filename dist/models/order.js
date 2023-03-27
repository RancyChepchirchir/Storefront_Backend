"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStore = void 0;
const database_1 = __importDefault(require("../database"));
class OrderStore {
    async createOrder(user_id, products) {
        const connection = await database_1.default.connect();
        try {
            await connection.query('BEGIN');
            const userSQL = 'SELECT * from users where id=($1);';
            const user = (await connection.query(userSQL, [user_id])).rows[0];
            if (!user) {
                throw new Error(`Could not find user with id: ${user_id}`);
            }
            const createOrderSQL = 'INSERT INTO orders (status, user_id) VALUES ($1, $2) RETURNING *;';
            const order = (await connection.query(createOrderSQL, ['active', user_id])).rows[0];
            if (!order) {
                throw new Error('Could not create new order');
            }
            const addProductSQL = 'INSERT INTO order_products (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *;';
            const productPromises = products.map(async (product) => {
                const sqlProductValues = [product.quantity, order.id, product.product_id];
                const createdOrderProduct = (await connection.query(addProductSQL, sqlProductValues))
                    .rows[0];
                if (!createdOrderProduct) {
                    throw new Error('Could not add product to order');
                }
                return createdOrderProduct;
            });
            const addedProducts = await Promise.all(productPromises);
            await connection.query('COMMIT');
            return addedProducts;
        }
        catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not create order for user: ${user_id}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async getAllOrders() {
        const connection = await database_1.default.connect();
        try {
            const sql = 'SELECT * FROM orders;';
            const orders = (await connection.query(sql)).rows;
            return orders;
        }
        catch (err) {
            throw new Error(`Could not get orders. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async getOrder(order_id) {
        const connection = await database_1.default.connect();
        try {
            const sql = 'SELECT * FROM orders WHERE id=($1);';
            const order = (await connection.query(sql, [order_id])).rows[0];
            return order;
        }
        catch (err) {
            throw new Error(`Could not get order with id: ${order_id}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async getProductsFromOrder(order_id) {
        const connection = await database_1.default.connect();
        try {
            const sql = 'SELECT p.id, name, price, category FROM products p INNER JOIN order_products o ON p.id=o.product_id WHERE o.order_id=($1);';
            const products = (await connection.query(sql, [order_id])).rows;
            return products;
        }
        catch (err) {
            throw new Error(`Could not get products for order: ${order_id}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async getOrdersByUser(user_id) {
        const connection = await database_1.default.connect();
        try {
            const sql = 'SELECT * FROM orders WHERE user_id=($1);';
            const orders = (await connection.query(sql, [user_id])).rows;
            return orders;
        }
        catch (err) {
            throw new Error(`Could not get orders for user: ${user_id}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async addProductToOrder(order_id, orderProduct) {
        const connection = await database_1.default.connect();
        try {
            await connection.query('BEGIN');
            const orderSQL = 'SELECT * FROM orders WHERE id=($1);';
            const order = (await connection.query(orderSQL, [order_id])).rows[0];
            if (!order) {
                throw new Error('Order does not exist, you may have to create it first');
            }
            if (order.status !== 'active') {
                throw new Error(`Order has status ${order.status}, can not add new products anymore`);
            }
            const sql = 'INSERT INTO order_products (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *;';
            const sqlValues = [orderProduct.quantity, order_id, orderProduct.product_id];
            const createdOrderProduct = (await connection.query(sql, sqlValues)).rows[0];
            await connection.query('COMMIT');
            return createdOrderProduct;
        }
        catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not add product ${orderProduct.product_id} to order ${order_id}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async deleteOrder(order_id) {
        const connection = await database_1.default.connect();
        try {
            await connection.query('BEGIN');
            const orderSQL = 'SELECT * FROM orders WHERE id=($1);';
            const order = (await connection.query(orderSQL, [order_id])).rows[0];
            if (!order) {
                throw new Error('Order does not exist, you may have to create it first');
            }
            if (order.status !== 'active') {
                throw new Error(`Order has status ${order.status}, can not delete order anymore`);
            }
            const deleteProductsFromOrdersSQL = 'DELETE FROM order_products WHERE order_id=($1) RETURNING *;';
            const deleteOrderSQL = 'DELETE FROM orders WHERE id=($1) RETURNING *;';
            const deletedProducts = (await connection.query(deleteProductsFromOrdersSQL, [order_id]))
                .rows;
            const deletedOrder = (await connection.query(deleteOrderSQL, [order_id])).rows[0];
            await connection.query('COMMIT');
            return {
                deletedProducts,
                deletedOrder,
            };
        }
        catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not delete order ${order_id}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
}
exports.OrderStore = OrderStore;
