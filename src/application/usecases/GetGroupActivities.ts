import { AppError } from "../../shared/errors/AppError";
import { IGroupRepository } from "../../domain/repositories/IGroupRepository";
import { Activity } from "./GetUserActivities";

export class GetGroupActivities {
  constructor(
    private readonly groupRepo: IGroupRepository,
    private readonly fetchActivities: (
      groupId: number,
      userId?: number
    ) => Promise<Activity[]>
  ) {}

  async execute(groupId: number, userId?: number): Promise<Activity[]> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new AppError("Grupo não encontrado", 404);
    }
    return this.fetchActivities(groupId, userId);
  }
}
