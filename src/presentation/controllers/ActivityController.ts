import { FastifyRequest, FastifyReply } from "fastify";
import { GetGroupActivities } from "../../application/usecases/GetGroupActivities";

export class ActivityController {
  constructor(private readonly getGroupActivities: GetGroupActivities) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { group_id } = request.params as { group_id: string };
    const { user_id } = request.query as { user_id?: string };

    const activities = await this.getGroupActivities.execute(
      Number(group_id),
      user_id ? Number(user_id) : undefined
    );

    return reply.status(200).send(activities);
  }
}
