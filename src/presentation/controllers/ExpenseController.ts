import { FastifyRequest, FastifyReply } from "fastify";
import { CreateExpense } from "../../application/usecases/CreateExpense";

export class ExpenseController {
  constructor(private readonly createExpense: CreateExpense) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { group_id } = request.params as { group_id: string };
    const { description, amount, paid_by, receipt_url, splits } = request.body as {
      description: string;
      amount: number;
      paid_by: string;
      receipt_url?: string;
      splits: { user_id: string; amount_owed: number }[];
    };

    const expense = await this.createExpense.execute({
      groupId: group_id,
      paidBy: paid_by,
      amount,
      description,
      receiptUrl: receipt_url,
      splits: splits.map((s) => ({
        userId: s.user_id,
        amountOwed: s.amount_owed,
      })),
    });

    return reply.status(201).send({
      id: expense.id,
      group_id: expense.groupId,
      paid_by: expense.paidByUserId,
      amount: expense.amount,
      description: expense.description,
      receipt_url: expense.receiptUrl,
      splits: expense.splits.map((s) => ({
        user_id: s.userId,
        amount_owed: s.amountOwed,
      })),
    });
  }
}
