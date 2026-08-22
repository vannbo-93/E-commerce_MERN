/** @format */
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute.js";

const app = express();
const PORT = 3001;
app.use(express.json());
app.use("/user", userRoute);

async function start() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ecommerce");
    console.log("Mongo connected!");
    app.listen(PORT, () =>
      console.log(`server is running at: http://localhost:${PORT}`),
    );
  } catch (err) {
    console.error("Failed to connect!", err);
    process.exit(1);
  }
}

start();
