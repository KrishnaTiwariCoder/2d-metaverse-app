import dotenv from "dotenv";
dotenv.config();

import { WebSocketServer } from "ws";
import { connectDB } from "@repo/database";
import { User } from "./User";
import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" }));
const server = createServer(app);

const wss = new WebSocketServer({
  server,
  clientTracking: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
  },
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
}); // Health check

connectDB();

wss.on("connection", function connection(ws) {
  console.log("user connected");
  let user: User = new User(ws);

  ws.on("error", console.error);
  ws.on("close", function close() {
    user.destroy();
    console.log("user disconnected");
  });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log("Server is listening on port " + port);
});
