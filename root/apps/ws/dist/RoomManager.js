"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.rooms = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }
    addUser(spaceId, user) {
        var _a;
        if (!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId, [user]);
            return;
        }
        this.rooms.set(spaceId, [...((_a = this.rooms.get(spaceId)) !== null && _a !== void 0 ? _a : []), user]);
    }
    removeUser(spaceId, user) {
        var _a, _b;
        if (!this.rooms.has(spaceId)) {
            return;
        }
        this.rooms.set(spaceId, (_b = (_a = this.rooms.get(spaceId)) === null || _a === void 0 ? void 0 : _a.filter((u) => u.id !== user.id)) !== null && _b !== void 0 ? _b : []);
    }
    broadcast(message, user, roomId) {
        var _a;
        if (!this.rooms.has(roomId)) {
            return;
        }
        (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.forEach((u) => {
            if (u.id !== user.id) {
                u.send(message);
            }
        });
        console.log("broadcasted");
    }
}
exports.RoomManager = RoomManager;
