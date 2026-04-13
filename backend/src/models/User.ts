import mongoose, { Document, Schema, type Model } from "mongoose";

export type UserRole = "owner" | "admin" | "salers" | "accountant";

export interface IUser extends Document {
  phoneNumber: string;
  hashedPassword: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      trim: true,
      required: true,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "salers", "accountant"],
      default: "owner",
      required: true,
    },
  },
  { timestamps: true },
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
