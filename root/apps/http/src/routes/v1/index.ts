import express from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { avatarRouter } from "./avatar";
import { spaceRouter } from "./space";
import { elementRouter } from "./elements";
import { adminRouter } from "./admin";
import { authenticate, isAdmin } from "../../middlewares/authenticate";

const router = express.Router();

router.use("/", authRouter);

router.use("/user", authenticate, userRouter);

router.use("/avatars", authenticate, avatarRouter);

router.use("/space", authenticate, spaceRouter);

router.use("/elements", authenticate, elementRouter);

router.use("/admin", authenticate, isAdmin, adminRouter);

export default router;
