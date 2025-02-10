"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spaceRouter = void 0;
const database_1 = require("@repo/database");
const express_1 = require("express");
const types_1 = require("../../types");
exports.spaceRouter = (0, express_1.Router)();
exports.spaceRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedData = types_1.createSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data", errors: parsedData.error });
        return;
    }
    const { name, dimensions, mapId } = parsedData.data;
    if (!name || !dimensions) {
        res.status(400).json({ error: "Missing fields" });
        return;
    }
    try {
        if (!mapId) {
            const newSpace = yield database_1.space.create({
                name,
                width: dimensions.split("x")[0],
                height: dimensions.split("x")[1],
                createdBy: req.user._id,
            });
            res.status(200).json({ spaceId: newSpace._id });
            return;
        }
        const mapFound = yield database_1.map.findById(mapId);
        if (mapFound) {
            const newSpace = yield database_1.space.create({
                name,
                width: mapFound.width,
                height: mapFound.height,
                mapId,
                createdBy: req.user._id,
                thumbnail: mapFound.thumbnail,
                elements: mapFound.elements,
            });
            res.status(200).json({ spaceId: newSpace._id });
            return;
        }
        else {
            res.status(400).json({ error: "Map not found" });
            return;
        }
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error", message: err });
        return;
    }
}));
exports.spaceRouter.delete("/delete/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { spaceId } = req.body;
    if (!spaceId) {
        res.status(400).json({ error: "Missing space ID" });
        return;
    }
    try {
        const spaceFound = yield database_1.space.findOneAndDelete({
            _id: spaceId,
            createdBy: req.user._id,
        });
        if (!spaceFound) {
            res.status(400).json({ error: "Space not found" });
            return;
        }
        res.status(200).json({ message: "Space deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error", message: err });
        return;
    }
}));
exports.spaceRouter.get("/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // only get the username of the creator
        const spaces = yield database_1.space
            .find({ createdBy: req.user._id })
            .populate("createdBy", "username");
        // const spaces = await space.find({ createdBy: req.user._id });
        const response = spaces.map((spaceE) => ({
            id: spaceE._id,
            name: spaceE.name,
            dimensions: { x: spaceE.width, y: spaceE.height },
            thumbnail: spaceE.thumbnail ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREO3tkIJnmJZcWmgLLR-z973QVHQ8zbwDGnw&s",
            creator: spaceE.createdBy,
        }));
        res.status(200).json({ spaces: response });
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error", message: err });
        return;
    }
}));
exports.spaceRouter.get("/:spaceId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const spaceFound = yield database_1.space
            .findById(req.params.spaceId)
            .populate("elements.id createdBy", "username");
        if (!spaceFound) {
            res.status(400).json({ error: "Space not found" });
            return;
        }
        res.status(200).json({ space: spaceFound });
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error", message: err });
        return;
    }
}));
exports.spaceRouter.post("/element", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedData = types_1.addElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data", errors: parsedData.error });
        return;
    }
    const { elementId, spaceId, x, y } = parsedData.data;
    if (!elementId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    try {
        const elementFound = yield database_1.element.findById(elementId);
        if (!elementFound) {
            res.status(400).json({ error: "Element not found" });
            return;
        }
        const spaceFound = yield database_1.space.findById(spaceId);
        if (!spaceFound) {
            res.status(400).json({ error: "Space not found" });
            return;
        }
        if (spaceFound.createdBy.toString() !== req.user._id.toString()) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (x > spaceFound.width || y > spaceFound.height) {
            res.status(400).json({ error: "Invalid coordinates" });
            return;
        }
        spaceFound.elements.push({ id: elementId, x, y });
        yield spaceFound.save();
        res.status(200).json({ message: "Element added to space successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error });
        return;
    }
}));
exports.spaceRouter.delete("/element", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { elementId, spaceId, x, y } = req.body;
    if (!elementId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    try {
        const spaceFound = yield database_1.space.findById(spaceId);
        if (!spaceFound) {
            res.status(400).json({ error: "Space not found" });
            return;
        }
        if (spaceFound.createdBy.toString() !== req.user._id.toString()) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!spaceFound.elements.find((element) => element.x === x &&
            element.y === y &&
            element.id.toString() == elementId.toString())) {
            res.status(400).json({ error: "Element not found" });
            return;
        }
        // spaceFound.elements = spaceFound.elements.filter((element) => {
        //   if (element.id === elementId) return false;
        //   return true;
        // });
        spaceFound.set("elements", spaceFound.elements.filter((element) => element.id.toString() !== elementId.toString() &&
            element.x !== x &&
            element.y !== y));
        yield spaceFound.save();
        res
            .status(200)
            .json({ message: "Element removed from space successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error });
        return;
    }
}));
