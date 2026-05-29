import { AppError } from "../../shared/errors/AppError";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

interface Output {
  userId: number;
  name: string;
  totalBalance: number;
}

export class GetUserSummary {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly calcBalanceFn: (userId: number) => Promise<number>
  ) {}

  async execute(userId: number): Promise<Output> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    const totalBalance = await this.calcBalanceFn(userId);

    return {
      userId: user.id,
      name: user.name,
      totalBalance,
    };
  }
}
