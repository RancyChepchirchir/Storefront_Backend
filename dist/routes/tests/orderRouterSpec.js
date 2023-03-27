"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../../server"));
let demoToken;
beforeAll(async () => {
    demoToken = (await (0, supertest_1.default)(server_1.default).post('/users/demoUser').expect(201)).body;
    await (0, supertest_1.default)(server_1.default)
        .post('/products')
        .send({
        name: 'Test product',
        price: 0,
        category: 'Test',
    })
        .auth(demoToken, { type: 'bearer' })
        .expect(201);
    await (0, supertest_1.default)(server_1.default)
        .post('/products')
        .send({
        name: 'Test product 2',
        price: 0,
        category: 'Test',
    })
        .auth(demoToken, { type: 'bearer' })
        .expect(201);
    await (0, supertest_1.default)(server_1.default)
        .post('/orders')
        .auth(demoToken, { type: 'bearer' })
        .send({
        user_id: 1,
        products: [
            {
                product_id: 1,
                quantity: 4,
            },
        ],
    })
        .expect(201);
    await (0, supertest_1.default)(server_1.default)
        .post('/orders')
        .auth(demoToken, { type: 'bearer' })
        .send({
        user_id: 1,
        products: [
            {
                product_id: 1,
                quantity: 8,
            },
        ],
    })
        .expect(201);
});
describe('GET /orders', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders').expect(401, done);
    });
    it('should respond with 200', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders').auth(demoToken, { type: 'bearer' }).expect(200, done);
    });
});
describe('POST /orders', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).post('/orders').expect(401, done);
    });
    it('should create an order', (done) => {
        (0, supertest_1.default)(server_1.default)
            .post('/orders')
            .auth(demoToken, { type: 'bearer' })
            .send({
            user_id: 1,
            products: [
                {
                    product_id: 1,
                    quantity: 4,
                },
            ],
        })
            .expect(201, done);
    });
    it('should respond with 500 if called incorrect', (done) => {
        (0, supertest_1.default)(server_1.default)
            .post('/orders')
            .auth(demoToken, { type: 'bearer' })
            .send({
            user_id: 1,
            products: [
                {
                    product_id: null,
                    quantity: null,
                },
            ],
        })
            .expect(500, done);
    });
});
describe('GET /orders/:id', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders/1').expect(401, done);
    });
    it('should respond with 200', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders/1').auth(demoToken, { type: 'bearer' }).expect(200, done);
    });
    it('should respond with 404 if order does not exist', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders/1000').auth(demoToken, { type: 'bearer' }).expect(404, done);
    });
});
describe('GET /orders/:id/products', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders/1/products').expect(401, done);
    });
    it('should respond with 200', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders/1/products').auth(demoToken, { type: 'bearer' }).expect(200, done);
    });
    it('should respond with 404 if order does not exist', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders/1000/products').auth(demoToken, { type: 'bearer' }).expect(404, done);
    });
});
describe('GET /orders/ordersByUser/:id', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders/ordersByUser/1').expect(401, done);
    });
    it('should respond with 200', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders/ordersByUser/1').auth(demoToken, { type: 'bearer' }).expect(200, done);
    });
    it('should respond with 404 if order does not exist', (done) => {
        (0, supertest_1.default)(server_1.default).get('/orders/ordersByUser/1000').auth(demoToken, { type: 'bearer' }).expect(404, done);
    });
});
describe('POST /orders/:id/product', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).post('/orders/1/product').expect(401, done);
    });
    it('should respond with 201', (done) => {
        (0, supertest_1.default)(server_1.default)
            .post('/orders/1/product')
            .auth(demoToken, { type: 'bearer' })
            .send({
            product_id: 2,
            quantity: 8,
        })
            .expect(201, done);
    });
    it('should respond with 500 if order does not exist', (done) => {
        (0, supertest_1.default)(server_1.default).post('/orders/1000/product').auth(demoToken, { type: 'bearer' }).expect(500, done);
    });
});
describe('DELETE /orders/:id', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).delete('/orders/2').expect(401, done);
    });
    it('should respond with 200', (done) => {
        (0, supertest_1.default)(server_1.default).delete('/orders/2').auth(demoToken, { type: 'bearer' }).expect(200, done);
    });
    it('should respond with 500 if order does not exist', () => {
        (0, supertest_1.default)(server_1.default).delete('/orders/1000').auth(demoToken, { type: 'bearer' });
    });
});
