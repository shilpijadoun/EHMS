import { createHash } from "node:crypto";
import Session from "../models/Session.js";
import User from "../models/User.js";
export const hash = (token) => createHash("sha256").update(token).digest("hex");
export async function auth(req, res, next) {
  try {
    const token = req.headers.cookie
      ?.split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith("ehms="))
      ?.slice(5);
    const session =
      token &&
      (await Session.findOne({
        tokenHash: hash(token),
        expiresAt: { $gt: new Date() },
      }));
    const user = session && (await User.findById(session.user));
    if (!user?.isActive)
      return res.status(401).json({ message: "Please sign in" });
    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
}
export const roles =
  (...allowed) =>
  (req, res, next) =>
    allowed.includes(req.user.role)
      ? next()
      : res.status(403).json({ message: "Permission denied" });
