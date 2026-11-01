import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedUser } from "../../modules/auth/application/ports/TokenService.ts";

type Role = AuthenticatedUser["role"];

// authorize("admin") devuelve el middleware. Acepta varios roles: authorize("admin", "customer").
export function authorize(...allowedRoles: Role[]) {
  return function (req: Request, res: Response, next: NextFunction): void {
    // Si llega acá sin req.user, la ruta está mal armada (falta authenticate).
    // Respondemos 401 por seguridad; no debería ocurrir si las rutas están bien.
    if (!req.user) {
      res.status(401).json({ message: "No autenticado" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "No tenés permiso para esta acción" });
      return;
    }

    next();
  };
}
