export interface IndividualBalance {
  userId: string;
  name: string;
  netBalance: number;
}

export interface SimplifiedDebt {
  from: { id: string; name: string };
  to: { id: string; name: string; pixKey: string | null };
  amount: number;
}

export interface GroupBalances {
  groupId: string;
  whoPayNext: string | null;
  individualBalances: IndividualBalance[];
  simplifiedDebts: SimplifiedDebt[];
}
