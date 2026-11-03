import { Types } from "mongoose";
import { ConflictError } from "../../../../../shared/errors/ConflictError.ts";
import {
  UserModel,
  type UserDocument,
} from "../../../../../shared/persistence/UserModel.ts";
import { isDuplicateKeyError } from "../../../../../shared/persistence/isDuplicateKeyError.ts";
import { User } from "../../../domain/User.ts";
import type {
  AuthAccount,
  AuthUserRepository,
} from "../../../application/ports/AuthUserRepository.ts";

export class MongoAuthUserRepository implements AuthUserRepository {
  async findByEmail(email: string): Promise<AuthAccount | null> {
    const doc = await UserModel.findOne({ email }).lean<UserDocument>().exec();
    if (!doc) {
      return null;
    }

    return {
      user: new User({
        id: doc._id.toHexString(),
        email: doc.email,
        passwordHash: doc.password_hash,
        role: doc.role,
      }),
      active: doc.active,
    };
  }

  async guardar(user: User): Promise<void> {
    try {
      await UserModel.updateOne(
        { _id: new Types.ObjectId(user.id) },
        {
          $set: {
            email: user.email,
            password_hash: user.passwordHash,
            role: user.role,
          },
        },
      ).exec();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError("Ese email ya está registrado");
      }
      throw error;
    }
  }
}
