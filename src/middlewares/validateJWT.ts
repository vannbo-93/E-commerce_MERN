/** @format */

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";
import type { ExtendRequest } from "../types/extendedRequest.js";

// interface ExtendRequest extends Request {
//   user?: any;
// }

const validateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.get("authorization");

  if (!authorizationHeader) {
    res.status(403).send("Authorization header was not provided");
    return;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (!token || scheme !== "Bearer") {
    res.status(403).send("Bearer token not found");
    return;
  }

  jwt.verify(
    token,
    "xHFbfUGG7JFFvIJgmG0xeztxTKGoifsU",
    async (err, payload) => {
      if (err) {
        res.status(403).send("Invalid token");
        return;
      }

      if (!payload) {
        res.status(403).send("Invalid token payload");
        return;
      }

      const userPayload = payload as {
        email: string;
        firstName: string;
        lastName: string;
      };

      try {
        const user = await userModel.findOne({ email: userPayload.email });
        const authReq = req as ExtendRequest;
        authReq.user = user;
        next();
      } catch (error) {
        res.status(500).send("Failed to fetch user from database");
      }
    },
  );
};

export default validateJWT;
