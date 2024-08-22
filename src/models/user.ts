export type UserRole = "standard" | "administrator";

export interface User {
  username: string;
  name: string;
  age: number;
  role: UserRole;
}
