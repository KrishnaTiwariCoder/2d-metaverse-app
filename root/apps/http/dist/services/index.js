"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateLoginToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const contants_1 = require("../contants");
const generateLoginToken = (data) => {
    return jsonwebtoken_1.default.sign({
        _id: data._id,
        username: data.username,
        type: data.type,
    }, process.env.JWT_SECRET || contants_1.JWT_SECRET);
};
exports.generateLoginToken = generateLoginToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || contants_1.JWT_SECRET);
        return decoded;
    }
    catch (err) {
        console.error(err);
        return null;
    }
};
exports.verifyToken = verifyToken;
