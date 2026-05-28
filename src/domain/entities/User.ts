export interface User {
  id: string;
  name: string;
  email: string | null;
  pixKey: string | null;
  createdAt: Date;
}

export interface CreateUserInput {
  name: string;
  email?: string;
}
