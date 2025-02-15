"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnObjectId = exports.user = exports.space = exports.map = exports.element = exports.avatar = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const connectDB = () => {
    console.log(config_1.MONGO_URLL, process.env.MONGO_URL);
    return mongoose_1.default
        .connect(config_1.MONGO_URLL)
        .then(() => {
        console.log("Database connected successfully");
    })
        .catch((err) => {
        console.error("Database connection failed", err);
    });
};
exports.connectDB = connectDB;
const avatarSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
}, { timestamps: true });
const avatar = mongoose_1.default.model("Avatar", avatarSchema);
exports.avatar = avatar;
const elementSchema = new mongoose_1.default.Schema({
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    statics: { type: Boolean, default: true },
}, { timestamps: true });
const element = mongoose_1.default.model("Element", elementSchema);
exports.element = element;
const mapSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    elements: [
        {
            id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Element" },
            x: Number,
            y: Number,
            statics: Boolean,
        },
    ],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
const map = mongoose_1.default.model("Map", mapSchema);
exports.map = map;
const spaceSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    thumbnail: { type: String },
    mapId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Map" },
    elements: [
        {
            id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Element" },
            x: Number,
            y: Number,
            statics: Boolean,
        },
    ],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });
const space = mongoose_1.default.model("Space", spaceSchema);
exports.space = space;
const userSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, enum: ["admin", "user"], default: "user" },
    avatarId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Avatar" },
}, { timestamps: true });
const user = mongoose_1.default.model("User", userSchema);
exports.user = user;
const returnObjectId = (id) => {
    return new mongoose_1.default.Types.ObjectId(id);
};
exports.returnObjectId = returnObjectId;
