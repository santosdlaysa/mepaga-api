import { IGroupRepository } from "../../domain/repositories/IGroupRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { AppError } from "../../shared/errors/AppError";

interface Input {
  inviteToken: string;
  name: string;
  userId?: string;
}

interface Output {
  groupId: string;
  user: User;
}

export class JoinGroup {
  constructor(
    private readonly groupRepo: IGroupRepository,
    private readonly userRepo: IUserRepository
  ) {}

  async execute(input: Input): Promise<Output> {
    const group = await this.groupRepo.findByInviteToken(input.inviteToken);
    if (!group) {
      throw new AppError("Convite inválido", 404);
    }

    let user: User;

    if (input.userId) {
      const existingUser = await this.userRepo.findById(input.userId);
      if (!existingUser) {
        throw new AppError("Usuário não encontrado", 404);
      }
      user = existingUser;
    } else {
      user = await this.userRepo.create({ name: input.name });
    }

    const alreadyMember = await this.groupRepo.isMember(group.id, user.id);
    if (alreadyMember) {
      throw new AppError("Usuário já é membro do grupo", 409);
    }

    await this.groupRepo.addMember(group.id, user.id);

    return { groupId: group.id, user };
  }
}
