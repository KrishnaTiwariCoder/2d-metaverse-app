import express from "express";
import { metadataBulk, metadataUser } from "../controllers/user.js";

const router = express.Router();

router.post("/metadata", metadataUser);

router.get("/metadata/bulk", metadataBulk);

export default router;
