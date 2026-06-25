import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./constants";

const generateLoginToken = (data: any) => {
  return jwt.sign(
    {
      _id: data._id,
      username: data.username,
      type: data.type,
    },
    process.env.JWT_SECRET || JWT_SECRET
  );
};

 const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error(err);
    return null;
  }
};


export { generateLoginToken, verifyToken };