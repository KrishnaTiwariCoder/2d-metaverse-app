import Map from "../models/map.js";

import Space from "../models/space.js";

export const createSpace = async (req, res) => {
  const { name, dimensions, mapId } = req.body;
  if (!name || !dimensions || !mapId)
    return res.status(400).json({ error: "Missing fields" });

  const map = await Map.findById(mapId);

  const newSpace = await Space.create({
    name,
    x: dimensions.x,
    y: dimensions.y,
    mapId,
    createdBy: req.user._id,
    thumbnail: map.thumbnail,
  });
  res.status(200).json({ spaceId: newSpace._id });
};

export const deleteSpace = async (req, res) => {
  const { spaceId } = req.body;
  if (!spaceId) return res.status(400).json({ error: "Missing space ID" });

  const space = await Space.findOneAndDelete({
    _id: spaceId,
    createdBy: req.user._id,
  });
  if (!space) return res.status(400).json({ error: "Space not found" });

  res.status(200).json({ message: "Space deleted successfully" });
};

export const getAllTheSpaces = async (req, res) => {
  const spaces = await Space.find({ createdBy: req.user._id });
  const response = spaces.map((space) => ({
    id: space._id,
    name: space.name,
    dimensions: { x: space.x, y: space.y },
    thumbnail: space.thumbnail || "https://default-thumbnail.com/default.png",
  }));
  res.status(200).json({ spaces: response });
};

export const addElementToSpace = async (req, res) => {
  const { elementId, spaceId, x, y } = req.body;

  if (!elementId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const element = await Element.findById(elementId);
  if (!element) {
    return res.status(400).json({ error: "Element not found" });
  }
  const space = await Space.findById(spaceId);
  if (!space) return res.status(400).json({ error: "Space not found" });

  space.elements.push({ id: elementId, x, y });

  await space.save();

  res.status(200).json({ message: "Element added to space successfully" });
};
