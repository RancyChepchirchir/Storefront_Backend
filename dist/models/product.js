"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductStore = void 0;
const database_1 = __importDefault(require("../database"));
class ProductStore {
    async index() {
        let connection = null;
        try {
            connection = await database_1.default.connect();
            const products = (await connection.query('SELECT * FROM products;')).rows;
            return products;
        }
        catch (err) {
            throw new Error(`Cannot get products: ${err}`);
        }
        finally {
            if (connection)
                connection.release();
        }
    }
    async show(id) {
        const connection = await database_1.default.connect();
        try {
            const product = (await connection.query('SELECT * FROM products WHERE id=($1);', [id])).rows[0];
            return product;
        }
        catch (err) {
            throw new Error(`Could not find product with id ${id}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async create(product) {
        const connection = await database_1.default.connect();
        try {
            await connection.query('BEGIN');
            const sql = 'INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *';
            const values = [product.name, product.price, product.category];
            const result = await connection.query(sql, values);
            const createdProduct = result.rows[0];
            await connection.query('COMMIT');
            return createdProduct;
        }
        catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Failed to create product ${product.name}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async update(product_id, product) {
        const connection = await database_1.default.connect();
        try {
            await connection.query('BEGIN');
            const sql = 'UPDATE products SET name=$1, price=$2, category=$3 WHERE id=$4 RETURNING *;';
            const sqlValues = [product.name, product.price, product.category, product_id];
            const result = await connection.query(sql, sqlValues);
            const updatedProduct = result.rows[0];
            await connection.query('COMMIT');
            return updatedProduct;
        }
        catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not update product ${product.name}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async delete(id) {
        const connection = await database_1.default.connect();
        try {
            await connection.query('BEGIN');
            const sql = 'DELETE FROM products WHERE id=($1);';
            const sqlValues = [id];
            const result = await connection.query(sql, sqlValues);
            const deletedProduct = result.rows[0];
            await connection.query('COMMIT');
            return deletedProduct;
        }
        catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not delete product. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
}
exports.ProductStore = ProductStore;
