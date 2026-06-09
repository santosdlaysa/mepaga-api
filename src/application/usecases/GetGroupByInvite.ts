import { IGroupRepository } from "../../domain/repositories/IGroupRepository";
import { AppError } from "../../shared/errors/AppError";

interface Input {
  inviteToken: string;
}

interface Output {
  id: number;
  name: string;
  category: string;
  memberCount: number;
  createdByUserId: number | null;
}

// Devolve um resumo do grupo a partir do token de convite, para que a tela de
// "Entrar no grupo" mostre os dados antes do usuario confirmar a entrada.
export class GetGroupByInvite {
  constructor(private readonly groupRepo: IGroupRepository) {}

  async execute(input: Input): Promise<Output> {
    const group = await this.groupRepo.findByInviteToken(input.inviteToken);
    if (!group) {
      throw new AppError("Convite inválido", 404);
    }

    const memberCount = await this.groupRepo.countMembers(group.id);

    return {
      id: group.id,
      name: group.name,
      category: group.category,
      memberCount,
      createdByUserId: group.createdByUserId,
    };
  }
}
