import { user } from "@repo/database";
import { Router } from "express";
import bcrypt from "bcrypt";
import { signupSchema } from "../../types";

export const authRouter = Router();

authRouter.post("/signin", async (req, res) => {});

authRouter.post("/signup", (req, res) => {
  const parsedData = signupSchema.safeParse(req.body);
  if (parsedData.success) {
    const { username, password, type } = parsedData.data;
    user.create({
      username,
      password: bcrypt.hashSync(password, 10),
      type,
    });
    res.status(201).json({ message: "User created successfully" });
  } else {
    res.status(400).json({ message: "Invalid data", errors: parsedData.error });
  }
});
