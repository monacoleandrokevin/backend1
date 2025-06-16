import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();
const cartManager = new CartManager("./src/data/carts.json");

router.post("/", async (req, res) => {
  const nuevoCarrito = await cartManager.createCart();
  res.status(201).json(nuevoCarrito);
});

router.get("/:cid", async (req, res) => {
  const carrito = await cartManager.getCartById(req.params.cid);
  if (carrito) res.json(carrito);
  else res.status(404).json({ error: "Carrito no encontrado" });
});

router.post("/:cid/product/:pid", async (req, res) => {
  const actualizado = await cartManager.addProductToCart(
    req.params.cid,
    req.params.pid
  );
  if (actualizado) res.json(actualizado);
  else res.status(404).json({ error: "Carrito o producto no encontrado" });
});

export default router;
