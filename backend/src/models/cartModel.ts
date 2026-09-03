/** @format */

import mongoose, { Schema, Document, Types } from "mongoose";
import type { IProduct } from "./productModel.js";

const CartStatusEnum = ["active", "completed"] as const;

export interface ICartItem {
  product: Types.ObjectId | (IProduct & { _id: Types.ObjectId });
  unitPrice: number;
  quantity: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  status: "active" | "completed";
  calculateTotal(): number;
}

const cartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true },
});

const cartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema],
  totalAmount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: CartStatusEnum, default: "active" },
});

cartSchema.methods.calculateTotal = function (this: ICart): number {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return this.totalAmount;
};

export const cartModel = mongoose.model<ICart>("Cart", cartSchema);
