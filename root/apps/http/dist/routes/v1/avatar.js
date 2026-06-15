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
exports.avatarRouter = void 0;
const database_1 = require("@repo/database");
const express_1 = require("express");
exports.avatarRouter = (0, express_1.Router)();
exports.avatarRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const avatars = yield database_1.avatar.find();
        if (!avatars) {
            res.status(404).json({ error: "Avatar not found" });
            return;
        }
        res.status(200).json(avatars);
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
        return;
    }
}));
