import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";

import ProductManager from "./managers/ProductManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app); // para socket.io
const io = new Server(httpServer); // socket.io

const productManager = new ProductManager("data/products.json");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// WebSockets
io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");

  // Enviar lista de productos al conectarse
  const productos = await productManager.getProducts();
  socket.emit("productosActualizados", productos);

  // Recibe nuevo producto desde el cliente
  socket.on("nuevoProducto", async (data) => {
    await productManager.addProduct(data);
    const productos = await productManager.getProducts();
    io.emit("productosActualizados", productos); // a todos los clientes
  });

  socket.on("eliminarProducto", async (id) => {
    await productManager.deleteProduct(id);
    const productos = await productManager.getProducts();
    io.emit("productosActualizados", productos);
  });
});

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
