import Avatar from "../models/avatar.js";

export const getAvatars = async (req, res) => {
  const avatars = await Avatar.find();
  res.status(200).json({ avatars });
};
