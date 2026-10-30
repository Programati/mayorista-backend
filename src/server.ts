import { env } from "./config/env.ts";
import { connectDatabase } from "./config/database.ts";
import { createApp } from "./app.ts";

try {
  await connectDatabase();
} catch {
  process.exit(1);
}

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${env.PORT}`);
});
