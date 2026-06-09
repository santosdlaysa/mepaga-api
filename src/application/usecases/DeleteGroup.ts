import { AppError } from "../../shared/errors/AppError";
import { IGroupRepository } from "../../domain/repositories/IGroupRepository";

interface Input {
  groupId: number;
  requesterId: number;
}

export class DeleteGroup {
  constructor(private readonly groupRepo: IGroupRepository) {}

  async execute(input: Input): Promise<void> {
    const group = await this.groupRepo.findById(input.groupId);
    if (!group) {
      throw new AppError("Grupo nao encontrado", 404);
    }

    // Apenas o criador (dono) do grupo pode excluí-lo.
    if (group.createdByUserId !== input.requesterId) {
      throw new AppError("Voce nao tem permissao para excluir este grupo", 403);
    }

    await this.groupRepo.delete(input.groupId);
  }
}
