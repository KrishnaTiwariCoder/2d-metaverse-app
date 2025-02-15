import jwt, { verify } from "jsonwebtoken";

export const generateLoginToken = (data: any) => {
  return jwt.sign(
    {
      _id: data._id,
      username: data.username,
      type: data.type,
    },
    process.env.JWT_SECRET as string
  );
};

export const verifyToken = (token: string) => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (err) {
    console.error(err);
    return null;
  }
};
