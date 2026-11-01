export interface AuthenticatedUser {
  id: string;
  role: "customer" | "admin";
}

export interface TokenService {
  // Lo usa LoginUser: genera un token para ese usuario.
  sign(user: AuthenticatedUser): string;

  // Lo usa authenticate: valida el token y devuelve quién es.
  verify(token: string): AuthenticatedUser | null;
}
