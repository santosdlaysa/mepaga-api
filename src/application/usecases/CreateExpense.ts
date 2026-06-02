import { IExpenseRepository, ExpenseWithSplits } from "../../domain/repositories/IExpenseRepository";
import { IGroupRepository } from "../../domain/repositories/IGroupRepository";
import { CreateExpenseInput } from "../../domain/entities/Expense";
import { AppError } from "../../shared/errors/AppError";

interface Input {
  groupId: number;
  paidBy: number;
  amount: number;
  description: string;
  receiptUrl?: string;
  date?: Date;
  splits: { userId: number; amountOwed: number }[];
}

export class CreateExpense {
  constructor(
    private readonly expenseRepo: IExpenseRepository,
    private readonly groupRepo: IGroupRepository
  ) {}

  async execute(input: Input): Promise<ExpenseWithSplits> {
    const group = await this.groupRepo.findById(input.groupId);
    if (!group) {
      throw new AppError("Grupo não encontrado", 404);
    }

    const splitsTotal = input.splits.reduce((sum, s) => sum + s.amountOwed, 0);
    const diff = Math.abs(splitsTotal - input.amount);
    if (diff > 0.01) {
      throw new AppError(
        `Soma das divisões (${splitsTotal}) difere do valor total (${input.amount})`,
        422
      );
    }

    const expenseInput: CreateExpenseInput = {
      groupId: input.groupId,
      paidByUserId: input.paidBy,
      amount: input.amount,
      description: input.description,
      receiptUrl: input.receiptUrl,
      createdAt: input.date,
      splits: input.splits.map((s) => ({
        userId: s.userId,
        amountOwed: s.amountOwed,
      })),
    };

    return this.expenseRepo.create(expenseInput);
  }
}
