/** @format */

import type { FC, PropsWithChildren } from "react";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "./cartContext";
import type { CartItem } from "../../../types/CartItems";
import { BASE_URL } from "../../../constants/baseUrl";
import { AuthContext } from "../AuthContext";

type CartApiItem = {
  product?: {
    _id?: string;
    title?: string;
    image?: string;
    price?: number;
    unitPrice?: number;
  };
  quantity: number;
};

const CartProvider: FC<PropsWithChildren> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [error, setError] = useState("");

  const mapCartResponse = (cart: {
    items?: Array<{
      product?: {
        _id?: string;
        title?: string;
        image?: string;
        price?: number;
        unitPrice?: number;
      };
      quantity: number;
    }>;
  }): CartItem[] =>
    Array.isArray(cart?.items)
      ? cart.items
          .map(
            ({
              product,
              quantity,
            }: {
              product?: {
                _id?: string;
                title?: string;
                image?: string;
                price?: number;
                unitPrice?: number;
              };
              quantity: number;
            }) => ({
              productId: product?._id ?? "",
              title: product?.title ?? "",
              image: product?.image ?? "",
              quantity,
              unitPrice: product?.price ?? product?.unitPrice ?? 0,
            }),
          )
          .filter((item: CartItem) => item.productId)
      : [];

  useEffect(() => {
    if (!token) return;

    const fetchCart = async () => {
      try {
        const response = await fetch(`${BASE_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const cart = await response.json();
        setCartItems(mapCartResponse(cart));
        setTotalAmount(cart?.totalAmount ?? 0);
      } catch (caughtError) {
        console.error("❌ خطأ أثناء جلب السلة:", caughtError);
      }
    };

    fetchCart();
  }, [token]);

  const addItemToCart = async (productId: string): Promise<boolean> => {
    if (!token) {
      setError("Please log in before adding products to the cart.");
      return false;
    }

    try {
      const response = await fetch(`${BASE_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(
          typeof payload === "string"
            ? payload
            : payload?.message || `HTTP error! status: ${response.status}`,
        );
        return false;
      }

      const cart = await response.json();

      if (!cart || !Array.isArray(cart.items)) {
        setError("❌ خطأ: لم يتم استلام بيانات السلة من الخادم!");
        return false;
      }

      setCartItems(mapCartResponse(cart));
      setTotalAmount(cart.totalAmount ?? 0);
      return true;
    } catch (caughtError) {
      console.error("❌ خطأ أثناء إضافة المنتج إلى السلة:", caughtError);
      setError("حدث خطأ أثناء إضافة المنتج إلى السلة. يرجى المحاولة مرة أخرى.");
      return false;
    }
  };

  const updateItemInCart = async (productId: string, quantity: number) => {
    try {
      const response = await fetch(`${BASE_URL}/cart/items`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        setError("Failed to update cart");
        return;
      }

      const cart = await response.json();

      const cartItemsMapped = cart.items.map(
        ({ product, quantity }: CartApiItem) => ({
          productId: product?._id ?? "",
          title: product?.title ?? "",
          image: product?.image ?? "",
          quantity,
          unitPrice: product?.price ?? product?.unitPrice ?? 0,
        }),
      );

      setCartItems(cartItemsMapped);
      setTotalAmount(cart.totalAmount);
    } catch (error) {
      console.error(error);
      setError("Failed to update cart");
    }
  };

  const removeItemInCart = async (productId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/cart/items/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError("Failed to delete to cart");
      }
      const cart = await response.json();
      if (!cart) {
        setError("Failed to parse cart data");
      }

      const cartItemsMapped = cart.items.map(
        ({
          product,
          quantity,
          unitPrice,
        }: {
          product?: CartApiItem["product"];
          quantity: number;
          unitPrice: number;
        }) => ({
          productId: product?._id ?? "",
          title: product?.title ?? "",
          image: product?.image ?? "",
          quantity,
          unitPrice,
        }),
      );
      setCartItems([...cartItemsMapped]);
      setTotalAmount(cart.totalAmount);
    } catch (error) {
      console.error(error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(`${BASE_URL}/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError("Failed to empty to cart");
      }

      const cart = await response.json();

      if (!cart) {
        setError("Failed to parse cart data");
      }

      setCartItems([]);
      setTotalAmount(0);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        error,
        addItemToCart,
        updateItemInCart,
        removeItemInCart,
        clearCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
