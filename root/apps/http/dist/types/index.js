"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addElementSchemaToMap = exports.createMapSchema = exports.createAvatarSchema = exports.updateElementSchema = exports.createElementSchema = exports.addElementSchema = exports.createSpaceSchema = exports.updateMetadataSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.signupSchema = zod_1.default.object({
    username: zod_1.default.string(),
    password: zod_1.default.string().min(8),
    type: zod_1.default.enum(["admin", "user"]),
});
exports.loginSchema = zod_1.default.object({
    username: zod_1.default.string(),
    password: zod_1.default.string().min(8),
});
exports.updateMetadataSchema = zod_1.default.object({
    avatarId: zod_1.default.string(),
});
exports.createSpaceSchema = zod_1.default.object({
    name: zod_1.default.string(),
    dimensions: zod_1.default.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    mapId: zod_1.default.string().optional(),
});
exports.addElementSchema = zod_1.default.object({
    elementId: zod_1.default.string(),
    spaceId: zod_1.default.string(),
    x: zod_1.default.number(),
    y: zod_1.default.number(),
});
exports.createElementSchema = zod_1.default.object({
    imageUrl: zod_1.default.string(),
    height: zod_1.default.number(),
    width: zod_1.default.number(),
    statics: zod_1.default.boolean(),
});
exports.updateElementSchema = zod_1.default.object({
    elementId: zod_1.default.string(),
    imageUrl: zod_1.default.string(),
});
exports.createAvatarSchema = zod_1.default.object({
    name: zod_1.default.string(),
    imageUrl: zod_1.default.string(),
});
exports.createMapSchema = zod_1.default.object({
    thumbnail: zod_1.default.string(),
    dimensions: zod_1.default.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    elements: zod_1.default
        .array(zod_1.default.object({ id: zod_1.default.string(), x: zod_1.default.number(), y: zod_1.default.number() }))
        .optional(),
    name: zod_1.default.string(),
});
exports.addElementSchemaToMap = zod_1.default.object({
    elementId: zod_1.default.string(),
    mapId: zod_1.default.string(),
    x: zod_1.default.number(),
    y: zod_1.default.number(),
});
