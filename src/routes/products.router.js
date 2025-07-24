import { Router } from "express";
import { Product } from "../models/Product.js";

const router = Router();

// GET /api/products?limit=&page=&sort=&query=
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filter = {};
    if (query) {
      if (query === "true" || query === "false") {
        filter.status = query === "true";
      } else {
        filter.category = query;
      }
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      lean: true,
    };

    if (sort === "asc") options.sort = { price: 1 };
    else if (sort === "desc") options.sort = { price: -1 };

    const result = await Product.paginate(filter, options);

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `${baseUrl}?page=${result.prevPage}&limit=${limit}`
        : null,
      nextLink: result.hasNextPage
        ? `${baseUrl}?page=${result.nextPage}&limit=${limit}`
        : null,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// GET /api/products/:pid
router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// POST /api/products/
router.post("/", async (req, res) => {
  try {
    console.log("BODY RECIBIDO:", req.body); // 👈 agregá esto

    const nuevo = await Product.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:pid
router.put("/:pid", async (req, res) => {
  try {
    const actualizado = await Product.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true, runValidators: true }
    );
    if (!actualizado)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res) => {
  try {
    const eliminado = await Product.findByIdAndDelete(req.params.pid);
    if (!eliminado)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
