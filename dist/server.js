"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const product_1 = require("./models/product");
const productRouter_1 = __importDefault(require("./routes/productRouter"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const orderRouter_1 = __importDefault(require("./routes/orderRouter"));
const app = (0, express_1.default)();
const port = 3000;
const productStore = new product_1.ProductStore();
// const corsOptions: CorsOptions = {
//     origin: ['http://localhost:3000'],
// };
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Routes
app.use('/products', productRouter_1.default);
app.use('/users', userRouter_1.default);
app.use('/orders', orderRouter_1.default);
app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.get('/test', function (req, res) {
    // productStore.create({
    //     name: 'test',
    //     quantity: 1,
    //     description: 'Just a test product',
    // }).then((product) => {
    //     console.log(product)
    //     res.json(product);
    // })
    productStore.index().then((product) => {
        console.log(product);
        res.json(product);
    });
});
app.listen(port, function () {
    console.log(`starting app on port: ${port}`);
});
exports.default = app;
