import mongoose from "mongoose";
import { env } from "./env.ts";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(`Conectado a MongoDB: base "${mongoose.connection.name}"`);
  } catch (error) {
    console.error("No se pudo conectar a MongoDB:", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
