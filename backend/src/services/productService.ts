/** @format */

import productModel from "../models/productModel.js";

export const getAllProducts = async () => {
  return await productModel.find();
};

export const seedInitialProducts = async () => {
  const products = [
    {
      title: "Dell Laptop",
      image:
        "https://grandediffusion.ma/wp-content/uploads/2016/03/dell-latitude-7400-i7-8665u-14-8go-512go-ssd-win-10.png",
      price: 2500,
      stock: 6,
    },
    {
      title: "Asus Laptop",
      image: "https://m.media-amazon.com/images/I/71Hy5SYr3tL._AC_SL1500_.jpg",
      price: 1500,
      stock: 5,
    },
    {
      title: "HP Laptop",
      image:
        "https://www.trustedreviews.com/wp-content/uploads/sites/7/2023/01/HP-Envy-16-07.jpg",
      price: 1650,
      stock: 4,
    },
  ];

  const existingProducts = await getAllProducts();

  if (existingProducts.length === 0) {
    await productModel.insertMany(products);
  }
};
