/** @format */

import mongoose, { type ClientSession } from "mongoose";
import { cartModel } from "../models/cartModel.js";
import productModel from "../models/productModel.js";
import { Checker } from "typescript/unstable/sync";
import { orderModel, type IOrderItem } from "../models/orderModel.js";

interface GetActiveCartForUser {
  userId: string;
  session?: ClientSession;
}

export const getActiveCartForUser = async ({
  userId,
  session,
}: GetActiveCartForUser) => {
  const query = cartModel.findOne({
    userId,
    status: "active",
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

interface clearCart {
  userId: string;
}

export const clearCart = async ({ userId }: clearCart) => {
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

  if (!Number.isInteger(quantity) || quantity <= 0) {
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
    return await session.withTransaction(async () => {
      const cart = await getActiveCartForUser({
        userId,
        session,
      });

      const existsInCart = cart.items.find(
        (item) => item.product.toString() === productId,
      );

      if (existsInCart) {
        return {
          data: "Item already exists in cart!",
          statusCode: 400,
        };
      }

      const product = await productModel.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantity },
        },
        {
          $inc: {
            stock: -quantity,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!product) {
        return {
          data: "Product not found or low stock",
          statusCode: 404,
        };
      }

      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        unitPrice: product.price,
        quantity,
      });

      cart.calculateTotal();

      const updatedCart = await cart.save({
        session,
      });

      return {
        data: updatedCart,
        statusCode: 200,
      };
    });
  } catch (error) {
    console.error("Failed to add item to cart:", error);

    return {
      data: "Failed to add item to cart",
      statusCode: 500,
    };
  } finally {
    await session.endSession();
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
  const cart = await getActiveCartForUser({ userId });

  const existsInCart = cart.items.find(
    (p) => p.product.toString() === productId,
  );

  if (!existsInCart) {
    return { data: "Item does not exist in cart", statusCode: 400 };
  }

  const product = await productModel.findById(productId);

  if (!product) {
    return { data: "Product not found!", statusCode: 400 };
  }

  if (product.stock < quantity) {
    return { data: "Low stock for item", statusCode: 400 };
  }

  existsInCart.quantity = quantity;

  const otherCartItems = cart.items.filter(
    (p) => p.product.toString() !== productId,
  );

  let total = otherCartItems.reduce((sum, product) => {
    sum += product.quantity * product.unitPrice;
    return sum;
  }, 0);

  existsInCart.quantity = quantity;
  total += existsInCart.quantity * existsInCart.unitPrice;
  cart.totalAmount = total;
  const updatedCart = await cart.save();
  return { data: updatedCart, statusCode: 200 };
};

interface DeleteItemInCart {
  productId: any;
  userId: string;
}

export const deleteItemInCart = async ({
  userId,
  productId,
}: DeleteItemInCart) => {
  const cart = await getActiveCartForUser({ userId });

  const existsInCart = cart.items.find(
    (p) => p.product.toString() === productId,
  );

  if (!existsInCart) {
    return { data: "Item does not exist in cart", statusCode: 400 };
  }

  const otherCartItems = cart.items.filter(
    (p) => p.product.toString() !== productId,
  );

  const total = otherCartItems.reduce((sum, product) => {
    sum += product.quantity * product.unitPrice;
    return sum;
  }, 0);

  cart.totalAmount = total;
  //delete this
  cart.items = otherCartItems;

  const updatedCart = await cart.save();

  return { data: updatedCart, statusCode: 200 };
};

interface Checkout {
  userId: string;
  address: string;
}

export const cheCkout = async ({ userId, address }: Checkout) => {
  const cart = await getActiveCartForUser({ userId });

  const orderItems: IOrderItem[] = [];

  //Loop cartItems and create orderItems
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
    orderItems,
    total: cart.totalAmount,
    address,
  });
  await order.save();
};
