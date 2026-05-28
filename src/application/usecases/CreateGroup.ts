import { v4 as uuidv4 } from "uuid";
import { IGroupRepository } from "../../domain/repositories/IGroupRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Group } from "../../domain/entities/Group";
import { User } from "../../domain/entities/User";

interface Input {
  name: string;
  category: string;
  creatorName: string;
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

    const creator = await this.userRepo.create({ name: input.creatorName });

    const group = await this.groupRepo.create({
      name: input.name,
      category: input.category,
      inviteToken,
    });

    await this.groupRepo.addMember(group.id, creator.id);

    return { group, creator };
  }
}
