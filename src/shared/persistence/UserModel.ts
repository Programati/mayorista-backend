import { Schema, Types, model } from "mongoose";

export interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password_hash: string;
  role: "customer" | "admin";
  active: boolean;
  created: Date;
  modified: Date;
  modified_by: Types.ObjectId | null;
}

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    password_hash: { type: String },
    role: { type: String, enum: ["customer", "admin"] },
    active: { type: Boolean },
    created: { type: Date },
    modified: { type: Date },
    modified_by: { type: Schema.Types.ObjectId, default: null },
  },
  { collection: "users", versionKey: false, timestamps: false },
);

export const UserModel = model("User", userSchema);
