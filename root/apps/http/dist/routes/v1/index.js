"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const user_1 = require("./user");
const avatar_1 = require("./avatar");
const space_1 = require("./space");
const elements_1 = require("./elements");
const admin_1 = require("./admin");
const authenticate_1 = require("../../middlewares/authenticate");
const router = express_1.default.Router();
router.use("/", auth_1.authRouter);
router.use("/user", authenticate_1.authenticate, authenticate_1.accountExists, user_1.userRouter);
// router.use("/user", userRouter);
router.use("/avatars", authenticate_1.authenticate, authenticate_1.accountExists, avatar_1.avatarRouter);
// router.use("/avatars", avatarRouter);
router.use("/space", authenticate_1.authenticate, authenticate_1.accountExists, space_1.spaceRouter);
// router.use("/space", spaceRouter);
router.use("/elements", authenticate_1.authenticate, authenticate_1.accountExists, elements_1.elementRouter);
// router.use("/elements", elementRouter);
router.use("/admin", authenticate_1.authenticate, authenticate_1.isAdmin, authenticate_1.accountExists, admin_1.adminRouter);
// router.use("/admin", adminRouter);
router.get("/", (req, res) => {
    res.json({ message: "Entrypoint" });
});
exports.default = router;
