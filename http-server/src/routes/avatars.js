import express from "express";
import { getAvatars } from "../controllers/avatars.js";

const router = express.Router();

router.get("/", getAvatars);

export default router;
