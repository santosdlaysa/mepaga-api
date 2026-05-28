import { User, CreateUserInput } from "../entities/User";

export interface IUserRepository {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateEmail(userId: string, email: string): Promise<User>;
}
