import { FastifyRequest, FastifyReply } from "fastify";
import { CreateGroup } from "../../application/usecases/CreateGroup";
import { JoinGroup } from "../../application/usecases/JoinGroup";
import { DeleteGroup } from "../../application/usecases/DeleteGroup";
import { GetGroupByInvite } from "../../application/usecases/GetGroupByInvite";

export class GroupController {
  constructor(
    private readonly createGroup: CreateGroup,
    private readonly joinGroup: JoinGroup,
    private readonly deleteGroup: DeleteGroup,
    private readonly getGroupByInvite: GetGroupByInvite
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, category, creator_name, creator_id } = request.body as {
      name: string;
      category: string;
      creator_name?: string;
      creator_id?: number | string;
    };

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const result = await this.createGroup.execute({
      name,
      category,
      creatorName: creator_name,
      creatorId: creator_id !== undefined ? Number(creator_id) : undefined,
    });

    return reply.status(201).send({
      group: {
        id: result.group.id,
        name: result.group.name,
        category: result.group.category,
        invite_token: result.group.inviteToken,
        invite_url: `${appUrl}/invite/${result.group.inviteToken}`,
      },
      creator: {
        id: result.creator.id,
        name: result.creator.name,
        is_temporary: result.creator.email === null,
      },
    });
  }

  async getByInvite(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };

    const group = await this.getGroupByInvite.execute({ inviteToken: token });

    return reply.status(200).send({
      id: group.id,
      name: group.name,
      category: group.category,
      member_count: group.memberCount,
      created_by_user_id: group.createdByUserId,
    });
  }

  async join(request: FastifyRequest, reply: FastifyReply) {
    const { invite_token, name, user_id } = request.body as {
      invite_token: string;
      name: string;
      user_id?: string;
    };

    const result = await this.joinGroup.execute({
      inviteToken: invite_token,
      name,
      userId: user_id ? Number(user_id) : undefined,
    });

    return reply.status(200).send({
      group_id: result.groupId,
      user: {
        id: result.user.id,
        name: result.user.name,
        is_temporary: result.user.email === null,
      },
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { group_id } = request.params as { group_id: string };
    const { user_id } = request.query as { user_id?: string };

    if (!user_id) {
      return reply.status(400).send({ error: "user_id e obrigatorio" });
    }

    await this.deleteGroup.execute({
      groupId: Number(group_id),
      requesterId: Number(user_id),
    });

    return reply.status(204).send();
  }
}
