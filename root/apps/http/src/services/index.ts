import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../contants";

export const generateLoginToken = (data: any) => {
  return jwt.sign(
    {
      _id: data._id,
      username: data.username,
      type: data.type,
    },
    process.env.JWT_SECRET || JWT_SECRET
  );
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error(err);
    return null;
  }
};
