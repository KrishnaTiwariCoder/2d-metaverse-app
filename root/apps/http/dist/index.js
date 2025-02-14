"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const v1_1 = __importDefault(require("./routes/v1"));
const http_1 = __importDefault(require("http"));
const database_1 = require("@repo/database");
(0, database_1.connectDB)();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use(express_1.default.json());
app.use("/api/v1/", v1_1.default);
server.listen(process.env.PORT || 3000);
