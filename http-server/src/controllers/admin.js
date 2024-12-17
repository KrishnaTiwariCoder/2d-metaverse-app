import Map from "../models/map.js";
import Element from "../models/element.js";
import Avatar from "../models/avatar.js";

export const createElement = async (req, res) => {
  const { imageUrl, width, height, statics } = req.body;

  if (!imageUrl || !width || !height || statics === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newElement = new Element({
    imageUrl,
    width,
    height,
    statics,
  });

  await newElement.save();

  res.status(200).json({ id: newElement._id });
};

export const updateAnElement = async (req, res) => {
  const { elementId } = req.params;
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const element = await Element.findById(elementId);
  if (!element) {
    return res.status(400).json({ error: "Element not found" });
  }

  // Update imageUrl, cannot update width and height
  element.imageUrl = imageUrl;

  await element.save();

  res.status(200).json({ message: "Element updated successfully" });
};

export const createAnAvatar = async (req, res) => {
  const { imageUrl, name } = req.body;

  if (!imageUrl || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newAvatar = new Avatar({
    imageUrl,
    name,
  });

  await newAvatar.save();

  res.status(200).json({ avatarId: newAvatar._id });
};

export const createAMap = async (req, res) => {
  const { thumbnail, dimensions, name, elements } = req.body;

  if (!thumbnail || !dimensions || !name || !elements) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Create a new map with the given information
  const newMap = new Map({
    thumbnail,
    x: dimensions.x,
    y: dimensions.y,
    name,
    elements,
  });

  await newMap.save();

  res.status(200).json({ id: newMap._id });
};

export const addElementsToTheMap = async (req, res) => {
  const { elementId, mapId, x, y } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const element = await Element.findById(id);
  if (!element) {
    return res.status(400).json({ error: "Element not found" });
  }

  // Update imageUrl, cannot update width and height
  const map = await Map.findById(mapId);
  if (!map) return res.status(400).json({ error: "Map not found" });

  map.elements.push({ id: elementId, x, y });
  await map.save();

  res.status(200).json({ message: "Element added to map successfully" });
};
