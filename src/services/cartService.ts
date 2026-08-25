/** @format */

import { cartModel } from "../models/cartModel.js";

interface CreateCartForUser {
  userId: string;
}

const createCartForUser = async ({ userId }: CreateCartForUser) => {
  const cart = await cartModel.create({ userId });
  return cart;
};

interface GetActiveCartForUser {
  userId: string;
}
export const getActiveCartForUser = async ({
  userId,
}: GetActiveCartForUser) => {
  const cart = await cartModel.findOneAndUpdate(
    { userId, status: "active" },
    { $setOnInsert: { userId, status: "active" } },
    { new: true, upsert: true },
  );
  return cart;
};
