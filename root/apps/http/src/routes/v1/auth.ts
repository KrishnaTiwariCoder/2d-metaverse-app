import { Router } from "express";

export const authRouter = Router();

authRouter.post("/signin", (req, res) => {
  res.send("signin");
});

authRouter.post("/signup", (req, res) => {
  res.send("signup");
});
