import { promises as fs } from "fs";

class CartManager {
  constructor(path) {
    this.path = path;
  }

  async getCartById(id) {
    const data = await this.#readFile();
    return data.find((c) => c.id === id);
  }

  async createCart() {
    const data = await this.#readFile();
    const newCart = {
      id: crypto.randomUUID(), // Si querés usar `uuid`, decime y lo agregamos
      products: [],
    };
    data.push(newCart);
    await this.#writeFile(data);
    return newCart;
  }

  async addProductToCart(cartId, productId) {
    const data = await this.#readFile();
    const cart = data.find((c) => c.id === cartId);
    if (!cart) return null;

    const prodInCart = cart.products.find((p) => p.product === productId);
    if (prodInCart) {
      prodInCart.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await this.#writeFile(data);
    return cart;
  }

  async #readFile() {
    try {
      const file = await fs.readFile(this.path, "utf-8");
      return JSON.parse(file);
    } catch {
      return [];
    }
  }

  async #writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }
}

export default CartManager;
