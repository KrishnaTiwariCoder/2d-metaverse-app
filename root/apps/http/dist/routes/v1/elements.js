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
exports.elementRouter = void 0;
const database_1 = require("@repo/database");
const express_1 = require("express");
exports.elementRouter = (0, express_1.Router)();
exports.elementRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const elements = yield database_1.element.find();
        if (!elements) {
            res.status(404).json({ error: "Element not found" });
            return;
        }
        res.status(200).json(elements);
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
        return;
    }
}));
