import type { NextFunction, Request, Response } from "express";
import type {
  AuthenticatedUser,
  TokenService,
} from "../../modules/auth/application/ports/TokenService.ts";

// Agrega req.user al tipo Request de Express. Está declarado acá porque
// authenticate es el único que lo escribe; authorize y los controladores lo leen.
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const BEARER_PREFIX = "Bearer ";

export function createAuthenticate(tokenService: TokenService) {
  return function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const header = req.headers.authorization;

    if (!header || !header.startsWith(BEARER_PREFIX)) {
      res.status(401).json({ message: "Token requerido" });
      return;
    }

    const token = header.slice(BEARER_PREFIX.length).trim();
    const user = tokenService.verify(token);

    if (!user) {
      res.status(401).json({ message: "Token inválido o vencido" });
      return;
    }

    req.user = user;
    next();
  };
}
