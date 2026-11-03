import { CannotDeactivateSelf, UserAlreadyInactive } from "./errors.ts";
import type { Role } from "./Role.ts";

export interface UserProps {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  created: Date;
  modified: Date;
  modifiedBy: string | null;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly role: Role;
  active: boolean;
  readonly created: Date;
  modified: Date;
  modifiedBy: string | null;

  constructor({
    id,
    email,
    name,
    passwordHash,
    role,
    active,
    created,
    modified,
    modifiedBy,
  }: UserProps) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.passwordHash = passwordHash;
    this.role = role;
    this.active = active;
    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

  static create(input: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
  }): User {
    const now = new Date();
    return new User({
      ...input,
      role: "customer",
      active: true,
      created: now,
      modified: now,
      modifiedBy: input.id,
    });
  }

  deactivate(actorId: string): void {
    if (this.id === actorId) {
      throw new CannotDeactivateSelf();
    }
    if (!this.active) {
      throw new UserAlreadyInactive();
    }
    this.active = false;
    this.modified = new Date();
    this.modifiedBy = actorId;
  }
}
