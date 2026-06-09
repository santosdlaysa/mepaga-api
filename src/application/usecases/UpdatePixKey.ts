import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { AppError } from "../../shared/errors/AppError";

interface Input {
  userId: number;
  pixKey: string | null;
}

export class UpdatePixKey {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: Input): Promise<User> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const pixKey = input.pixKey?.trim() || null;

    return this.userRepo.updatePixKey(input.userId, pixKey);
  }
}
