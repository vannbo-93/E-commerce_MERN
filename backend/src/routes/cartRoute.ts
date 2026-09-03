/** @format */
import express from "express";
import {
  addItemToCart,
  deleteItemInCart,
  getActiveCartForUser,
  updateItemInCart,
  clearCart,
  cheCkout,
} from "../services/cartService.js";
import validateJWT from "../middlewares/validateJWT.js";
import type { ExtendRequest } from "../types/extendedRequest.js";

const router = express.Router();

const getUserId = (req: ExtendRequest): string => {
  const userId = req.user?._id?.toString() ?? req.user?.id ?? req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
};

router.get("/", validateJWT, async (req: ExtendRequest, res) => {
  try {
    const userId = getUserId(req);
    const cart = await getActiveCartForUser({ userId });
    res.status(200).send(cart);
  } catch {
    res.status(401).send("Unauthorized");
  }
});

router.delete("/", validateJWT, async (req: ExtendRequest, res) => {
  try {
    const userId = getUserId(req);
    const response = await clearCart({ userId });
    res.status(response.statusCode).send(response.data);
  } catch {
    res.status(401).send("Unauthorized");
  }
});

router.post("/items", validateJWT, async (req: ExtendRequest, res) => {
  try {
    const userId = getUserId(req);
    const { productId, quantity } = req.body;
    const response = await addItemToCart({ userId, productId, quantity });
    res.status(response.statusCode).send(response.data);
  } catch {
    res.status(401).send("Unauthorized");
  }
});

router.put("/items", validateJWT, async (req: ExtendRequest, res) => {
  try {
    const userId = getUserId(req);
    const { productId, quantity } = req.body;
    const response = await updateItemInCart({ userId, productId, quantity });
    res.status(response.statusCode).send(response.data);
  } catch {
    res.status(401).send("Unauthorized");
  }
});

router.delete(
  "/items/:productId",
  validateJWT,
  async (req: ExtendRequest, res) => {
    try {
      const userId = getUserId(req);
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId ?? "";
      const response = await deleteItemInCart({ userId, productId });
      res.status(response.statusCode).send(response.data);
    } catch {
      res.status(401).send("Unauthorized");
    }
  },
);

router.post("/checkout", validateJWT, async (req: ExtendRequest, res) => {
  try {
    const userId = getUserId(req);
    const address = typeof req.body?.address === "string" ? req.body.address : "";
    const response: any = await cheCkout({ userId, address });
    res.status(response?.statusCode ?? 200).send(response?.data ?? response);
  } catch {
    res.status(401).send("Unauthorized");
  }
});

export default router;
