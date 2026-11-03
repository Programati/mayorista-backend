import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedUser } from "../../modules/auth/application/ports/TokenService.ts";

type Role = AuthenticatedUser["role"];

export function authorize(...allowedRoles: Role[]) {
  return function (req: Request, res: Response, next: NextFunction): void {
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
