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
exports.userRouter = void 0;
const database_1 = require("@repo/database");
const express_1 = require("express");
const types_1 = require("../../types");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post("/metadata", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedData = types_1.updateMetadataSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data", errors: parsedData.error });
        return;
    }
    const { avatarId } = req.body;
    if (!avatarId) {
        res.status(400).json({ error: "Missing fields" });
        return;
    }
    try {
        const avatarFound = yield database_1.avatar.findById(avatarId);
        if (!avatarFound) {
            res.status(400).json({ error: "Avatar not found" });
            return;
        }
        const userFound = yield database_1.user.findById(req.user._id);
        if (!userFound) {
            res.status(403).json({ error: "User not found" });
            return;
        }
        userFound.avatarId = avatarFound._id;
        yield userFound.save();
        res.status(200).json({ message: "Metadata updated successfully" });
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error", message: err });
        return;
    }
}));
exports.userRouter.get("/metadata/bulk", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // conver the ids to an array
    const userIdString = req.query.ids || "";
    const ids = userIdString.slice(1, userIdString.length - 1).split(",");
    if (!ids.length || ids[0] === "") {
        res.status(400).json({ error: "No IDs provided" });
        return;
    }
    try {
        const users = yield database_1.user.find({ _id: { $in: ids } });
        const response = users.map((userFound) => ({
            userId: userFound._id,
            imageUrl: userFound.avatarId, // This assumes avatarId is a URL; modify if needed
        }));
        res.status(200).json({ metadata: response });
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error", message: err });
        return;
    }
}));
