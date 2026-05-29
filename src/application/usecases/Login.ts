import bcrypt from "bcrypt";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { AppError } from "../../shared/errors/AppError";

interface Input {
  email: string;
  password: string;
}

export class Login {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: Input): Promise<User> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError("E-mail ou senha incorretos", 401);
    }

    if (!user.passwordHash) {
      throw new AppError("E-mail ou senha incorretos", 401);
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError("E-mail ou senha incorretos", 401);
    }

    return user;
  }
}
