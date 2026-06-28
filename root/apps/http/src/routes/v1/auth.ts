import { user , session } from "@repo/database";
import { Router } from "express";
import bcrypt from "bcrypt";
import { loginSchema, signupSchema } from "../../types";
import { generateLoginToken, verifyToken } from "@repo/auth";




export const authRouter = Router();

authRouter.post("/signin", async (req, res) => {
  const parsedData = loginSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data", errors: parsedData.error });
    return;
  }
  const { username, password } = parsedData.data;

  if (!username || !password) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    // Find the user in the database
    const userFound = await user.findOne({ username });
    if (!userFound) {
      res.status(403).json({ error: "Invalid credentials" });
      return;
    }
    
    // Verify the password
    const isMatch = await bcrypt.compare(password, userFound!.password);
    if (!isMatch) {
      res.status(403).json({ error: "Invalid credentials" });
      return;
    }
    const sessionData = await session.create({ userId: userFound._id });  
    userFound.sessionId = sessionData._id;
    await userFound.save();
    // Generate a JWT token
    const token = generateLoginToken(userFound, sessionData._id.toString());
    res.status(200).json({ token , user:userFound });
    return;
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Internal server error" });
    return;
  }
});

authRouter.post("/signup", async (req, res) => {
  const parsedData = signupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data", errors: parsedData.error });
    return;
  }
  const { username, password, type } = parsedData.data;

  if (!username || !password || !type) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    // Check if the user already exists
    const existingUser = await user.findOne({ username });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({ username, password: hashedPassword, type });
    await newUser.save();

    res.status(200).json({ userId: newUser._id });
    return;
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Internal server error" });
    return;
  }
});


authRouter.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(403).json({ error: "Token is missing" });
    return;
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: "Token is invalid or expired" });
    return;
  }
  const sessionData = await session.findById(decoded.sessionId);
  if (!sessionData || !sessionData.active) {
    res.status(403).json({ error: "Session is invalid or expired" });
    return;
  }
 res.status(200).json({ user: decoded });
  return;
});

authRouter.post("/signout", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(403).json({ error: "Token is missing" });
    return;
  }   
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: "Token is invalid or expired" });
    return;
  }
  try {
    const sessionData = await session.findById(decoded.sessionId!);
    if (!sessionData || !sessionData.active) {
      res.status(403).json({ error: "Session is invalid or expired" });
      return;
    }
    // Mark the session as inactive
    sessionData.active = false;
    await sessionData.save();
    res.status(200).json({ message: "Signed out successfully" });
    return;
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Internal server error" });
    return;
  }
} );