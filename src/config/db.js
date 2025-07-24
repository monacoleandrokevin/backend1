// src/config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://coderuser:1234@cluster0.nikw1cm.mongodb.net/ecommerce?retryWrites=true&w=majority"
    );
    console.log("🔌 Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB", error);
  }
};
