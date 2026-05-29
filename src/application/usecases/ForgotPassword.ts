import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { AppError } from "../../shared/errors/AppError";

interface Input {
  email: string;
}

interface Output {
  message: string;
}

export class ForgotPassword {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: Input): Promise<Output> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError("E-mail nao encontrado", 404);
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await this.userRepo.setResetCode(user.id, code, expiresAt);

    // TODO: enviar email com o codigo
    console.log(`[RESET CODE] ${input.email}: ${code}`);

    return { message: "Codigo enviado para o e-mail" };
  }
}
