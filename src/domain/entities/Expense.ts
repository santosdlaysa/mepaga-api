export interface Expense {
  id: number;
  groupId: number;
  paidByUserId: number;
  amount: number;
  description: string;
  receiptUrl: string | null;
  createdAt: Date;
}

export interface SplitInput {
  userId: number;
  amountOwed: number;
}

export interface CreateExpenseInput {
  groupId: number;
  paidByUserId: number;
  amount: number;
  description: string;
  receiptUrl?: string;
  splits: SplitInput[];
}
