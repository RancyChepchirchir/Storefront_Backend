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
});
describe('GET /products', () => {
    it('should respond with 200', (done) => {
        (0, supertest_1.default)(server_1.default).get('/products').auth(demoToken, { type: 'bearer' }).expect(200, done);
    });
});
describe('GET /products/:id', () => {
    it('should respond with 200', (done) => {
        (0, supertest_1.default)(server_1.default).get('/products/1').auth(demoToken, { type: 'bearer' }).expect(200, done);
    });
    it('should respond with 404 if product does not exist', (done) => {
        (0, supertest_1.default)(server_1.default).get('/product/1000').auth(demoToken, { type: 'bearer' }).expect(404, done);
    });
});
describe('POST /products', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).post('/products').expect(401, done);
    });
    it('should create a product', (done) => {
        (0, supertest_1.default)(server_1.default)
            .post('/products')
            .send({
            name: 'Test product 2',
            price: 0,
            category: 'Test',
        })
            .auth(demoToken, { type: 'bearer' })
            .expect(201, done);
    });
    it('should respond with 500 if called incorrect', (done) => {
        (0, supertest_1.default)(server_1.default)
            .post('/products')
            .send({
            name: 'Test product 2',
        })
            .auth(demoToken, { type: 'bearer' })
            .expect(500, done);
    });
});
describe('PUT /products/:id', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).put('/products/1').expect(401, done);
    });
    it('should respond with 500 if called incorrect', (done) => {
        (0, supertest_1.default)(server_1.default)
            .put('/products/1')
            .send({
            name: 'Test product 1',
        })
            .auth(demoToken, { type: 'bearer' })
            .expect(500, done);
    });
});
describe('DELETE /products/:id', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).delete('/products/1').expect(401, done);
    });
    it('should respond with 200', async () => {
        const product = (await (0, supertest_1.default)(server_1.default)
            .post('/products')
            .send({
            name: 'Test product 2',
            price: 0,
            category: 'Test',
        })
            .auth(demoToken, { type: 'bearer' })
            .expect(201)).body;
        await (0, supertest_1.default)(server_1.default).delete(`/products/${product.id}`).auth(demoToken, { type: 'bearer' }).expect(200);
    });
    it('should respond with 404 if product does not exist', (done) => {
        (0, supertest_1.default)(server_1.default).delete('/product/1000').auth(demoToken, { type: 'bearer' }).expect(404, done);
    });
});
