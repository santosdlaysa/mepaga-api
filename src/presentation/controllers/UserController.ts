import { FastifyRequest, FastifyReply } from "fastify";
import { LinkAccount } from "../../application/usecases/LinkAccount";

export class UserController {
  constructor(private readonly linkAccount: LinkAccount) {}

  async link(request: FastifyRequest, reply: FastifyReply) {
    const { user_id, email } = request.body as {
      user_id: string;
      email: string;
    };

    const user = await this.linkAccount.execute({ userId: user_id, email });

    return reply.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      is_temporary: false,
    });
  }
}
