import mongoose from "mongoose";

const elementSchema = new mongoose.Schema(
  {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    statics: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Element", elementSchema);
