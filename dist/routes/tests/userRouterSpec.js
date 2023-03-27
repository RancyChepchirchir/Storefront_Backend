"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = __importDefault(require("../../server"));
let demoToken;
let demoUser;
const { DEMO_USER_PASSWORD } = process.env;
beforeAll(async () => {
    demoToken = (await (0, supertest_1.default)(server_1.default).post('/users/demoUser').expect(201)).body;
    demoUser = jsonwebtoken_1.default.decode(demoToken);
});
describe('GET /users', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).get('/users').expect(401, done);
    });
    it('should respond with 200', (done) => {
        (0, supertest_1.default)(server_1.default).get('/users').auth(demoToken, { type: 'bearer' }).expect(200, done);
    });
});
describe('POST /users', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).post('/users').expect(401, done);
    });
    it('should create a user', (done) => {
        (0, supertest_1.default)(server_1.default)
            .post('/users')
            .auth(demoToken, { type: 'bearer' })
            .send({
            first_name: 'Luke',
            last_name: 'Skywalker',
            email: 'luke.skywalker@jedi-acedmy.com',
            password: 'theforceiswithme',
        })
            .expect(201, done);
    });
    it('should respond with 500 if called incorrect', (done) => {
        (0, supertest_1.default)(server_1.default)
            .post('/users')
            .auth(demoToken, { type: 'bearer' })
            .send({
            first_name: 'Luke',
            email: 'luke.skywalker@jedi-acedmy.com',
            password: 'theforceiswithme',
        })
            .expect(500, done);
    });
});
describe('PUT /users/:id', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).put('/users/1').expect(401, done);
    });
    it('should update a user', async () => {
        const encodedJWT = (await (0, supertest_1.default)(server_1.default)
            .post('/users')
            .auth(demoToken, { type: 'bearer' })
            .send({
            first_name: 'Dath',
            last_name: 'Vader',
            email: 'darth.vader@thedarkside.com',
            password: 'empireneedsme',
        })
            .expect(201)).body;
        const userJWT = jsonwebtoken_1.default.decode(encodedJWT);
        await (0, supertest_1.default)(server_1.default)
            .put(`/users/${userJWT.user.id}`)
            .auth(encodedJWT, { type: 'bearer' })
            .send({
            first_name: 'Darth',
            last_name: 'Vader',
            email: 'darth.vader@thedarkside.com',
            password: 'empireneedsyou',
        })
            .expect(200);
    });
    it('should respond with 500 if called incorrect', (done) => {
        (0, supertest_1.default)(server_1.default)
            .put(`/users/${demoUser.user.id}`)
            .auth(demoToken, { type: 'bearer' })
            .send({
            first_name: 'John',
            email: 'john.doe@test.com',
        })
            .expect(500, done);
    });
});
describe('GET /users/:id', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).get('/users/1').expect(401, done);
    });
    it('should respond with 200', (done) => {
        (0, supertest_1.default)(server_1.default).get('/users/1').auth(demoToken, { type: 'bearer' }).expect(200, done);
    });
});
describe('POST /users/login', () => {
    it('should respond with 200', (done) => {
        (0, supertest_1.default)(server_1.default)
            .post('/users/login')
            .auth(demoToken, { type: 'bearer' })
            .send({
            email: 'john.doe@test.com',
            password: DEMO_USER_PASSWORD,
        })
            .expect(200, done);
    });
    it('should respond with 500 if user does not exist', (done) => {
        (0, supertest_1.default)(server_1.default)
            .post('/users/login')
            .auth(demoToken, { type: 'bearer' })
            .send({
            email: 'luke.skywalker@jedi.com',
            password: 'theforceiswithme',
        })
            .expect(500, done);
    });
});
describe('DELETE /users/:id', () => {
    it('should respond with 401 if called without auth token', (done) => {
        (0, supertest_1.default)(server_1.default).delete('/users/1').expect(401, done);
    });
    it('should respond with 200', async () => {
        const encryptedJWT = (await (0, supertest_1.default)(server_1.default)
            .post('/users')
            .auth(demoToken, { type: 'bearer' })
            .send({
            first_name: 'Darth',
            last_name: 'Vader',
            email: 'darth.vader@thedarkside.com',
            password: 'empireneedsyou',
        })
            .expect(201)).body;
        const userJWT = jsonwebtoken_1.default.decode(encryptedJWT);
        await (0, supertest_1.default)(server_1.default).delete(`/users/${userJWT.user.id}`).auth(encryptedJWT, { type: 'bearer' }).expect(200);
    });
    it('should respond with 401 if other user tries to delete', async () => {
        const encryptedJWT = (await (0, supertest_1.default)(server_1.default)
            .post('/users')
            .auth(demoToken, { type: 'bearer' })
            .send({
            first_name: 'Darth',
            last_name: 'Vader',
            email: 'darth.vader@thedarkside.com',
            password: 'empireneedsyou',
        })
            .expect(201)).body;
        const userJWT = jsonwebtoken_1.default.decode(encryptedJWT);
        await (0, supertest_1.default)(server_1.default).delete(`/users/${userJWT.user.id}`).auth(demoToken, { type: 'bearer' }).expect(401);
    });
});
