import jwt from "jsonwebtoken";
// Middleware for authentication
export const authenticate = (req, res, next) => {
  // Get the Authorization header
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ error: "Authorization header is missing" });
  }

  // Extract the token from the header
  const token = authHeader.split(" ")[1]; // 'Bearer <token>'

  if (!token) {
    return res.status(403).json({ error: "Token is missing" });
  }

  // Verify the token
  jwt.verify(
    token,
    process.env.JWT_SECRET_KEY || "your_jwt_secret_key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Token is invalid or expired" });
      }

      // Attach user info to the request object for further use
      req.user = user;
      next(); // Proceed to the next middleware or route handler
    }
  );
};

export const isAdmin = (req, res, next) => {
  const { _id, type } = req.user;
  if (type === "admin") return next();
  res.status(401).json({ error: "You are not a valid admin" });
};
