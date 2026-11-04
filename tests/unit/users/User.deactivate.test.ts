import { describe, it, expect } from "vitest";
import { User } from "../../../src/modules/users/domain/User.ts";
import {
  CannotDeactivateSelf,
  UserAlreadyInactive,
} from "../../../src/modules/users/domain/errors.ts";

const ADMIN_ID = "admin-1";
const USER_ID = "user-2";
const CREATED = new Date("2026-09-01T00:00:00Z");
const INITIAL_MODIFIED = new Date("2026-10-01T00:00:00Z");
const DEACTIVATION_DATE = new Date("2026-11-01T10:00:00Z");

function buildUser(active: boolean): User {
  return new User({
    id: USER_ID,
    email: "pepe@almacen.com",
    name: "Almacén Don Pepe",
    active,
    created: CREATED,
    modified: INITIAL_MODIFIED,
    modifiedBy: ADMIN_ID,
  });
}

describe("User.deactivate", () => {
  it("rechaza que un usuario se dé de baja a sí mismo y no cambia su estado", () => {
    const user = buildUser(true);

    expect(() => user.deactivate(USER_ID, DEACTIVATION_DATE)).toThrow(
      CannotDeactivateSelf,
    );
    expect(user.active).toBe(true);
    expect(user.modified).toEqual(INITIAL_MODIFIED);
  });

  it("rechaza dar de baja a un usuario que ya está inactivo", () => {
    const user = buildUser(false);

    expect(() => user.deactivate(ADMIN_ID, DEACTIVATION_DATE)).toThrow(
      UserAlreadyInactive,
    );
  });

  it("da de baja al usuario y registra la fecha y quién lo hizo", () => {
    const user = buildUser(true);

    user.deactivate(ADMIN_ID, DEACTIVATION_DATE);

    expect(user.active).toBe(false);
    expect(user.modified).toEqual(DEACTIVATION_DATE);
    expect(user.modifiedBy).toBe(ADMIN_ID);
  });
});
