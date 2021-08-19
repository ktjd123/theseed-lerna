"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const models_1 = require("../models");
const router = express_1.default();
router.get('/check', async (req, res) => {
    if (!req.session || !req.session.info)
        return res.json({ code: 1 });
    const account = await models_1.Account.findById(req.session.info._id, { _id: true, id: true }).lean();
    if (!account) {
        req.session.destroy(() => { });
        return res.json({ code: 1 });
    }
    req.session.info = {
        _id: account._id,
        id: account.id,
        role: account.role,
    };
    return res.json(account);
});
router.post('/login', async (req, res) => {
    const schema = joi_1.default.object().keys({
        id: joi_1.default.string().trim().min(3).max(20).required(),
        pw: joi_1.default.string().trim().min(3).max(20).required(),
    });
    const result = schema.validate(req.body);
    if (result.error)
        return res.json({ code: 1 });
    const { id, pw } = result.value;
    const account = await models_1.Account.findOne({ id }, { _id: true, id: true, pw: true }).lean();
    if (!account)
        return res.json({ code: 2 });
    if (!bcryptjs_1.default.compareSync(pw, account.pw))
        return res.json({ code: 3 });
    req.session.info = {
        _id: account._id,
        id: account.id,
        role: account.role,
    };
    return res.json();
});
router.post('/register', async (req, res) => {
    const schema = joi_1.default.object().keys({
        id: joi_1.default.string().trim().min(3).max(20).required(),
        pw: joi_1.default.string().trim().min(3).max(20).required(),
    });
    const result = schema.validate(req.body);
    if (result.error)
        return res.json({ code: 1 });
    const { id, pw } = result.value;
    const account = await models_1.Account.findOne({ id });
    if (account)
        return res.json({ code: 2 });
    const newAccount = new models_1.Account({
        id,
        pw: bcryptjs_1.default.hashSync(pw, 8),
    });
    await newAccount.save();
    req.session.info = {
        _id: newAccount._id,
        id: newAccount.id,
        role: newAccount.role,
    };
    return res.json();
});
exports.default = router;
//# sourceMappingURL=auth.js.map