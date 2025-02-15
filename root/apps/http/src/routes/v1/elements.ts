import { element } from "@repo/database";
import { Router } from "express";

export const elementRouter = Router();

elementRouter.get("/", async (req, res) => {
  try {
    const elements = await element.find();
    if (!elements) {
      res.status(404).json({ error: "Element not found" });
      return;
    }
    res.status(200).json(elements);
    return;
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});
