import jwt , {JwtPayload} from "jsonwebtoken";
import { JWT_SECRET } from "./constants";

interface TokenPayload extends JwtPayload {
  _id: string;
  username: string;
  type: "admin" | "user";
  sessionId: string;
}

const generateLoginToken = (data: any , sessionId: string) => {
  return jwt.sign(
    {
      _id: data._id,
      username: data.username,
      type: data.type,
      sessionId: sessionId,
    },
    process.env.JWT_SECRET || JWT_SECRET
  );
};

 const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
};



export { generateLoginToken, verifyToken };