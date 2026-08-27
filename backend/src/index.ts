/** @format */
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute.js";
import { seedInitialProducts } from "./services/productService.js";
import productRoute from "./routes/productRoute.js";
import cartRoute from "./routes/cartRoute.js";

const app = express();
const PORT = 3001;
app.use(express.json());
app.use("/user", userRoute);
app.use("/product", productRoute);
app.use("/cart", cartRoute);

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(mongoUri);
    console.log("Mongo connected!");
    // seed the products to database
    await seedInitialProducts();

    app.listen(PORT, () =>
      console.log(`server is running at: http://localhost:${PORT}`),
    );
  } catch (err) {
    console.error("Failed to connect!", err);
    process.exit(1);
  }
}

start();
