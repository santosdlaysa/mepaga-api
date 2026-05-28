import { CreateExpenseInput } from "../entities/Expense";

export interface ExpenseWithSplits {
  id: string;
  groupId: string;
  paidByUserId: string;
  amount: number;
  description: string;
  receiptUrl: string | null;
  createdAt: Date;
  splits: {
    userId: string;
    amountOwed: number;
  }[];
}

export interface IExpenseRepository {
  create(input: CreateExpenseInput): Promise<ExpenseWithSplits>;
  findByGroupId(groupId: string): Promise<ExpenseWithSplits[]>;
}
