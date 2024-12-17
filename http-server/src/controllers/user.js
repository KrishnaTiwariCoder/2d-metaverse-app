import User from "../models/user.js";

export const metadataUser = async (req, res) => {
  const { avatarId } = req.body;
  if (!avatarId) return res.status(400).json({ error: "Missing fields" });

  const user = await User.findById(req.user._id);
  if (!user) return res.status(403).json({ error: "User not found" });

  user.avatarId = avatarId;
  await user.save();
  res.status(200).json({ message: "Metadata updated successfully" });
};

export const metadataBulk = async (req, res) => {
  const ids = req.query.ids ? JSON.parse(req.query.ids) : [];
  if (!ids.length) return res.status(400).json({ error: "No IDs provided" });

  const users = await User.find({ _id: { $in: ids } });
  const response = users.map((user) => ({
    userId: user._id,
    imageUrl: user.avatarId, // This assumes avatarId is a URL; modify if needed
  }));
  res.status(200).json({ avatars: response });
};
