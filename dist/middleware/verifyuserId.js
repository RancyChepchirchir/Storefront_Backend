"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { TOKEN_SECRET } = process.env;
if (!TOKEN_SECRET) {
    throw new Error('Missing env variable: TOKEN_SECRET');
}
const verifyUserId = (req, res, next) => {
    const decodedToken = res.locals['decodedToken'];
    const user_id = req.params['id'] ? parseInt(req.params['id'], 10) : req.body['id'] || req.body['user_id'];
    if (!decodedToken || !decodedToken.user || decodedToken.user.id !== user_id) {
        res.status(401).send('Unauthorized');
        return;
    }
    next();
};
exports.default = verifyUserId;
