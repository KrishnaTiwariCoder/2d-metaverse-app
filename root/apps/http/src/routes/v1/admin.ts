import { Router } from "express";
import {
  addElementSchemaToMap,
  createAvatarSchema,
  createElementSchema,
  createMapSchema,
} from "../../types";
import { avatar, element, map } from "@repo/database";

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
  res
    .status(200)
    .json({ message: "Element updated successfully", id: updated._id });
});

// Create an Avatar
adminRouter.post("/avatar", async (req, res) => {
  const parsedData = createAvatarSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data", errors: parsedData.error });
    return;
  }
  const { name, imageUrl } = parsedData.data;
  const newAvatar = await avatar.create({ name, imageUrl });
  if (!newAvatar) {
    res.status(400).json({ error: "Avatar creation failed" });
    return;
  }
  res
    .status(200)
    .json({ message: "Avatar created successfully", id: newAvatar._id });
});

// Create a Map
adminRouter.post("/map", async (req, res) => {
  const parsedData = createMapSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data", errors: parsedData.error });
    return;
  }
  const { thumbnail, dimensions, elements, name } = parsedData.data;
  try {
    const newMap = await map.create({
      thumbnail,
      width: dimensions.split("x")[0],
      height: dimensions.split("x")[1],
      elements,
      name,
      createdBy: req.user._id,
    });
    if (!newMap) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res
      .status(200)
      .json({ message: "Map created successfully", id: newMap._id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

// create a route for adding a new element to a map
adminRouter.post("/map/element", async (req, res) => {
  const parsedData = addElementSchemaToMap.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data", errors: parsedData.error });
    return;
  }
  const { elementId, mapId, x, y } = parsedData.data;

  if (!elementId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const elementFound = await element.findById(elementId);
    if (!elementFound) {
      res.status(400).json({ error: "Element not found" });
      return;
    }
    const mapFound = await map.findById(mapId);
    if (!mapFound) {
      res.status(400).json({ error: "Map not found" });
      return;
    }
    if (mapFound.createdBy.toString() !== req.user._id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (x > mapFound.width || y > mapFound.height) {
      res.status(400).json({ error: "Invalid coordinates" });
      return;
    }
    // return a bad request if some element is already at that position
    if (
      mapFound.elements.find((element) => element.x === x && element.y === y)
    ) {
      res
        .status(400)
        .json({ error: "Element already exists at that position" });
      return;
    }

    mapFound.elements.push({ id: elementId, x, y });

    await mapFound.save();

    res.status(200).json({ message: "Element added to map successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error });
    return;
  }
});
