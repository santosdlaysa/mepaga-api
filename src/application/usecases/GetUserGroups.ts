import { AppError } from "../../shared/errors/AppError";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IGroupRepository } from "../../domain/repositories/IGroupRepository";

interface GroupSummary {
  id: number;
  name: string;
  category: string;
  memberCount: number;
  createdByUserId: number | null;
  inviteToken: string;
}

interface Output {
  groups: GroupSummary[];
  settledCount: number;
}

export class GetUserGroups {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly groupRepo: IGroupRepository,
    private readonly getUserGroupsFn: (userId: number) => Promise<GroupSummary[]>
  ) {}

  async execute(userId: number): Promise<Output> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    const groups = await this.getUserGroupsFn(userId);

    return {
      groups,
      settledCount: 0, // TODO: calcular grupos quitados
    };
  }
}
