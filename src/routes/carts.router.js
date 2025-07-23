import { Router } from "express";
import { Cart } from "../../models/Cart.js";
import { Product } from "../../models/Product.js";

const router = Router();

// POST /api/carts => crear carrito vacío
router.post("/", async (_, res) => {
  try {
    const nuevo = await Cart.create({ products: [] });
    res.status(201).json(nuevo);
  } catch {
    res.status(500).json({ error: "Error al crear carrito" });
  }
});

// GET /api/carts/:cid => obtener carrito con populate
router.get("/:cid", async (req, res) => {
  try {
    const carrito = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();
    if (!carrito)
      return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(carrito);
  } catch {
    res.status(500).json({ error: "Error al buscar carrito" });
  }
});

// POST /api/carts/:cid/product/:pid => agregar producto
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const producto = cart.products.find((p) => p.product.toString() === pid);
    if (producto) {
      producto.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    const actualizado = await Cart.findById(cid).populate("products.product");
    res.json(actualizado);
  } catch {
    res.status(500).json({ error: "Error al agregar producto" });
  }
});

// DELETE /api/carts/:cid/products/:pid => eliminar un producto
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== req.params.pid
    );
    await cart.save();

    res.json({ message: "Producto eliminado del carrito" });
  } catch {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// PUT /api/carts/:cid => actualizar array de productos
router.put("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = req.body.products;
    await cart.save();
    const actualizado = await Cart.findById(cart._id).populate(
      "products.product"
    );
    res.json(actualizado);
  } catch {
    res.status(500).json({ error: "Error al actualizar carrito" });
  }
});

// PUT /api/carts/:cid/products/:pid => actualizar cantidad
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== "number" || quantity < 1)
      return res.status(400).json({ error: "Cantidad inválida" });

    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const producto = cart.products.find(
      (p) => p.product.toString() === req.params.pid
    );
    if (!producto)
      return res
        .status(404)
        .json({ error: "Producto no encontrado en carrito" });

    producto.quantity = quantity;
    await cart.save();

    const actualizado = await Cart.findById(cart._id).populate(
      "products.product"
    );
    res.json(actualizado);
  } catch {
    res.status(500).json({ error: "Error al actualizar cantidad" });
  }
});

// DELETE /api/carts/:cid => vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();

    res.json({ message: "Carrito vaciado" });
  } catch {
    res.status(500).json({ error: "Error al vaciar carrito" });
  }
});

export default router;
