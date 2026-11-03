import type { User } from "./../domain/User.ts";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  guardar(user: User): Promise<void>;
}
