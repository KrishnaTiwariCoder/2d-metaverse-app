import { WebSocketServer } from "ws";
import { connectDB } from "@repo/database";
import { User } from "./User";
import express, { Request, Response } from "express";
import { createServer } from "https";
import cors from "cors";

const app = express();
app.use(cors());
const server = createServer(app);

const wss = new WebSocketServer({ server });

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

server.listen(process.env.PORT, () => {
  console.log("Server is listening on port 3000");
});
