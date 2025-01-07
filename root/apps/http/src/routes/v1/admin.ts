import { Router } from "express";

export const adminRouter = Router();

// Create an Element
adminRouter.post("/element", (req, res) => {});

// Update an Element
adminRouter.put("/element/:elementId", (req, res) => {});

// Create an Avatar
adminRouter.post("/avatar", (req, res) => {});

// Create a Map
adminRouter.post("/map", (req, res) => {});
