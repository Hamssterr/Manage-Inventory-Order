export type UserRole = "owner" | "admin" | "salers" | "accountant";

export interface User {
  _id: string;
  phoneNumber?: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserInfo {
  _id: string;
  email: string;
  displayName: string;
}
