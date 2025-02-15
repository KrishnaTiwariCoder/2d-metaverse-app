"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGO_URLL = exports.MONGO_URL = void 0;
exports.MONGO_URL = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.cdtrb.mongodb.net/`;
exports.MONGO_URLL = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.cdtrb.mongodb.net/2d-metaverse?retryWrites=true&w=majority`;
