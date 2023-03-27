"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { TOKEN_SECRET } = process.env;
if (!TOKEN_SECRET) {
    throw new Error('Missing env variable: TOKEN_SECRET');
}
const verifyAuthToken = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            throw new Error('Could not parse Header');
        }
        const token = authorizationHeader.split(' ')[1];
        const decodedToken = jsonwebtoken_1.default.verify(token, TOKEN_SECRET);
        if (!decodedToken) {
            throw new Error('Invalid token');
        }
        res.locals['decodedToken'] = decodedToken;
        next();
    }
    catch (e) {
        res.status(401).send(`Invalid token ${e}`);
    }
};
exports.default = verifyAuthToken;
