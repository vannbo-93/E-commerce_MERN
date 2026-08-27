/** @format */

import productModel from "../models/productModel.js";

export const getAllProducts = async () => {
  return await productModel.find();
};

export const seedInitialProducts = async () => {
  const products = [
    {
      title: "HP 14 intel Core",
      image:
        "https://i5.walmartimages.com/seo/HP-14-inch-Laptop-Intel-Core-i3-N305-8GB-RAM-256GB-SSD-Moonlight-Blue_3c814651-0efa-4e3c-9598-efb385991581.8bd1455c08963f272709c63b7f0dbf40.jpeg",
      price: 1500,
      stock: 10,
    },
  ];

  const existingProducts = await getAllProducts();

  if (existingProducts.length === 0) {
    await productModel.insertMany(products);
  }
};
