import mongoose from "mongoose";

const mapSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    elements: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Element" },
        x: Number,
        y: Number,
      },
    ],
    thumbnail: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Map", mapSchema);
