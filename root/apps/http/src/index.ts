import express from "express";
import router from "./routes/v1";

import { connectDB } from "@repo/database";
const app = express();
app.use(express.json());
connectDB();

app.use("/api/v1/", router);

app.listen(process.env.PORT || 3000);
