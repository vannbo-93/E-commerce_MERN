/** @format */
import { Box, Button, ButtonGroup, Container, Typography } from "@mui/material";
import { useCart } from "../context/Auth/cart/cartContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const {
    cartItems,
    totalAmount,
    updateItemInCart,
    removeItemInCart,
    clearCart,
  } = useCart();

  const handleQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      return;
    }
    updateItemInCart(productId, quantity);
  };

  const handlerRemoveItem = (productId: string) => {
    removeItemInCart(productId);
  };

  const navigate = useNavigate();

  return (
    <Container fixed sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          mb: 4,
        }}>
        <Typography variant="h4">My Cart</Typography>
        <Button
          onClick={() => clearCart()}
          variant="contained"
          sx={{ backgroundColor: "#ff0000" }}>
          Clear Cart
        </Button>
      </Box>
      {/* {cartItems.length === 0 ? ( */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {cartItems.map((item) => (
          <Box
            key={item.productId}
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              border: 1,
              borderColor: "#f2f2f2",
              borderRadius: 5,
              padding: 1,
            }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1,
              }}>
              <img src={item.image} width={120} />

              <Box>
                <Typography variant="h6">{item.title}</Typography>
                <Typography>
                  {item.quantity} x {item.unitPrice} MAD
                </Typography>
                <Button
                  onClick={() => handlerRemoveItem(item.productId)}
                  variant="contained"
                  sx={{ backgroundColor: "#ff0000" }}>
                  Delete
                </Button>
              </Box>
            </Box>

            <ButtonGroup variant="contained" aria-label="Basic button group">
              <Button
                onClick={() =>
                  handleQuantity(item.productId, item.quantity - 1)
                }>
                -
              </Button>
              <Button
                onClick={() =>
                  handleQuantity(item.productId, item.quantity + 1)
                }>
                +
              </Button>
            </ButtonGroup>
          </Box>
        ))}

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <Typography variant="h4">
            Total Amount: {totalAmount.toFixed(2)} MAD
          </Typography>
          <Button variant="contained" onClick={() => navigate("/checkout")}>
            Go To Checkout
          </Button>
        </Box>
      </Box>
      {/* ) : ( */}
      {/* <Typography variant="h5">Your cart is empty.</Typography> */}
      {/* )} */}
    </Container>
  );
};
export default CartPage;
