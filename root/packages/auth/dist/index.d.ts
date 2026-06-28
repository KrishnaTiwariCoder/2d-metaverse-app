import { JwtPayload } from "jsonwebtoken";
interface TokenPayload extends JwtPayload {
    _id: string;
    username: string;
    type: "admin" | "user";
    sessionId: string;
}
declare const generateLoginToken: (data: any, sessionId: string) => string;
declare const verifyToken: (token: string) => TokenPayload | null;
export { generateLoginToken, verifyToken };
//# sourceMappingURL=index.d.ts.map