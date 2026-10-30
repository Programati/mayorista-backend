import express, { type Express, type Request, type Response } from "express";
import { connectDatabase } from "./config/database.ts";
import { env } from "./config/env.ts";

try {
  await connectDatabase();
} catch {
  // connectDatabase ya registró el error; acá solo salimos con código 1
  process.exit(1);
}

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${env.PORT}`);
});
