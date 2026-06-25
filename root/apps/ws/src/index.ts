import { WebSocketServer } from "ws";
import { connectDB } from "@repo/database";
import { User } from "./User";
import express, { Request, Response } from "express";
import { createServer, IncomingMessage } from "http";
import cors from "cors";
import url from "url";
import { verifyToken } from "@repo/auth";
interface ExtendedIncomingMessage extends IncomingMessage {
  user?: any;
}
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



wss.on("connection", function connection(ws , req:ExtendedIncomingMessage) {
  const {query} = url.parse(req.url || "", true);
  const token = query.token as string;

  try{
    if (!token) {
      ws.close(1008, "Token is required");
      return;
    }
    // verify token here and get userId
    const decoded = verifyToken(token);
    if (!decoded) {
      ws.close(1008, "Token is invalid or expired");
      return;
    }
    req.user = decoded;
    let user: User = new User(ws, req.user);
    console.log(`User connected: ${user.id} (${user.name})`);
    ws.on("error", console.error);
    ws.on("close", function close() {
      user.destroy();
    });

  } catch (error) {
    console.error("Error during WebSocket connection:", error);
    ws.close(1011, "Internal server error");
    return;
  }
  

});

const port = process.env.PORT || 3001;
server.listen(port);
