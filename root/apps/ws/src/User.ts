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
  private spaceWidth?: number;
  private spaceHeight?: number;

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
            const spaceMembers = RoomManager.getInstance().rooms.get(spaceId);
            let spawnX: number = Math.floor(Math.random() * spaceFound.width),
              spawnY: number = Math.floor(Math.random() * spaceFound.height);

            // this code ensures that if the user already is in the space, they spawn at the position they were in
            if (spaceMembers?.find((u) => u.userId === this.userId)) {
              spawnX = this.x;
              spawnY = this.y;
            }

            // this code ensures that the user doesn't spawn on top of another user
            let userExistAtThatCoordinate = spaceMembers?.find(
              (u) =>
                Math.abs(u.x - spawnX) <= 50 &&
                Math.abs(u.y - spawnY) <= 50 &&
                u.userId !== this.userId
            );

            while (userExistAtThatCoordinate) {
              spawnX = Math.floor(Math.random() * spaceFound.width);
              spawnY = Math.floor(Math.random() * spaceFound.height);
              userExistAtThatCoordinate = spaceMembers?.find(
                (u) =>
                  Math.abs(u.x - spawnX) <= 50 &&
                  Math.abs(u.y - spawnY) <= 50 &&
                  u.userId !== this.userId
              );
            }

            this.spaceWidth = spaceFound.width;
            this.spaceHeight = spaceFound.height;
            this.x = spawnX;
            this.y = spawnY;

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
                width: this.spaceWidth,
                height: this.spaceHeight,
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
            if (MoveX < 0 || MoveY < 0) {
              console.log("rejected cause of negative displacement");
              this.send({
                type: "movement-rejected",
                payload: {
                  x: this.x,
                  y: this.y,
                },
              });
              return;
            }
            if (
              (xDisplacement === 10 && yDisplacement === 0) ||
              (xDisplacement === 0 && yDisplacement === 10)
            ) {
              //reject movement if the x and y are more than the width and height of the space
              if (MoveX > this.spaceWidth! || MoveY > this.spaceHeight!) {
                console.log("rejected cause of space width and height");
                this.send({
                  type: "movement-rejected",
                  payload: {
                    x: this.x,
                    y: this.y,
                  },
                });
                return;
              }
              // reject movement if some other user is already there at the x and y
              const otherUser = RoomManager.getInstance()
                .rooms.get(this.spaceId!)
                ?.find(
                  (u) =>
                    Math.abs(u.x - MoveX) <= 50 &&
                    Math.abs(u.y - MoveY) <= 50 &&
                    u.userId !== this.userId
                );
              if (otherUser) {
                console.log("rejected cause of other user");
                this.send({
                  type: "movement-rejected",
                  payload: {
                    x: this.x,
                    y: this.y,
                  },
                });
                return;
              }
              this.x = MoveX;
              this.y = MoveY;
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
            } else {
              console.log("rejected cause of displacement");
              this.send({
                type: "movement-rejected",
                payload: {
                  x: this.x,
                  y: this.y,
                },
              });
            }
          case "send-message":
            const message = parsedData.payload;
            RoomManager.getInstance().broadcast(
              {
                type: "got-message",
                payload: {
                  messageGot: message.text,
                  sender: this.userId,
                },
              },
              this,
              this.spaceId!
            );
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
