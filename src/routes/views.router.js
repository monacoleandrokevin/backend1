import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const productManager = new ProductManager("data/products.json");

router.get("/", async (req, res) => {
  const productos = await productManager.getProducts();
  res.render("home", { productos });
});

router.get("/realtimeproducts", async (req, res) => {
  res.render("realTimeProducts");
});

export default router;
