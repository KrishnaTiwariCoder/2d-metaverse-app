import express from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { avatarRouter } from "./avatar";
import { spaceRouter } from "./space";
import { elementRouter } from "./elements";
import { adminRouter } from "./admin";
import {
  accountExists,
  authenticate,
  isAdmin,
} from "../../middlewares/authenticate";

const router = express.Router();

router.use("/", authRouter);

router.use("/user", authenticate, accountExists, userRouter);
// router.use("/user", userRouter);

router.use("/avatars", authenticate, accountExists, avatarRouter);
// router.use("/avatars", avatarRouter);

router.use("/space", authenticate, accountExists, spaceRouter);
// router.use("/space", spaceRouter);

router.use("/elements", authenticate, accountExists, elementRouter);
// router.use("/elements", elementRouter);

router.use("/admin", authenticate, isAdmin, accountExists, adminRouter);
// router.use("/admin", adminRouter);

router.get("/", (req, res) => {
  res.json({ message: "Entrypoint" });
});

export default router;
