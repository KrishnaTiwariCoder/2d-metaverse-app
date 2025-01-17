import { NextFunction, Request, Response } from "express";
import { user } from "@repo/database";
import { verifyToken } from "../services";
// Middleware for authentication
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get the Authorization header
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(403).json({ error: "Authorization header is missing" });
    return;
  }

  // Extract the token from the header
  const token = authHeader.split(" ")[1]; // 'Bearer <token>'

  if (!token) {
    res.status(403).json({ error: "Token is missing" });
    return;
  }

  // Verify the token
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: "Token is invalid or expired" });
    return;
  }

  // Attach user info to the request object for further use
  req.user = JSON.parse(JSON.stringify(decoded));
  next(); // Proceed to the next middleware or route handler
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const { type } = req.user;
  if (type === "admin") {
    next();
    return;
  }
  res.status(401).json({ error: "You are not a valid admin" });
};

export const accountExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userfound = await user.findOne({ _id: req.user._id });
  if (!userfound) {
    res.status(403).json({ error: "account does not exist now" });
    res;
    return;
  }
  next();
};
