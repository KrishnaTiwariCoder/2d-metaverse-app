import { Router } from "express";

export const spaceRouter = Router();

spaceRouter.post("/create", (req, res) => {});
spaceRouter.delete("/delete/", (req, res) => {});
spaceRouter.get("/all", (req, res) => {});
spaceRouter.get("/:spaceId", (req, res) => {});

spaceRouter.post("/element", (req, res) => {});

spaceRouter.delete("/element", (req, res) => {});
