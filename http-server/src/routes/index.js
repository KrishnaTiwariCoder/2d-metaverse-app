import express from "express";

const app = express.Router();

import authRouter from "./auth.js";
import userRouter from "./user.js";
import avatarRouter from "./avatars.js";
import spaceRouter from "./space.js";
import elementRouter from "./elements.js";
import adminRouter from "./admin.js";
import { authenticate, isAdmin } from "../middlewares/authenticate.js";

app.use("/api/v1/", authRouter);

app.use("/api/v1/user", authenticate, userRouter);

app.use("/api/v1/avatars", authenticate, avatarRouter);

app.use("/api/v1/space", authenticate, spaceRouter);

app.use("/api/v1/elements", authenticate, elementRouter);

app.use("/api/v1/admin", authenticate, isAdmin, adminRouter);

export default app;
