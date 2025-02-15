import mongoose from "mongoose";
import { MONGO_URL, MONGO_URLL } from "./config";

const connectDB = () => {
  // console.log(MONGO_URLL, process.env.MONGO_URL);
  console.log(MONGO_URL, "URL");
  console.log(MONGO_URLL, "URLL");
  console.log(
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    "envs"
  );
  return mongoose
    .connect(MONGO_URL)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.error("Database connection failed", err);
    });
};

const avatarSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

const avatar = mongoose.model("Avatar", avatarSchema);

const elementSchema = new mongoose.Schema(
  {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    statics: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const element = mongoose.model("Element", elementSchema);

const mapSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    elements: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Element" },
        x: Number,
        y: Number,
        statics: Boolean,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const map = mongoose.model("Map", mapSchema);

const spaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    thumbnail: { type: String },
    mapId: { type: mongoose.Schema.Types.ObjectId, ref: "Map" },
    elements: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Element" },
        x: Number,
        y: Number,
        statics: Boolean,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const space = mongoose.model("Space", spaceSchema);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, enum: ["admin", "user"], default: "user" },
    avatarId: { type: mongoose.Schema.Types.ObjectId, ref: "Avatar" },
  },
  { timestamps: true }
);

const user = mongoose.model("User", userSchema);

const returnObjectId = (id: string) => {
  return new mongoose.Types.ObjectId(id);
};

export { connectDB, avatar, element, map, space, user, returnObjectId };
