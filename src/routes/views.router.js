import { Router } from "express";
import { Product } from "../models/Product.js";
import { Cart } from "../models/Cart.js";

const router = Router();

// Redirige a la vista principal
router.get("/", (req, res) => {
  res.redirect("/products");
});

// Vista paginada de productos con filtros
router.get("/products", async (req, res) => {
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
    if (sort === "desc") options.sort = { price: -1 };

    const result = await Product.paginate(filter, options);

    res.render("home", {
      productos: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    });
  } catch (error) {
    res.status(500).send("Error al cargar productos");
  }
});

// Vista tradicional de WebSocket
router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

// Vista detallada del producto
router.get("/products/:pid", async (req, res) => {
  const producto = await Product.findById(req.params.pid).lean();
  if (!producto) return res.status(404).send("Producto no encontrado");
  res.render("product", { producto });
});

// Vista del carrito
router.get("/carts/:cid", async (req, res) => {
  const carrito = await Cart.findById(req.params.cid)
    .populate("products.product")
    .lean();
  if (!carrito) return res.status(404).send("Carrito no encontrado");
  res.render("cart", { carrito });
});

export default router;
