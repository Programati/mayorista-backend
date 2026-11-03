import { AppError } from "./AppError.ts";

export class NotFoundError extends AppError {
  constructor(message: string = "Recurso no encontrado") {
    super(message, 404);
  }
}
