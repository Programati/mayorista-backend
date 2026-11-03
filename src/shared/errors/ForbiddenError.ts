import { AppError } from "./AppError.ts";

export class ForbiddenError extends AppError {
  constructor(message: string = "No tenés permiso para esta acción") {
    super(message, 403);
  }
}
