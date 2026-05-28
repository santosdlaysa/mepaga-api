import { FastifyRequest, FastifyReply } from "fastify";
import { CreateGroup } from "../../application/usecases/CreateGroup";
import { JoinGroup } from "../../application/usecases/JoinGroup";

export class GroupController {
  constructor(
    private readonly createGroup: CreateGroup,
    private readonly joinGroup: JoinGroup
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, category, creator_name } = request.body as {
      name: string;
      category: string;
      creator_name: string;
    };

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const result = await this.createGroup.execute({
      name,
      category,
      creatorName: creator_name,
    });

    return reply.status(201).send({
      group: {
        id: result.group.id,
        name: result.group.name,
        category: result.group.category,
        invite_url: `${appUrl}/invite/${result.group.inviteToken}`,
      },
      creator: {
        id: result.creator.id,
        name: result.creator.name,
        is_temporary: result.creator.email === null,
      },
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
      userId: user_id ?? undefined,
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
}
