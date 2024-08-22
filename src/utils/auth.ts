import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { User } from "../models/user";

const tokenKey = crypto
  .randomBytes(64 / 2)
  .toString("hex")
  .slice(0, 64);

export function signToken(user: Pick<User, "username" | "role">): string {
  const { username, role } = user;
  return jwt.sign({ username, role }, tokenKey);
}

export function verifyToken(
  token: string
): Pick<User, "username" | "role"> | null {
  let user: Pick<User, "username" | "role"> | null = null;

  jwt.verify(token, tokenKey, (_, payload) => {
    if (payload && typeof payload !== "string") {
      user = {
        username: payload["username"],
        role: payload["role"],
      };
    }
  });

  return user;
}
