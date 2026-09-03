/** @format */
import { createContext, useContext } from "react";
import type { CartItem } from "../../../types/CartItems";

interface CartContextType {
  cartItems: CartItem[];
  totalAmount: number;
  error: string;
  addItemToCart: (productId: string) => Promise<boolean>;
  updateItemInCart: (productId: string, quantity: number) => void;
  removeItemInCart: (productId: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  totalAmount: 0,
  error: "",
  addItemToCart: async () => false,
  updateItemInCart: () => {},
  removeItemInCart: () => {},
  clearCart: () => {},
});

export const useCart = () => useContext(CartContext);
