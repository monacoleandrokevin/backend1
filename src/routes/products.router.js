import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const productManager = new ProductManager("data/products.json"); // ojo, ya no anteponemos ./src/

// GET /
router.get("/", async (_, res) => {
  const products = await productManager.getProducts();
  res.json(products);
});

// GET /:pid
router.get("/:pid", async (req, res) => {
  const product = await productManager.getProductById(req.params.pid);
  if (!product)
    return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

// POST /
router.post("/", async (req, res) => {
  try {
    const created = await productManager.addProduct(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /:pid
router.put("/:pid", async (req, res) => {
  const updated = await productManager.updateProduct(req.params.pid, req.body);
  if (!updated)
    return res.status(404).json({ error: "Producto no encontrado" });
  res.json(updated);
});

// DELETE /:pid
router.delete("/:pid", async (req, res) => {
  const ok = await productManager.deleteProduct(req.params.pid);
  if (!ok) return res.status(404).json({ error: "Producto no encontrado" });
  res.json({ message: "Producto eliminado" });
});

export default router;
