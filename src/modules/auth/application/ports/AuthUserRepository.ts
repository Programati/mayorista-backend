import type { User } from "../../domain/User.ts";

export interface AuthAccount {
  user: User;
  active: boolean;
}

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthAccount | null>;
  guardar(user: User): Promise<void>;
}
