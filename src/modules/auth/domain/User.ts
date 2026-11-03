import type { Role } from "./Role.ts";

export interface AuthUserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: Role;

  constructor({ id, email, passwordHash, role }: AuthUserProps) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
  }

  static create(input: {
    id: string;
    email: string;
    passwordHash: string;
  }): User {
    return new User({ ...input, role: "customer" });
  }
}
