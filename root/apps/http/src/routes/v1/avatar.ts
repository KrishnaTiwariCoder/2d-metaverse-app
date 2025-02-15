import { avatar } from "@repo/database";
import { Router } from "express";

export const avatarRouter = Router();

avatarRouter.get("/", async (req, res) => {
  try {
    const avatars = await avatar.find();
    if (!avatars) {
      res.status(404).json({ error: "Avatar not found" });
      return;
    }
    res.status(200).json(avatars);
    return;
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});
