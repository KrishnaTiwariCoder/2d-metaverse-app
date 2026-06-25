import jwt from "jsonwebtoken";
declare const generateLoginToken: (data: any) => string;
declare const verifyToken: (token: string) => string | jwt.JwtPayload | null;
export { generateLoginToken, verifyToken };
//# sourceMappingURL=index.d.ts.map