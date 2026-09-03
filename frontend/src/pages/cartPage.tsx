/** @format */
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { useAuth } from "../context/Auth/AuthContext";
import { BASE_URL } from "../constants/baseUrl";

interface CartItem {
  productId: string;
  title: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

const CartPage = () => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token || !token.trim()) {
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await fetch(`${BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError("Unable to fetch cart, please try again!");
          return;
        }

        const data = await response.json();

        const items = Array.isArray(data?.items)
          ? data.items.map((item: any) => ({
              productId: item?.product?._id ?? item?.product ?? "",
              title: item?.product?.title ?? "Product",
              image: item?.product?.image ?? "",
              quantity: item?.quantity ?? 0,
              unitPrice: item?.unitPrice ?? item?.product?.price ?? 0,
            }))
          : [];

        setCartItems(items);
        setTotalAmount(data?.totalAmount ?? 0);
      } catch {
        setError("Unable to connect to the server. Please try again!");
      }
    };

    fetchCart();
  }, [token]);

  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h4">My Cart</Typography>
      {error && (
        <Typography sx={{ color: "red", mt: 2 }}>{error}</Typography>
      )}
      {cartItems.length === 0 ? (
        <Typography sx={{ mt: 2 }}>Your cart is empty.</Typography>
      ) : (
        cartItems.map((item) => (
          <Box key={item.productId} sx={{ mb: 1 }}>
            <Typography>{item.title}</Typography>
            <Typography>{item.quantity} x {item.unitPrice} MAD</Typography>
          </Box>
        ))
      )}
      {cartItems.length > 0 && (
        <Typography variant="h6" sx={{ mt: 2 }}>
          Total: {totalAmount} MAD
        </Typography>
      )}
    </Container>
  );
};

export default CartPage;
