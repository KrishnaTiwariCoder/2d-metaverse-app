import { OutGoingMessage } from "./types";
import { User } from "./User";
import { SpatialGrid } from "@repo/grid";

export class RoomManager {
  rooms: Map<string, User[]> = new Map();
  grids: Map<string, SpatialGrid> = new Map();
  static instance: RoomManager;

  private constructor() {
    this.rooms = new Map();
    this.grids = new Map();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RoomManager();
    }
    return this.instance;
  }

  public getGrid(spaceId: string): SpatialGrid {
    if (!this.grids.has(spaceId)) {
      this.grids.set(spaceId, new SpatialGrid());
    }
    return this.grids.get(spaceId)!;
  }

  public addUser(spaceId: string, user: User): boolean {
    const existing = this.rooms.get(spaceId) ?? [];

    if (user.userId && existing.some((u) => u.userId === user.userId)) {
      return false;
    }

    this.rooms.set(spaceId, [...existing, user]);
    return true;
  }

  public removeUser(spaceId: string, user: User) {
    if (!this.rooms.has(spaceId)) {
      return;
    }
    this.rooms.set(
      spaceId,
      this.rooms.get(spaceId)?.filter((u) => u.id !== user.id) ?? []
    );

    const grid = this.grids.get(spaceId);
    if (grid && this.rooms.get(spaceId)?.length === 0) {
      this.grids.delete(spaceId);
    }
  }

  public broadcast(message: OutGoingMessage, user: User, roomId: string) {
    if (!this.rooms.has(roomId)) {
      return;
    }
    this.rooms.get(roomId)?.forEach((u) => {
      if (u.id !== user.id) {
        u.send(message);
      }
    });
  }
}