"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStore = void 0;
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { BCRYPT_PASSWORD, SALT_ROUNDS } = process.env;
class UserStore {
    async index() {
        const connection = await database_1.default.connect();
        try {
            const sql = 'SELECT * FROM users;';
            const users = (await connection.query(sql)).rows;
            return users.map(({ password, ...rest }) => rest);
        }
        catch (err) {
            throw new Error(`Cannot get users ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async show(id) {
        const connection = await database_1.default.connect();
        try {
            const sql = 'SELECT * FROM users WHERE id=($1);';
            const sqlValues = [id];
            const users = (await connection.query(sql, sqlValues)).rows;
            return users.map(({ password, ...rest }) => rest)[0];
        }
        catch (err) {
            throw new Error(`Could not find user with id ${id}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async create(user) {
        const connection = await database_1.default.connect();
        try {
            await connection.query('BEGIN');
            const exitsingUserSQL = 'SELECT * from users where email=($1);';
            const sql = 'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *;';
            if (!BCRYPT_PASSWORD) {
                throw new Error('Missing env variable: BCRYPT_PASSWORD');
            }
            if (!SALT_ROUNDS) {
                throw new Error('Missing env variable: SALT_ROUNDS');
            }
            if (!user.first_name || !user.last_name || !user.email || !user.password) {
                throw new Error('Missing user properties');
            }
            const existingUser = (await connection.query(exitsingUserSQL, [user.email])).rows[0];
            if (existingUser) {
                return existingUser;
            }
            const hash = bcrypt_1.default.hashSync(user.password + BCRYPT_PASSWORD, parseInt(SALT_ROUNDS));
            const sqlValues = [user.first_name, user.last_name, user.email, hash];
            const createdUser = (await connection.query(sql, sqlValues)).rows[0];
            await connection.query('COMMIT');
            return createdUser;
        }
        catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not create new user: ${user.first_name} ${user.last_name}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async update(user_id, user) {
        const connection = await database_1.default.connect();
        try {
            await connection.query('BEGIN');
            const sql = user.password
                ? 'UPDATE users SET first_name=($1), last_name=($2), email=($3), password=($4) WHERE id=($5) RETURNING *;'
                : 'UPDATE users SET first_name=($1), last_name=($2), email=($3) WHERE id=($4) RETURNING *;';
            if (!BCRYPT_PASSWORD) {
                throw new Error('Missing env variable: BCRYPT_PASSWORD');
            }
            if (!SALT_ROUNDS) {
                throw new Error('Missing env variable: SALT_ROUNDS');
            }
            if (!user.first_name || !user.last_name || !user.email) {
                throw new Error('Missing user properties');
            }
            const hash = bcrypt_1.default.hashSync(user.password + BCRYPT_PASSWORD, parseInt(SALT_ROUNDS));
            const sqlValues = user.password
                ? [user.first_name, user.last_name, user.email, hash, user_id]
                : [user.first_name, user.last_name, user.email, user_id];
            const updatedUser = (await connection.query(sql, sqlValues)).rows[0];
            await connection.query('COMMIT');
            return updatedUser;
        }
        catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not update user ${user.email}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async delete(id) {
        const connection = await database_1.default.connect();
        try {
            await connection.query('BEGIN');
            const sql = 'DELETE FROM users WHERE id=($1);';
            const sqlValues = [id];
            const deletedUser = (await connection.query(sql, sqlValues)).rows[0];
            await connection.query('COMMIT');
            return deletedUser;
        }
        catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not delete user with id ${id}. Error: ${err}`);
        }
        finally {
            connection.release();
        }
    }
    async authenticate(email, password) {
        const connection = await database_1.default.connect();
        try {
            const sql = 'SELECT * FROM users where email=($1);';
            const sqlValues = [email];
            const user = (await connection.query(sql, sqlValues)).rows[0];
            if (!user) {
                throw new Error('Could not find user');
            }
            if (bcrypt_1.default.compareSync(password + BCRYPT_PASSWORD, user.password || '')) {
                return user;
            }
            return null;
        }
        catch (err) {
            throw new Error(`Cannot authenticate user ${err}`);
        }
        finally {
            connection.release();
        }
    }
}
exports.UserStore = UserStore;
