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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const database_1 = require("@repo/database");
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const types_1 = require("../../types");
const services_1 = require("../../services");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedData = types_1.loginSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data", errors: parsedData.error });
        return;
    }
    const { username, password } = parsedData.data;
    if (!username || !password) {
        res.status(400).json({ error: "All fields are required" });
        return;
    }
    try {
        // Find the user in the database
        const userFound = yield database_1.user.findOne({ username });
        if (!userFound) {
            res.status(403).json({ error: "Invalid credentials" });
            return;
        }
        // Verify the password
        const isMatch = yield bcrypt_1.default.compare(password, userFound.password);
        if (!isMatch) {
            res.status(403).json({ error: "Invalid credentials" });
            return;
        }
        // Generate a JWT token
        const token = (0, services_1.generateLoginToken)(userFound);
        res.status(200).json({ token });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(403).json({ error: "Internal server error" });
        return;
    }
}));
exports.authRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedData = types_1.signupSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data", errors: parsedData.error });
        return;
    }
    const { username, password, type } = parsedData.data;
    if (!username || !password || !type) {
        res.status(400).json({ error: "All fields are required" });
        return;
    }
    try {
        // Check if the user already exists
        const existingUser = yield database_1.user.findOne({ username });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }
        // Hash the password and create a new user
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new database_1.user({ username, password: hashedPassword, type });
        yield newUser.save();
        res.status(200).json({ userId: newUser._id });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(403).json({ error: "Internal server error" });
        return;
    }
}));
