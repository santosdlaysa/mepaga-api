import { CreateExpenseInput } from "../entities/Expense";

export interface ExpenseWithSplits {
  id: number;
  groupId: number;
  paidByUserId: number;
  amount: number;
  description: string;
  receiptUrl: string | null;
  createdAt: Date;
  splits: {
    userId: number;
    amountOwed: number;
  }[];
}

export interface IExpenseRepository {
  create(input: CreateExpenseInput): Promise<ExpenseWithSplits>;
  findByGroupId(groupId: number): Promise<ExpenseWithSplits[]>;
}
