export interface IndividualBalance {
  userId: number;
  name: string;
  netBalance: number;
}

export interface SimplifiedDebt {
  from: { id: number; name: string };
  to: { id: number; name: string; pixKey: string | null };
  amount: number;
}

export interface GroupBalances {
  groupId: number;
  whoPayNext: number | null;
  individualBalances: IndividualBalance[];
  simplifiedDebts: SimplifiedDebt[];
}
