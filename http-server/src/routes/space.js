import express from "express";
import {
  createSpace,
  deleteSpace,
  getAllTheSpaces,
} from "../controllers/space.js";

const app = express.Router();

app.post("/create", createSpace);

// Delete a space
app.delete("/delete/", deleteSpace);

// Get all spaces
app.get("/all", getAllTheSpaces);

app.get("/:spaceId", async (req, res) => {
  const { spaceId } = req.params;
  if (!spaceId) return res.status(400).json({ error: "Missing space ID" });

  const space = await Space.findById(spaceId);
  if (!space) return res.status(400).json({ error: "Space not found" });

  res.status(200).json({
    dimensions: space.dimensions,
    elements: space.elements,
  });
});

app.post("/element", async (req, res) => {
  const { elementId, spaceId, x, y } = req.body;

  if (!elementId || !spaceId || x === undefined || y === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const space = await Space.findById(spaceId);
  if (!space) {
    return res.status(400).json({ error: "Space not found" });
  }

  const newElement = {
    id: elementId,
    x,
    y,
  };

  space.elements.push(newElement);
  await space.save();

  res.status(200).json({ message: "Element added successfully" });
});

app.delete("/element", async (req, res) => {
  const { elementId, spaceId } = req.body;

  if (!elementId || !spaceId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const space = await Space.findById(spaceId);
  if (!space) {
    return res.status(400).json({ error: "Space not found" });
  }

  const elementIndex = space.elements.findIndex(
    (element) => element.id === elementId
  );
  if (elementIndex === -1) {
    return res.status(400).json({ error: "Element not found in space" });
  }

  space.elements.splice(elementIndex, 1);
  await space.save();

  res.status(200).json({ message: "Element deleted successfully" });
});

export default app;
