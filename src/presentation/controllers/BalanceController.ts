import { FastifyRequest, FastifyReply } from "fastify";
import { GetGroupBalances } from "../../application/usecases/GetGroupBalances";

export class BalanceController {
  constructor(private readonly getGroupBalances: GetGroupBalances) {}

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { group_id } = request.params as { group_id: string };

    const balances = await this.getGroupBalances.execute(Number(group_id));

    return reply.status(200).send({
      group_id: balances.groupId,
      total: balances.total,
      who_pays_next: balances.whoPayNext,
      individual_balances: balances.individualBalances.map((b) => ({
        user_id: b.userId,
        name: b.name,
        net_balance: b.netBalance,
      })),
      simplified_debts: balances.simplifiedDebts.map((d) => ({
        from: { id: d.from.id, name: d.from.name },
        to: { id: d.to.id, name: d.to.name, pix_key: d.to.pixKey },
        amount: d.amount,
      })),
    });
  }
}
