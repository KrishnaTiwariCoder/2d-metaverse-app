import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutGoingMessage } from "./types";
import { space, element } from "@repo/database";

function getRandomId() {
  return Math.random().toString(36).substring(2, 15);
}


const PLAYER_RADIUS = 7.5;
const PLAYER_BOX_SIZE = PLAYER_RADIUS * 2; 

function playerAABB(centerX: number, centerY: number) {
  return {
    x: centerX - PLAYER_RADIUS,
    y: centerY - PLAYER_RADIUS,
    width: PLAYER_BOX_SIZE,
    height: PLAYER_BOX_SIZE,
  };
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

  constructor(ws: WebSocket , user:any) {
    this.id = getRandomId();
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.userId = user._id;
    this.name = user.username;
    this.initHandlers();

  }

  initHandlers() {
    try {
      this.ws.on("message", async (data) => {
        const parsedData = JSON.parse(data.toString());

        switch (parsedData.type) {
          case "join": {
            const { spaceId } = parsedData.payload;
          
            const spaceFound = (await space.findById(spaceId).populate("elements.id"));

            if (!spaceFound) {
              this.ws.close();
              return;
            }

            this.spaceId = spaceId;
            this.spaceWidth = spaceFound.width;
            this.spaceHeight = spaceFound.height;

            const grid = RoomManager.getInstance().getGrid(spaceId);

            const isFirstUserInRoom =
              !RoomManager.getInstance().rooms.has(spaceId) ||
              RoomManager.getInstance().rooms.get(spaceId)?.length === 0;

            if (isFirstUserInRoom && spaceFound.elements?.length) {
              for (const placed of spaceFound.elements) {
                grid.addElement(
                  placed.id._id.toString(),
                  placed.x! ,
                  placed.y!,
                  placed.id.width!,
                  placed.id.height!,
                  placed.id.statics!,
                  placed._id.toString()  
                );
              }
            }

            let spawnX: number = Math.floor(Math.random() * this.spaceWidth!),
              spawnY: number = Math.floor(Math.random() * this.spaceHeight!);

            function spawnIsBlocked(x: number, y: number, userId: string) {
              if (grid.hasUserCollision(x, y, userId)) return true;
              const box = playerAABB(x, y);
              if (grid.hasElementCollision(box.x, box.y, box.width, box.height))
                return true;
              return false;
            }

            let attempts = 0;
            while (spawnIsBlocked(spawnX, spawnY , this.userId!) && attempts < 1000) {
              spawnX = Math.floor(Math.random() * this.spaceWidth!);
              spawnY = Math.floor(Math.random() * this.spaceHeight!);
              attempts++;
            }

            if (attempts >= 1000) {
              console.log("because of 5: could not find free spawn point");
              this.ws.close();
              return;
            }

            this.x = spawnX;
            this.y = spawnY;

            RoomManager.getInstance().addUser(spaceId, this);
            grid.addUser(this.userId!, this.x, this.y);

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
                      username: u.name,
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
                  username: this.name,
                },
              },
              this,
              this.spaceId!
            );
            
            break;
          }
          case "move": {
            const { x: MoveX, y: MoveY } = parsedData.payload;
            const xDisplacement = Math.abs(MoveX - this.x);
            const yDisplacement = Math.abs(MoveY - this.y);
            if (MoveX < 0 || MoveY < 0) {
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
              (xDisplacement === 15 && yDisplacement === 0) ||
              (xDisplacement === 0 && yDisplacement === 15)
            ) {
              if (MoveX > this.spaceWidth! || MoveY > this.spaceHeight!) {
                this.send({
                  type: "movement-rejected",
                  payload: {
                    x: this.x,
                    y: this.y,
                  },
                });
                return;
              }

              const grid = RoomManager.getInstance().getGrid(this.spaceId!);

              if (grid.hasUserCollision(MoveX, MoveY, this.userId!)) {
                this.send({
                  type: "movement-rejected",
                  payload: {
                    x: this.x,
                    y: this.y,
                  },
                });
                return;
              }
              
              const playerBox = playerAABB(MoveX, MoveY);
              if (
                grid.hasElementCollision(
                  playerBox.x,
                  playerBox.y,
                  playerBox.width,
                  playerBox.height
                )
              ) {
                this.send({
                  type: "movement-rejected",
                  payload: {
                    x: this.x,
                    y: this.y,
                  },
                });
                return;
              }

              grid.moveUser(this.userId!, MoveX, MoveY);
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
          case "element-added": {
            const { elementId, x, y } = parsedData.payload;

            if (x < 0 || y < 0 || x > this.spaceWidth! || y > this.spaceHeight!) {
              this.send({
                type: "element-add-rejected",
                payload: { reason: "Element is out of bounds" },
              });
              return;
            }

            const template = await element.findById(elementId);
            if (!template) {
              this.send({
                type: "element-add-rejected",
                payload: { reason: "Unknown element type" },
              });
              return;
            }

            if (x + template.width > this.spaceWidth! || y + template.height > this.spaceHeight!) {
              this.send({
                type: "element-add-rejected",
                payload: { reason: "Element is out of bounds" },
              });
              return;
            }

            const grid = RoomManager.getInstance().getGrid(this.spaceId!);
            

            if (grid.hasElementCollision(x, y, template.width, template.height)) {
              this.send({
                type: "element-add-rejected",
                payload: { reason: "Element is overlapping with another element" },
              });
              return;
            }

          
            const instanceId = getRandomId();
            const statics = template.statics ?? true;

            grid.addElement(instanceId, x, y, template.width, template.height, statics , elementId);

            await space.findByIdAndUpdate(this.spaceId, {
              $push: { elements: { id: elementId, x, y, statics } },
            });

            RoomManager.getInstance().broadcast(
              {
                type: "element-added",
                payload: { elementId, instanceId, x, y },
              },
              this,
              this.spaceId!
            );

            this.send({
              type: "element-added-self",
              payload: { elementId, instanceId, x, y },
            });
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
    RoomManager.getInstance().getGrid(this.spaceId!).removeUser(this.userId!);
    RoomManager.getInstance().removeUser(this.spaceId!, this);
  }

  send(message: OutGoingMessage) {
    this.ws.send(JSON.stringify(message));
  }
}