import { Types } from "mongoose";
import {
  UserModel,
  type UserDocument,
} from "../../../../../shared/persistence/UserModel.ts";
import { User } from "../../../domain/User.ts";
import type { UserRepository } from "../../../application/ports/UserRepository.ts";

export class MongoUsersUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await UserModel.findById(id).lean<UserDocument>().exec();
    if (!doc) {
      return null;
    }

    const user = new User({
      id: doc._id.toHexString(),
      email: doc.email,
      name: doc.name,
      active: doc.active,
      created: doc.created,
      modified: doc.modified,
      modifiedBy: doc.modified_by ? doc.modified_by.toHexString() : null,
    });

    return user;
  }

  async guardar(user: User): Promise<void> {
    await UserModel.updateOne(
      { _id: new Types.ObjectId(user.id) },
      {
        $set: {
          active: user.active,
          modified: user.modified,
          modified_by: user.modifiedBy
            ? new Types.ObjectId(user.modifiedBy)
            : null,
        },
      },
    ).exec();
  }
}
