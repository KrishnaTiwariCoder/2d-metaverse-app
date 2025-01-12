import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutGoingMessage } from "./types";
import { space } from "@repo/database";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";
function getRandomId() {
  return Math.random().toString(36).substring(2, 15);
}

export class User {
  public id: string;
  public userId?: string;
  private spaceId?: string;
  private x: number;
  private y: number;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.id = getRandomId();
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.initHandlers();
  }
  initHandlers() {
    try {
      this.ws.on("message", async (data) => {
        const parsedData = JSON.parse(data.toString());
        switch (parsedData.type) {
          case "join":
            const { spaceId, token } = parsedData.payload;
            const userId = (jwt.verify(token, JWT_SECRET) as JwtPayload)._id;
            if (!userId) {
              this.ws.close();
              return;
            }
            this.userId = userId;

            const spaceFound = await space.findById(spaceId);
            if (!spaceFound) {
              this.ws.close();
              return;
            }
            this.spaceId = spaceId;
            this.x = Math.floor(Math.random() * spaceFound.width);
            this.y = Math.floor(Math.random() * spaceFound.height);

            RoomManager.getInstance().addUser(spaceId, this);
            this.send({
              type: "space-joined",
              payload: {
                spawn: {
                  x: this.x,
                  y: this.y,
                },
                users:
                  RoomManager.getInstance()
                    .rooms.get(spaceId)
                    ?.filter((u) => u.id !== this.userId)
                    ?.map((u) => ({
                      id: u.userId,
                      spawn: { x: u.x, y: u.y },
                    })) ?? [],
              },
            });

            RoomManager.getInstance().broadcast(
              {
                type: "user-joined",
                payload: {
                  userId: this.userId,
                  x: this.x,
                  y: this.y,
                },
              },
              this,
              this.spaceId!
            );
            break;
          case "move":
            const { x: MoveX, y: MoveY } = parsedData.payload;
            const xDisplacement = Math.abs(MoveX - this.x);
            const yDisplacement = Math.abs(MoveY - this.y);
            if (
              (xDisplacement === 10 && yDisplacement === 0) ||
              (xDisplacement === 0 && yDisplacement === 10)
            ) {
              this.x = MoveX;
              this.y = MoveY;
              // reject movement if some other user is already there at the x and y
              const otherUser = RoomManager.getInstance()
                .rooms.get(this.spaceId!)
                ?.find(
                  (u) =>
                    u.x === this.x && u.y === this.y && u.userId !== this.userId
                );
              if (otherUser) {
                this.send({
                  type: "movement-rejected",
                  payload: {
                    x: this.x,
                    y: this.y,
                  },
                });
                return;
              }
              RoomManager.getInstance().broadcast(
                {
                  type: "movement",
                  payload: {
                    x: this.x,
                    y: this.y,
                    userId: this.userId,
                  },
                },
                this,
                this.spaceId!
              );
              return;
            }

            this.send({
              type: "movement-rejected",
              payload: {
                x: this.x,
                y: this.y,
              },
            });
        }
      });
    } catch (error) {
      console.log(error);
      this.ws.close();
    }
  }

  destroy() {
    RoomManager.getInstance().broadcast(
      { type: "user-left", payload: { userId: this.userId } },
      this,
      this.spaceId!
    );
    RoomManager.getInstance().removeUser(this.spaceId!, this);
  }
  send(message: OutGoingMessage) {
    this.ws.send(JSON.stringify(message));
  }
}
