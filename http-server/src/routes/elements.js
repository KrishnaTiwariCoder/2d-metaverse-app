import express from "express";

const router = express.Router();
// Get all elements from the MongoDB collection
router.get("/api/v1/elements", async (req, res) => {
  try {
    const elements = await Element.find();
    res.status(200).json({ elements });
  } catch (error) {
    res.status(400).json({ error: "Error fetching elements" });
  }
});

export default router;
