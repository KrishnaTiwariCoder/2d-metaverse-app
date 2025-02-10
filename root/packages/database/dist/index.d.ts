import mongoose from "mongoose";
declare const connectDB: () => Promise<void>;
declare const avatar: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    imageUrl: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    imageUrl: string;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    imageUrl: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    imageUrl: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    imageUrl: string;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    imageUrl: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
declare const element: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    imageUrl: string;
    width: number;
    height: number;
    statics: boolean;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    imageUrl: string;
    width: number;
    height: number;
    statics: boolean;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    imageUrl: string;
    width: number;
    height: number;
    statics: boolean;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    imageUrl: string;
    width: number;
    height: number;
    statics: boolean;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    imageUrl: string;
    width: number;
    height: number;
    statics: boolean;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    imageUrl: string;
    width: number;
    height: number;
    statics: boolean;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
declare const map: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    thumbnail: string;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    createdBy: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    thumbnail: string;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    createdBy: mongoose.Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    thumbnail: string;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    createdBy: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    thumbnail: string;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    createdBy: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    thumbnail: string;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    createdBy: mongoose.Types.ObjectId;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    thumbnail: string;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    createdBy: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
declare const space: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    thumbnail?: string | null | undefined;
    createdBy?: mongoose.Types.ObjectId | null | undefined;
    mapId?: mongoose.Types.ObjectId | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    thumbnail?: string | null | undefined;
    createdBy?: mongoose.Types.ObjectId | null | undefined;
    mapId?: mongoose.Types.ObjectId | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    thumbnail?: string | null | undefined;
    createdBy?: mongoose.Types.ObjectId | null | undefined;
    mapId?: mongoose.Types.ObjectId | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    thumbnail?: string | null | undefined;
    createdBy?: mongoose.Types.ObjectId | null | undefined;
    mapId?: mongoose.Types.ObjectId | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    thumbnail?: string | null | undefined;
    createdBy?: mongoose.Types.ObjectId | null | undefined;
    mapId?: mongoose.Types.ObjectId | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    width: number;
    height: number;
    elements: {
        id?: mongoose.Types.ObjectId | null | undefined;
        statics?: boolean | null | undefined;
        x?: number | null | undefined;
        y?: number | null | undefined;
    }[];
    thumbnail?: string | null | undefined;
    createdBy?: mongoose.Types.ObjectId | null | undefined;
    mapId?: mongoose.Types.ObjectId | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
declare const user: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "admin" | "user";
    username: string;
    password: string;
    avatarId?: mongoose.Types.ObjectId | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "admin" | "user";
    username: string;
    password: string;
    avatarId?: mongoose.Types.ObjectId | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "admin" | "user";
    username: string;
    password: string;
    avatarId?: mongoose.Types.ObjectId | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "admin" | "user";
    username: string;
    password: string;
    avatarId?: mongoose.Types.ObjectId | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "admin" | "user";
    username: string;
    password: string;
    avatarId?: mongoose.Types.ObjectId | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "admin" | "user";
    username: string;
    password: string;
    avatarId?: mongoose.Types.ObjectId | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export { connectDB, avatar, element, map, space, user };
