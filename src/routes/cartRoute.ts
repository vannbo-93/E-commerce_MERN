/** @format */
import express from "express";
import {
  addItemToCart,
  deleteItemInCart,
  getActiveCartForUser,
  updateItemInCart,
  clearCart,
} from "../services/cartService.js";
import validateJWT from "../middlewares/validateJWT.js";
import type { ExtendRequest } from "../types/extendedRequest.js";

const router = express.Router();

router.get("/", validateJWT, async (req: ExtendRequest, res) => {
  //getActiveCartForUser
  // من الـ middleware
  const userId = (req as express.Request & { user: { id: string } }).user.id;
  const cart = await getActiveCartForUser({ userId });
  res.status(200).send(cart);
});

router.delete("/", validateJWT, async (req: ExtendRequest, res) => {
  const userId = req?.user?._id;
  const { productId } = req.params;
  const response = await clearCart({ userId });
  res.status(response.statusCode).send(response.data);
});

router.post("/items", validateJWT, async (req: ExtendRequest, res) => {
  const userId = req?.user?._id?.toString() ?? req?.user?.id;
  const { productId, quantity } = req.body;
  const response = await addItemToCart({ userId, productId, quantity });
  res.status(response.statusCode).send(response.data);
});

router.put("/items", validateJWT, async (req: ExtendRequest, res) => {
  const userId = req?.user?._id;
  const { productId, quantity } = req.body;
  const response = await updateItemInCart({ userId, productId, quantity });
  res.status(response.statusCode).send(response.data);
});

router.delete(
  "/items/:productId",
  validateJWT,
  async (req: ExtendRequest, res) => {
    const userId = req?.user?._id;
    const { productId } = req.params;
    const response = await deleteItemInCart({ userId, productId });
    res.status(response.statusCode).send(response.data);
  },
);

export default router;
