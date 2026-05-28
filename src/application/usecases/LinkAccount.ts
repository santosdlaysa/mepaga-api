import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { AppError } from "../../shared/errors/AppError";

interface Input {
  userId: string;
  email: string;
}

export class LinkAccount {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: Input): Promise<User> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (user.email) {
      throw new AppError("Usuário já possui uma conta vinculada", 409);
    }

    const existingEmail = await this.userRepo.findByEmail(input.email);
    if (existingEmail) {
      throw new AppError("E-mail já está em uso", 409);
    }

    return this.userRepo.updateEmail(input.userId, input.email);
  }
}
