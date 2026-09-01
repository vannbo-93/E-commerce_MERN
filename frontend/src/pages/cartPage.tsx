/** @format */
// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import ButtonGroup from "@mui/material/ButtonGroup";
// import { useCart } from "../context/Cart/CartContext";
// import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useState, useEffect } from "react";
import { useAuth } from "../context/Auth/AuthContext";
import { BASE_URL } from "../constants/baseUrl";

interface CartItem {
  [key: string]: unknown;
}

const CartPage = () => {
  const { token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
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

        const data: unknown = await response.json();
        setCart(
          typeof data === "object" &&
            data !== null &&
            "items" in data &&
            Array.isArray(data.items)
            ? data.items
            : [],
        );
      } catch {
        setError("Unable to connect to the server. Please try again!");
      }
    };
    fetchCart();
  }, [token]);

  console.log({ cart });
  return (
    <Container sx={{ mt: 2 }}>
      <Typography>My Cart</Typography>
      {error && <Typography sx={{ color: "red" }}>{error}</Typography>}
    </Container>
  );
};
export default CartPage;
