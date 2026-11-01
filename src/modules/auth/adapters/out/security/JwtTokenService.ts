import jwt, { type SignOptions } from "jsonwebtoken";
import type {
  AuthenticatedUser,
  TokenService,
} from "../../../application/ports/TokenService.ts";

export class JwtTokenService implements TokenService {
  private readonly secret: string;
  private readonly expiresIn: SignOptions["expiresIn"];

  constructor(secret: string, expiresIn: SignOptions["expiresIn"] = "1h") {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(user: AuthenticatedUser): string {
    return jwt.sign({ sub: user.id, role: user.role }, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  verify(token: string): AuthenticatedUser | null {
    try {
      const payload = jwt.verify(token, this.secret) as jwt.JwtPayload;
      return {
        id: String(payload.sub),
        role: payload.role as AuthenticatedUser["role"],
      };
    } catch {
      return null;
    }
  }
}
