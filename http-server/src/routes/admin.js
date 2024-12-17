import express from "express";
import {
  createAMap,
  createAnAvatar,
  createElement,
  updateAnElement,
} from "../controllers/admin.js";

const app = express.Router();

// Create an Element
app.post("/element", createElement);

// Update an Element
app.put("/element/:elementId", updateAnElement);

// Create an Avatar
app.post("/avatar", createAnAvatar);

// Create a Map
app.post("/map", createAMap);

export default app;
