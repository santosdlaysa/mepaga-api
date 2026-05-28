import { PrismaClient } from "../../generated/prisma/client";
import { IExpenseRepository, ExpenseWithSplits } from "../../domain/repositories/IExpenseRepository";
import { CreateExpenseInput } from "../../domain/entities/Expense";

export class PrismaExpenseRepository implements IExpenseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateExpenseInput): Promise<ExpenseWithSplits> {
    const expense = await this.prisma.expense.create({
      data: {
        groupId: input.groupId,
        paidByUserId: input.paidByUserId,
        amount: input.amount,
        description: input.description,
        receiptUrl: input.receiptUrl ?? null,
        splits: {
          create: input.splits.map((split) => ({
            userId: split.userId,
            amountOwed: split.amountOwed,
          })),
        },
      },
      include: { splits: true },
    });

    return {
      id: expense.id,
      groupId: expense.groupId,
      paidByUserId: expense.paidByUserId,
      amount: Number(expense.amount),
      description: expense.description,
      receiptUrl: expense.receiptUrl,
      createdAt: expense.createdAt,
      splits: expense.splits.map((s) => ({
        userId: s.userId,
        amountOwed: Number(s.amountOwed),
      })),
    };
  }

  async findByGroupId(groupId: string): Promise<ExpenseWithSplits[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { groupId },
      include: { splits: true },
    });

    return expenses.map((expense) => ({
      id: expense.id,
      groupId: expense.groupId,
      paidByUserId: expense.paidByUserId,
      amount: Number(expense.amount),
      description: expense.description,
      receiptUrl: expense.receiptUrl,
      createdAt: expense.createdAt,
      splits: expense.splits.map((s) => ({
        userId: s.userId,
        amountOwed: Number(s.amountOwed),
      })),
    }));
  }
}
