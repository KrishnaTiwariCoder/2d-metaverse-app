import dotenv from "dotenv";
dotenv.config();

import express from "express";
import router from "./routes/v1";
import http from "http";

import { connectDB } from "@repo/database";
connectDB();

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use("/api/v1/", router);

server.listen(process.env.PORT || 3000);
