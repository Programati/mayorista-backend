import { ConflictError } from "../../../../shared/errors/ConflictError.ts";
import { ForbiddenError } from "../../../../shared/errors/ForbiddenError.ts";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.ts";
import {
  CannotDeactivateSelf,
  UserAlreadyInactive,
} from "../../domain/errors.ts";
import type { User } from "../../domain/User.ts";
import type { UserRepository } from "../ports/UserRepository.ts";

export interface DeactivateUserInput {
  userId: string;
  actorId: string;
}

export class DeactivateUser {
  private readonly users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  async execute({ userId, actorId }: DeactivateUserInput): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    try {
      user.deactivate(actorId);
    } catch (error) {
      if (error instanceof CannotDeactivateSelf) {
        throw new ForbiddenError(error.message);
      }
      if (error instanceof UserAlreadyInactive) {
        throw new ConflictError(error.message);
      }
      throw error;
    }

    await this.users.guardar(user);
    return user;
  }
}
