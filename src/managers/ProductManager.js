import { promises as fs } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

/**
 * ProductManager
 * --------------
 * Gestiona la colección de productos persistida en un archivo JSON.
 *
 * Métodos públicos:
 *   - getProducts()
 *   - getProductById(id)
 *   - addProduct(data)
 *   - updateProduct(id, data)
 *   - deleteProduct(id)
 */
class ProductManager {
  /**
   * @param {string} relativePath Ruta del archivo JSON (relativa al proyecto)
   */
  constructor(relativePath) {
    // Calculamos la ruta absoluta para evitar problemas al ejecutar desde otra carpeta
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.path = resolve(__dirname, "..", relativePath); // => ./src/data/products.json
  }

  /* -------------------------------------------------------------------- */
  /* Métodos de lectura / escritura privados                               */
  /* -------------------------------------------------------------------- */

  async #readFile() {
    try {
      const data = await fs.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      // Si el archivo no existe o está vacío, devolvemos []
      if (err.code === "ENOENT" || err.name === "SyntaxError") return [];
      throw err;
    }
  }

  async #writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  /* -------------------------------------------------------------------- */
  /* Métodos públicos                                                      */
  /* -------------------------------------------------------------------- */

  /**
   * Devuelve todos los productos
   * @returns {Promise<Array>}
   */
  async getProducts() {
    return this.#readFile();
  }

  /**
   * Devuelve un producto por ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getProductById(id) {
    const products = await this.#readFile();
    return products.find((p) => p.id === id) || null;
  }

  /**
   * Agrega un nuevo producto
   * @param {Object} data
   * @returns {Promise<Object>} Producto creado
   */
  async addProduct(data) {
    const requiredFields = [
      "title",
      "description",
      "code",
      "price",
      "status",
      "stock",
      "category",
    ];

    // Validación mínima
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    const products = await this.#readFile();

    // Nos aseguramos de que el code sea único
    if (products.some((p) => p.code === data.code)) {
      throw new Error(`Ya existe un producto con code "${data.code}"`);
    }

    const newProduct = {
      id: crypto.randomUUID(), // ID autogenerado
      title: data.title,
      description: data.description,
      code: data.code,
      price: Number(data.price),
      status: Boolean(data.status),
      stock: Number(data.stock),
      category: data.category,
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails : [],
    };

    products.push(newProduct);
    await this.#writeFile(products);

    return newProduct;
  }

  /**
   * Actualiza un producto existente (menos su id)
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object|null>} Producto actualizado o null si no existe
   */
  async updateProduct(id, updates) {
    const products = await this.#readFile();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    // Evitamos que intenten modificar el id
    if ("id" in updates) delete updates.id;

    // Mezclamos los cambios
    products[index] = {
      ...products[index],
      ...updates,
      price:
        updates.price !== undefined
          ? Number(updates.price)
          : products[index].price,
      stock:
        updates.stock !== undefined
          ? Number(updates.stock)
          : products[index].stock,
      status:
        updates.status !== undefined
          ? Boolean(updates.status)
          : products[index].status,
    };

    await this.#writeFile(products);
    return products[index];
  }

  /**
   * Elimina un producto por ID
   * @param {string} id
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  async deleteProduct(id) {
    const products = await this.#readFile();
    const newProducts = products.filter((p) => p.id !== id);
    if (newProducts.length === products.length) return false; // no existía

    await this.#writeFile(newProducts);
    return true;
  }
}

export default ProductManager;
