import { WebSocketServer } from "ws";
import { connectDB } from "@repo/database";
import { User } from "./User";
import express from "express";
import { createServer } from "http";

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });

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

server.listen(3001);
