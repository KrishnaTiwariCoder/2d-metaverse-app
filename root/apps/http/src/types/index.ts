import z from "zod";

export const signupSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
  type: z.enum(["admin", "user"]),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});

export const updateMetadataSchema = z.object({
  avatarId: z.string(),
});

export const createSpaceSchema = z.object({
  name: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  mapId: z.string().optional(),
});

export const addElementSchema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number(),
  y: z.number(),
});

export const createElementSchema = z.object({
  imageUrl: z.string(),
  height: z.number(),
  width: z.number(),
  statics: z.boolean(),
});

export const updateElementSchema = z.object({
  elementId: z.string(),
  imageUrl: z.string(),
});

export const createAvatarSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
});

export const createMapSchema = z.object({
  thumbnail: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  elements: z
    .array(z.object({ id: z.string(), x: z.number(), y: z.number() }))
    .optional(),
  name: z.string(),
});

export const addElementSchemaToMap = z.object({
  elementId: z.string(),
  mapId: z.string(),
  x: z.number(),
  y: z.number(),
});

declare global {
  namespace Express {
    export interface Request {
      user: {
        username: string;
        type: string;
        avatarId: string;
        spaces: string[];
        elements: string[];
        maps: string[];
        createdAt: Date;
        updatedAt: Date;
        _id: string;
        __v: number;
      };
    }
  }
}
