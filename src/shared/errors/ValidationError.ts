import { AppError } from "./AppError.ts";

export class ValidationError extends AppError {
  constructor(message: string = "Datos inválidos") {
    super(message, 400);
  }
}
