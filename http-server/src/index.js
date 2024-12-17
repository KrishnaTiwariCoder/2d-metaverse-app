import "dotenv/config";

import express from "express";
import { connectToDB } from "./utils/connectionDB.js";
import router from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 8080;

connectToDB();

app.use(express.json());

app.use("/", router);

app.listen(PORT, () => {
  console.log(`server running at port ${PORT}`);
});
