export interface User {
  id: number;
  name: string;
  email: string | null;
  passwordHash: string | null;
  pixKey: string | null;
  resetCode: string | null;
  resetCodeExpiresAt: Date | null;
  createdAt: Date;
}

export interface CreateUserInput {
  name: string;
  email?: string;
  passwordHash?: string;
  pixKey?: string;
}
