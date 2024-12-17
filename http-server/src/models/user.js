import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, enum: ["admin", "user"], default: "user" },
    avatarId: { type: mongoose.Schema.Types.ObjectId, ref: "Avatar" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
