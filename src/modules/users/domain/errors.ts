export class CannotDeactivateSelf extends Error {
  constructor() {
    super("Un administrador no puede darse de baja a sí mismo");
    this.name = "CannotDeactivateSelf";
  }
}

export class UserAlreadyInactive extends Error {
  constructor() {
    super("El usuario ya está dado de baja");
    this.name = "UserAlreadyInactive";
  }
}
