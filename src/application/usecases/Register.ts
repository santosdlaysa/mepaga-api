import bcrypt from "bcrypt";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { AppError } from "../../shared/errors/AppError";

interface Input {
  name: string;
  email: string;
  password: string;
  pixKey?: string;
}

export class Register {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: Input): Promise<User> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError("E-mail já está em uso", 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    return this.userRepo.create({
      name: input.name,
      email: input.email,
      passwordHash: hashedPassword,
      pixKey: input.pixKey,
    });
  }
}
