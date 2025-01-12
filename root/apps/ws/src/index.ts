import { WebSocketServer } from "ws";
import { connectDB } from "@repo/database";
import { User } from "./User";

const wss = new WebSocketServer({ port: 3001 });
connectDB();

wss.on("connection", function connection(ws) {
  console.log("user connected");
  let user: User = new User(ws);

  ws.on("error", console.error);
  ws.on("close", function close() {
    user.destroy();
  });
});
