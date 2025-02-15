"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const RoomManager_1 = require("./RoomManager");
const database_1 = require("@repo/database");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
function getRandomId() {
    return Math.random().toString(36).substring(2, 15);
}
class User {
    constructor(ws) {
        this.ws = ws;
        this.id = getRandomId();
        this.x = 0;
        this.y = 0;
    }
    initHandlers() {
        this.ws.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const parsedData = JSON.parse(data.toString());
            switch (parsedData.type) {
                case "join":
                    const { spaceId, token } = parsedData.payload;
                    const userId = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET)._id;
                    if (!userId) {
                        this.ws.close();
                        return;
                    }
                    this.userId = userId;
                    const spaceFound = yield database_1.space.findById(spaceId);
                    if (!spaceFound) {
                        this.ws.close();
                        return;
                    }
                    this.spaceId = spaceId;
                    this.x = Math.floor(Math.random() * spaceFound.width);
                    this.y = Math.floor(Math.random() * spaceFound.height);
                    RoomManager_1.RoomManager.getInstance().addUser(spaceId, this);
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y,
                            },
                            users: (_b = (_a = RoomManager_1.RoomManager.getInstance()
                                .rooms.get(spaceId)) === null || _a === void 0 ? void 0 : _a.map((u) => {
                                id: u.id;
                            })) !== null && _b !== void 0 ? _b : [],
                        },
                    });
                    RoomManager_1.RoomManager.getInstance().broadcast({
                        type: "user-joined",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y,
                        },
                    }, this, this.spaceId);
                    break;
                case "move":
                    const { x: MoveX, y: MoveY } = parsedData.payload;
                    const xDisplacement = Math.abs(MoveX - this.x);
                    const yDisplacement = Math.abs(MoveY - this.y);
                    if ((xDisplacement === 1 && yDisplacement === 0) ||
                        (xDisplacement === 0 && yDisplacement === 1)) {
                        this.x = MoveX;
                        this.y = MoveY;
                        RoomManager_1.RoomManager.getInstance().broadcast({
                            type: "move",
                            payload: {
                                x: this.x,
                                y: this.y,
                            },
                        }, this, this.spaceId);
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
        }));
    }
    destroy() {
        RoomManager_1.RoomManager.getInstance().broadcast({ type: "user-left", payload: { userId: this.userId } }, this, this.spaceId);
        RoomManager_1.RoomManager.getInstance().removeUser(this.spaceId, this);
    }
    send(message) {
        this.ws.send(JSON.stringify(message));
    }
}
exports.User = User;
