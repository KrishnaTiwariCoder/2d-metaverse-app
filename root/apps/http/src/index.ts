import express from "express";
import router from "./routes/v1";
import http from "http";

import { connectDB } from "@repo/database";

const app = express();
const server = http.createServer(app);

app.use(express.json());
connectDB();

app.use("/api/v1/", router);

server.listen(process.env.PORT || 3000);
