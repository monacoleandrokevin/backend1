import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://coderuser:1234@cluster0.nikw1cm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("🔌 Conectado a MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB Atlas:", err.message);
  }
};
