import { Router } from "express";

// Router central: cada módulo se monta acá bajo /api.
// Se descomenta cuando exista el módulo correspondiente.
export const apiRouter = Router();

// import { usersRouter } from "../modules/users/adapters/in/http/users.routes.ts";
// apiRouter.use("/users", usersRouter);
