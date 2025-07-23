import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: { type: String, unique: true },
  price: Number,
  status: Boolean,
  stock: Number,
  category: String,
  thumbnails: [String],
});

productSchema.plugin(mongoosePaginate); // Agrega el plugin

export const Product = mongoose.model("Product", productSchema);
