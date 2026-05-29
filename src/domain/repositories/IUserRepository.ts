import { User, CreateUserInput } from "../entities/User";

export interface IUserRepository {
  create(input: CreateUserInput): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateEmail(userId: number, email: string): Promise<User>;
  setResetCode(userId: number, code: string, expiresAt: Date): Promise<User>;
  clearResetCode(userId: number): Promise<User>;
  updatePassword(userId: number, passwordHash: string): Promise<User>;
}
