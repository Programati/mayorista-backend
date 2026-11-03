import { CannotDeactivateSelf, UserAlreadyInactive } from "./errors.ts";

export interface UserProps {
  id: string;
  email: string;
  name: string;
  active: boolean;
  created: Date;
  modified: Date;
  modifiedBy: string | null;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly created: Date;
  private _active: boolean;
  private _modified: Date;
  private _modifiedBy: string | null;

  constructor({
    id,
    email,
    name,
    active,
    created,
    modified,
    modifiedBy,
  }: UserProps) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.created = created;
    this._active = active;
    this._modified = modified;
    this._modifiedBy = modifiedBy;
  }

  get active(): boolean {
    return this._active;
  }

  get modified(): Date {
    return this._modified;
  }

  get modifiedBy(): string | null {
    return this._modifiedBy;
  }

  deactivate(actorId: string): void {
    if (this.id === actorId) {
      throw new CannotDeactivateSelf();
    }
    if (!this._active) {
      throw new UserAlreadyInactive();
    }
    this._active = false;
    this._modified = new Date();
    this._modifiedBy = actorId;
  }
}
