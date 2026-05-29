import bcrypt from "bcrypt";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { AppError } from "../../shared/errors/AppError";

interface Input {
  email: string;
  code: string;
  newPassword: string;
}

export class ResetPassword {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: Input): Promise<void> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError("E-mail nao encontrado", 404);
    }

    if (!user.resetCode || !user.resetCodeExpiresAt) {
      throw new AppError("Nenhum codigo de recuperacao solicitado", 400);
    }

    if (user.resetCode !== input.code) {
      throw new AppError("Codigo invalido", 400);
    }

    if (new Date() > user.resetCodeExpiresAt) {
      throw new AppError("Codigo expirado", 400);
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    await this.userRepo.updatePassword(user.id, hashedPassword);
  }
}
