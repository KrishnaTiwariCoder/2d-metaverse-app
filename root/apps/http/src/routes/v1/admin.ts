import { Router } from "express";
import { createElementSchema } from "../../types";
import { avatar, element } from "@repo/database";

export const adminRouter = Router();

// Create an Element
adminRouter.post("/element", async (req, res) => {
  const parsedData = createElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data", errors: parsedData.error });
    return;
  }
  const { imageUrl, width, height, statics } = parsedData.data;

  if (!imageUrl || !width || !height || !statics) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newElement = new element({
    imageUrl,
    width,
    height,
    statics,
  });

  await newElement.save();

  res.status(200).json({ id: newElement._id });
});

// Update an Element
adminRouter.put("/element/:elementId", async (req, res) => {
  const { elementId } = req.params;
  const { imageUrl } = req.body;

  if (!elementId || !imageUrl) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const updated = await element.findByIdAndUpdate(elementId, { imageUrl });
  if (!updated) {
    res.status(404).json({ error: "Element not found" });
    return;
  }
  res.status(200).json({ message: "Element updated successfully" });
});

// Create an Avatar
adminRouter.post("/avatar", async (req, res) => {
  const { name, imageUrl } = req.body;
  if (!name || !imageUrl) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const newAvatar = await avatar.create({ name, imageUrl });
  if (!newAvatar) {
    res.status(400).json({ error: "Avatar creation failed" });
    return;
  }
  res.status(200).json({ message: "Avatar created successfully" });
});

// Create a Map
adminRouter.post("/map", (req, res) => {});
