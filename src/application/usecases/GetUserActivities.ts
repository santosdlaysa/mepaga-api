import { AppError } from "../../shared/errors/AppError";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export interface Activity {
  id: number;
  type: "expense";
  description: string;
  amount: number;
  paidByName: string;
  paidByInitials: string;
  groupName: string;
  userOwes: number;
  createdAt: string;
}

export class GetUserActivities {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly fetchActivities: (userId: number) => Promise<Activity[]>
  ) {}

  async execute(userId: number): Promise<Activity[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }
    return this.fetchActivities(userId);
  }
}
