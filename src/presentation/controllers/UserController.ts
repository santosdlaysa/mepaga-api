import { FastifyRequest, FastifyReply } from "fastify";
import { LinkAccount } from "../../application/usecases/LinkAccount";
import { Register } from "../../application/usecases/Register";
import { ForgotPassword } from "../../application/usecases/ForgotPassword";
import { ResetPassword } from "../../application/usecases/ResetPassword";

export class UserController {
  constructor(
    private readonly linkAccount: LinkAccount,
    private readonly register: Register,
    private readonly forgotPassword: ForgotPassword,
    private readonly resetPassword: ResetPassword
  ) {}

  async link(request: FastifyRequest, reply: FastifyReply) {
    const { user_id, email } = request.body as {
      user_id: string;
      email: string;
    };

    const user = await this.linkAccount.execute({ userId: Number(user_id), email });

    return reply.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      is_temporary: false,
    });
  }

  async registerUser(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, password, pix_key } = request.body as {
      name: string;
      email: string;
      password: string;
      pix_key?: string;
    };

    const user = await this.register.execute({
      name,
      email,
      password,
      pixKey: pix_key,
    });

    return reply.status(201).send({
      id: user.id,
      name: user.name,
      email: user.email,
      pix_key: user.pixKey,
    });
  }

  async forgot(request: FastifyRequest, reply: FastifyReply) {
    const { email } = request.body as { email: string };
    const result = await this.forgotPassword.execute({ email });
    return reply.status(200).send(result);
  }

  async reset(request: FastifyRequest, reply: FastifyReply) {
    const { email, code, new_password } = request.body as {
      email: string;
      code: string;
      new_password: string;
    };
    await this.resetPassword.execute({
      email,
      code,
      newPassword: new_password,
    });
    return reply.status(200).send({ message: "Senha redefinida com sucesso" });
  }
}
