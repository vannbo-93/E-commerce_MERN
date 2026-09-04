/** @format */

import mongoose, { type ClientSession } from "mongoose";
import { cartModel } from "../models/cartModel.js";
import productModel from "../models/productModel.js";
import { orderModel, type IOrderItem } from "../models/orderModel.js";

function getProductId(product: unknown): string {
  if (!product) return "";
  if (typeof product === "object" && product !== null && "_id" in product) {
    return String((product as { _id: unknown })._id);
  }
  return String(product);
}

interface GetActiveCartForUser {
  userId: string;
  session?: ClientSession;
}

export const getActiveCartForUser = async ({
  userId,
  session,
}: GetActiveCartForUser) => {
  const query = cartModel
    .findOne({
      userId,
      status: "active",
    })
    .populate({
      path: "items.product",
      model: "Product",
      select: "title image price stock",
    });

  const cart = session ? await query.session(session) : await query;

  if (cart) {
    return cart;
  }

  const newCart = new cartModel({
    userId,
    status: "active",
  });

  return session ? await newCart.save({ session }) : await newCart.save();
};

interface AddItemToCart {
  productId: string;
  quantity: number;
  userId: string;
}

interface ClearCart {
  userId: string;
}

export const clearCart = async ({ userId }: ClearCart) => {
  const cart = await getActiveCartForUser({ userId });

  cart.items = [];
  cart.totalAmount = 0;

  const updatedCart = await cart.save();

  return { data: updatedCart, statusCode: 200 };
};

export const addItemToCart = async ({
  productId,
  quantity,
  userId,
}: AddItemToCart) => {
  if (!productId || !userId) {
    return {
      data: "Product and user are required",
      statusCode: 400,
    };
  }

  const normalizedQuantity = Number(quantity);

  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
    return {
      data: "Quantity must be a positive integer",
      statusCode: 400,
    };
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return {
      data: "Invalid product id",
      statusCode: 400,
    };
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return {
      data: "Invalid user id",
      statusCode: 400,
    };
  }

  const session = await mongoose.startSession();

  try {
    const cart = await getActiveCartForUser({ userId });

    const existsInCart = cart.items.find(
      (item) => getProductId(item.product) === productId,
    );
    if (existsInCart) {
      return { data: "Item already exists in cart!", statusCode: 400 };
    }

    const product = await productModel.findOneAndUpdate(
      { _id: productId, stock: { $gte: normalizedQuantity } },
      { $inc: { stock: -normalizedQuantity } },
      { returnDocument: "after" },
    );

    if (!product) {
      return { data: "Product not found or low stock", statusCode: 404 };
    }

    cart.items.push({
      product: new mongoose.Types.ObjectId(productId),
      unitPrice: product.price,
      quantity: normalizedQuantity,
    });

    cart.calculateTotal();
    await cart.save();
    const populatedCart = await getActiveCartForUser({ userId });

    return { data: populatedCart, statusCode: 200 };
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    return { data: "Failed to add item to cart", statusCode: 500 };
  }
};

interface UpdateItemInCart {
  productId: string;
  quantity: number;
  userId: string;
}

export const updateItemInCart = async ({
  productId,
  quantity,
  userId,
}: UpdateItemInCart) => {
  const normalizedQuantity = Number(quantity);

  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
    return { data: "Quantity must be a positive integer", statusCode: 400 };
  }

  const cart = await getActiveCartForUser({ userId });

  const existsInCart = cart.items.find(
    (p) => getProductId(p.product) === productId,
  );

  if (!existsInCart) {
    return { data: "Item does not exist in cart", statusCode: 400 };
  }

  const product = await productModel.findById(productId);

  if (!product) {
    return { data: "Product not found!", statusCode: 400 };
  }

  const difference = normalizedQuantity - existsInCart.quantity;

  if (difference > 0 && product.stock < difference) {
    return { data: "Low stock for item", statusCode: 400 };
  }

  if (difference > 0) {
    product.stock -= difference;
    await product.save();
  } else if (difference < 0) {
    product.stock += Math.abs(difference);
    await product.save();
  }

  existsInCart.quantity = normalizedQuantity;
  existsInCart.unitPrice = product.price;
  cart.calculateTotal();

  const updatedCart = await cart.save();
  return { data: updatedCart, statusCode: 200 };
};

interface DeleteItemInCart {
  productId: string;
  userId: string;
}

export const deleteItemInCart = async ({
  userId,
  productId,
}: DeleteItemInCart) => {
  const cart = await getActiveCartForUser({ userId });

  const itemIndex = cart.items.findIndex(
    (p) => getProductId(p.product) === productId,
  );

  if (itemIndex === -1) {
    return { data: "Item does not exist in cart", statusCode: 400 };
  }

  const [removedItem] = cart.items.splice(itemIndex, 1);

  if (removedItem) {
    await productModel.findByIdAndUpdate(removedItem.product, {
      $inc: { stock: removedItem.quantity },
    });
  }

  cart.calculateTotal();

  const updatedCart = await cart.save();

  return { data: updatedCart, statusCode: 200 };
};

interface Checkout {
  userId: string;
  address: string;
}

export const cheCkout = async ({ userId, address }: Checkout) => {
  const cart = await getActiveCartForUser({ userId });

  if (!cart.items.length) {
    return { data: "Cart is empty", statusCode: 400 };
  }

  const orderItems: IOrderItem[] = [];

  for (const item of cart.items) {
    const product = await productModel.findById(item.product);

    if (!product) {
      return { data: "Product not found", statusCode: 400 };
    }

    const orderItem: IOrderItem = {
      productTitle: product.title,
      productImage: product.image,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    };
    orderItems.push(orderItem);
  }

  const order = await orderModel.create({
    userId,
    orderItems,
    total: cart.totalAmount,
    address,
  });

  cart.status = "completed";
  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  return { data: order, statusCode: 201 };
};
