/** @format */
import express from "express";
import { getActiveCartForUser } from "../services/cartService.js";
import validateJWT from "../middlewares/validateJWT.js";

const router = express.Router();

router.get("/", validateJWT, async (req, res) => {
  //getActiveCartForUser
  // من الـ middleware
  const userId = (req as express.Request & { user: { id: string } }).user.id;
  const cart = await getActiveCartForUser({ userId });
  res.status(200).send(cart);
});

export default router;
