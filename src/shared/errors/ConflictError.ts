import { AppError } from "./AppError.ts";

export class ConflictError extends AppError {
  constructor(message: string = "Conflicto con el estado actual del recurso") {
    super(message, 409);
  }
}
