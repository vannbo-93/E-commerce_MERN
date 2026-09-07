/** @format */

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import { useRef } from "react";
import { useCart } from "../context/Auth/cart/cartContext";

type CartItem = {
  productId: string | number;
  image: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

const CheckoutPage = () => {
  const { cartItems, totalAmount } = useCart();
  const addressRef = useRef<HTMLInputElement>(null);

  const handleConfirmOrder = () => {
    const address = addressRef.current?.value.trim();

    if (!address) {
      alert("Please enter a delivery address.");
      return;
    }

    alert(`Order confirmed for delivery to: ${address}`);
  };

  const renderCartItems = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {cartItems.map((item: CartItem) => (
        <Box sx={{display: "flex",flexDirection: "row",justifyContent: "space-between",alignItems: "center",width: "100%",}}
          key={item.productId}>
          <Box sx={{display: "flex",flexDirection: "row",alignItems: "center",gap: 1,width: "100%",}}>
            <img src={item.image} width={50} alt={item.title} />
            <Box
              sx={{display: "flex",flexDirection: "row",alignItems: "center",justifyContent: "space-between",width: "100%",}}>
              <Typography variant="h6">{item.title}</Typography>
              <Typography>
                {item.quantity} x {item.unitPrice} EGP
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
      <Box>
        <Typography variant="body2" sx={{ textAlign: "right" }}>
          Total Amount: {totalAmount.toFixed(2)} MAD
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Container
      fixed
      sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        sx={{display: "flex",flexDirection: "row",justifyContent: "space-between",mb: 2,}}>
        <Typography variant="h4">Checkout</Typography>
      </Box>
      <TextField
        inputRef={addressRef}
        label="Delivery Address"
        name="address"
        fullWidth
      />
      {renderCartItems()}
      <Button variant="contained" fullWidth onClick={handleConfirmOrder}>
        Pay Now
      </Button>
    </Container>
  );
};

export default CheckoutPage;
