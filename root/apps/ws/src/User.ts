import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutGoingMessage } from "./types";
import { space, user } from "@repo/database";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";
function getRandomId() {
  return Math.random().toString(36).substring(2, 15);
}

export class User {
  public id: string;
  public userId?: string;
  public name?: string;
  private spaceId?: string;
  private x: number;
  private y: number;
  private ws: WebSocket;
  private spaceWidth?: number;
  private spaceHeight?: number;
  private isSpeaking?: boolean;
  private isMuted?: boolean;
  private isDeafened?: boolean;

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
        console.log("---------------");
        // console.log(parsedData);
        console.log("---------------");

        switch (parsedData.type) {
          case "join": {
            const { spaceId, token } = parsedData.payload;
            const { _id: userId, username: name } = jwt.verify(
              token,
              process.env.JWT_SECRET || JWT_SECRET
            ) as JwtPayload;

            if (!userId) {
              console.log("because of 1");
              this.ws.close();
              return;
            }

            const userFound = await user.findById(userId);
            if (!userFound) {
              console.log("because of 2");
              this.ws.close();
              return;
            }
            this.userId = userId;
            this.name = name;

            const spaceFound = (await space.findById(spaceId)) || {
              width: 500,
              height: 500,
            };

            if (!spaceFound) {
              console.log("because of 3");
              this.ws.close();
              return;
            }

            this.spaceId = spaceId;
            const spaceMembers = RoomManager.getInstance().rooms.get(spaceId);
            let spawnX: number = Math.floor(Math.random() * spaceFound.width),
              spawnY: number = Math.floor(Math.random() * spaceFound.height);

            // this code ensures that if the user already is in the space, they spawn at the position they were in

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
            this.isSpeaking = false;
            this.isMuted = false;
            this.isDeafened = false;

            RoomManager.getInstance().addUser(spaceId, this);

            this.send({
              type: "space-joined",
              payload: {
                spawn: {
                  x: this.x,
                  y: this.y,
                },
                myId: this.userId,
                users:
                  RoomManager.getInstance()
                    .rooms.get(spaceId)
                    ?.map((u) => ({
                      id: u.userId,
                      x: u.x,
                      y: u.y,
                      name: u.name,
                      isSpeaking: u.isSpeaking,
                      isMuted: u.isMuted,
                      isDeafened: u.isDeafened,
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
                  name: this.name,
                },
              },
              this,
              this.spaceId!
            );
            // tell everyone in the room that im going to share you my stream
            RoomManager.getInstance().broadcast(
              {
                type: "add-peer",
                payload: {
                  userId: this.userId,
                  createOffer: false,
                  user: this,
                },
              },
              this,
              this.spaceId!
            );
            RoomManager.getInstance()
              .rooms.get(this.spaceId!)
              ?.filter((client) => client.userId !== this.userId)
              ?.forEach((client: User) => {
                this.send({
                  type: "add-peer",
                  payload: {
                    userId: client.userId,
                    createOffer: true,
                    user: client,
                  },
                });
              });
            break;
          }
          case "move": {
            const { x: MoveX, y: MoveY } = parsedData.payload;
            const xDisplacement = Math.abs(MoveX - this.x);
            const yDisplacement = Math.abs(MoveY - this.y);
            if (MoveX < 0 || MoveY < 0) {
              // console.log("rejected cause of negative displacement");
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
                // console.log("rejected cause of space width and height");
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
                // console.log("rejected cause of other user");
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
              // console.log("rejected cause of displacement");
              this.send({
                type: "movement-rejected",
                payload: {
                  x: this.x,
                  y: this.y,
                },
              });
            }
            break;
          }
          case "send-message": {
            const message = parsedData.payload;
            RoomManager.getInstance().broadcast(
              {
                type: "got-message",
                payload: {
                  messageGot: message.message,
                  senderId: message.sender,
                  senderName: message.senderName,
                  timestamp: message.timestamp,
                },
              },
              this,
              this.spaceId!
            );
            break;
          }
          case "mute": {
            if (this.userId !== parsedData.payload.userId) return;
            this.isMuted = true;

            RoomManager.getInstance().broadcast(
              {
                type: "mute",
                payload: {
                  userId: this.userId,
                  isMuted: this.isMuted,
                },
              },
              this,
              this.spaceId!
            );
            break;
          }
          case "unmute": {
            this.isMuted = false;
            RoomManager.getInstance().broadcast(
              {
                type: "unmute",
                payload: {
                  userId: this.userId,
                  isMuted: this.isMuted,
                },
              },
              this,
              this.spaceId!
            );
            break;
          }
          case "deafen": {
            this.isDeafened = true;
            RoomManager.getInstance().broadcast(
              {
                type: "deafen",
                payload: {
                  userId: this.userId!,
                  isDeafened: this.isDeafened!,
                },
              },
              this,
              this.spaceId!
            );
            break;
          }
          case "undeafen": {
            this.isDeafened = false;
            RoomManager.getInstance().broadcast(
              {
                type: "undeafen",
                payload: {
                  userId: this.userId,
                  isDeafened: this.isDeafened,
                },
              },
              this,
              this.spaceId!
            );
            break;
          }
          case "relay-ice": {
            const { userId, ice }: { ice: RTCIceCandidate; userId: string } =
              parsedData.payload;

            if (!userId || !ice) {
              console.error("Invalid ICE candidate relay");
              return;
            }

            RoomManager.getInstance()
              .rooms.get(this.spaceId!)
              ?.find((user: User) => user.userId === userId)
              ?.ws.send(
                JSON.stringify({
                  type: "ice",
                  payload: {
                    ice,
                    userId: this.userId,
                  },
                })
              );
            break;
          }
          case "relay-sdp": {
            const { userId, sdp } = parsedData.payload;

            RoomManager.getInstance()
              .rooms.get(this.spaceId!)
              ?.find((user: User) => user.userId === userId)
              ?.ws.send(
                JSON.stringify({
                  type: "sdp",
                  payload: {
                    sdp,
                    userId: this.userId,
                  },
                })
              );
            break;
          }
        }
      });
    } catch (error) {
      console.log("because of 4");
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
