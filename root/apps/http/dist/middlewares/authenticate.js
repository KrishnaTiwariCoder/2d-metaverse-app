"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountExists = exports.isAdmin = exports.authenticate = void 0;
const database_1 = require("@repo/database");
const services_1 = require("../services");
// Middleware for authentication
const authenticate = (req, res, next) => {
    // Get the Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        res.status(403).json({ error: "Authorization header is missing" });
        return;
    }
    // Extract the token from the header
    const token = authHeader.split(" ")[1]; // 'Bearer <token>'
    if (!token) {
        res.status(403).json({ error: "Token is missing" });
        return;
    }
    // Verify the token
    const decoded = (0, services_1.verifyToken)(token);
    if (!decoded) {
        res.status(403).json({ error: "Token is invalid or expired" });
        return;
    }
    // Attach user info to the request object for further use
    req.user = JSON.parse(JSON.stringify(decoded));
    next(); // Proceed to the next middleware or route handler
};
exports.authenticate = authenticate;
const isAdmin = (req, res, next) => {
    const { type } = req.user;
    if (type === "admin") {
        next();
        return;
    }
    res.status(401).json({ error: "You are not a valid admin" });
};
exports.isAdmin = isAdmin;
const accountExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userfound = yield database_1.user.findOne({ _id: req.user._id });
    if (!userfound) {
        res.status(403).json({ error: "account does not exist now" });
        res;
        return;
    }
    next();
});
exports.accountExists = accountExists;
