import { avatar, user } from "@repo/database";
import { Router } from "express";
import { updateMetadataSchema } from "../../types";

export const userRouter = Router();

userRouter.post("/metadata", async (req, res) => {
  const parsedData = updateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data", errors: parsedData.error });
    return;
  }
  const { avatarId } = req.body;
  if (!avatarId) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  try {
    const avatarFound = await avatar.findById(avatarId);
    if (!avatarFound) {
      res.status(400).json({ error: "Avatar not found" });
      return;
    }

    const userFound = await user.findById(req.user._id);
    if (!userFound) {
      res.status(403).json({ error: "User not found" });
      return;
    }

    userFound.avatarId = avatarFound._id;
    await userFound.save();
    res.status(200).json({ message: "Metadata updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
    return;
  }
});

userRouter.get("/metadata/bulk", async (req, res) => {
  // conver the ids to an array
  const userIdString = (req.query.ids as string) || "";
  const ids = userIdString.slice(1, userIdString.length - 1).split(",");
  if (!ids.length || ids[0] === "") {
    res.status(400).json({ error: "No IDs provided" });
    return;
  }
  try {
    const users = await user.find({ _id: { $in: ids } });
    const response = users.map((userFound) => ({
      userId: userFound._id,
      imageUrl: userFound.avatarId, // This assumes avatarId is a URL; modify if needed
    }));
    res.status(200).json({ metadata: response });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
    return;
  }
});
