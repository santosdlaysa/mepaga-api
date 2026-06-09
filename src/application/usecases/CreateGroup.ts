import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../shared/errors/AppError";
import { IGroupRepository } from "../../domain/repositories/IGroupRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Group } from "../../domain/entities/Group";
import { User } from "../../domain/entities/User";

interface Input {
  name: string;
  category: string;
  creatorName?: string;
  creatorId?: number;
}

interface Output {
  group: Group;
  creator: User;
}

export class CreateGroup {
  constructor(
    private readonly groupRepo: IGroupRepository,
    private readonly userRepo: IUserRepository
  ) {}

  async execute(input: Input): Promise<Output> {
    const inviteToken = uuidv4().replace(/-/g, "").slice(0, 12);

    let creator: User;
    if (input.creatorId !== undefined) {
      const existing = await this.userRepo.findById(input.creatorId);
      if (!existing) {
        throw new AppError("Usuario nao encontrado", 404);
      }
      creator = existing;
    } else {
      if (!input.creatorName) {
        throw new AppError("Nome do criador e obrigatorio", 400);
      }
      creator = await this.userRepo.create({ name: input.creatorName });
    }

    const group = await this.groupRepo.create({
      name: input.name,
      category: input.category,
      inviteToken,
      createdByUserId: creator.id,
    });

    await this.groupRepo.addMember(group.id, creator.id);

    return { group, creator };
  }
}
