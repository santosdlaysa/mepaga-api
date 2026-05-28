export interface Expense {
  id: string;
  groupId: string;
  paidByUserId: string;
  amount: number;
  description: string;
  receiptUrl: string | null;
  createdAt: Date;
}

export interface SplitInput {
  userId: string;
  amountOwed: number;
}

export interface CreateExpenseInput {
  groupId: string;
  paidByUserId: string;
  amount: number;
  description: string;
  receiptUrl?: string;
  splits: SplitInput[];
}
