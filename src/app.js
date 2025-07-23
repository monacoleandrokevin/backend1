import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";

import { connectDB } from "./config/db.js";
import { Product } from "./models/Product.js";

import handlebars from "express-handlebars";

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

// Handlebars
const hbs = handlebars.create({
  helpers: {
    multiply: (a, b) => a * b,
  },
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// WebSocket
io.on("connection", async (socket) => {
  console.log("Cliente conectado vía WebSocket");

  const productos = await Product.find().lean();
  socket.emit("productosActualizados", productos);

  socket.on("nuevoProducto", async (data) => {
    await Product.create(data);
    const productos = await Product.find().lean();
    io.emit("productosActualizados", productos);
  });

  socket.on("eliminarProducto", async (id) => {
    await Product.findByIdAndDelete(id);
    const productos = await Product.find().lean();
    io.emit("productosActualizados", productos);
  });
});

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
