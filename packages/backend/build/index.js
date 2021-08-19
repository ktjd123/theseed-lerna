"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const express_session_1 = __importDefault(require("express-session"));
const routes_1 = __importDefault(require("./routes"));
const server = express_1.default();
const dev = process.env.NODE_ENV === 'development';
const LOCAL_DB = 'theseed';
const MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost/${LOCAL_DB}`;
const SESSION_SECRET = 'jfoiesofj@#JIFSIOfsjieo@320923';
const SESSION_DOMAIN = undefined;
const PORT = 5000;
const main = async () => {
    server.use(body_parser_1.default.urlencoded({ extended: false }));
    server.use(body_parser_1.default.json());
    server.use(compression_1.default());
    server.use(morgan_1.default('dev'));
    mongoose_1.default.Promise = global.Promise;
    await mongoose_1.default
        .connect(MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        autoIndex: true,
    })
        .then((m) => m.connection.getClient())
        .catch(() => {
        console.error('DB NOT CONNECTED');
        process.exit();
    });
    server.use(express_session_1.default({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            maxAge: 365 * (24 * 60 * 60 * 1000),
            domain: dev ? undefined : SESSION_DOMAIN,
        },
        store: connect_mongo_1.default.create({
            mongoUrl: MONGODB_URI,
            ttl: 365 * (24 * 60 * 60 * 1000),
            stringify: false,
        }),
    }));
    const errHandler = (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something Broke');
    };
    server.use(errHandler);
    server.use('/api', routes_1.default);
    server.listen(PORT, () => {
        console.log(`API running on http://localhost:${PORT}/api/`);
    });
};
main();
//# sourceMappingURL=index.js.map