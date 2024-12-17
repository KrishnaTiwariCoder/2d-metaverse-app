import mongoose, { mongo } from "mongoose";

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
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Space", spaceSchema);
