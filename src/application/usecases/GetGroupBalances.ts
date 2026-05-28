import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";
import { IGroupRepository } from "../../domain/repositories/IGroupRepository";
import { GroupBalances, IndividualBalance, SimplifiedDebt } from "../../domain/entities/Balance";
import { AppError } from "../../shared/errors/AppError";

interface MemberInfo {
  id: string;
  name: string;
  pixKey: string | null;
}

export class GetGroupBalances {
  constructor(
    private readonly expenseRepo: IExpenseRepository,
    private readonly groupRepo: IGroupRepository,
    private readonly getMembersWithInfo: (groupId: string) => Promise<MemberInfo[]>
  ) {}

  async execute(groupId: string): Promise<GroupBalances> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new AppError("Grupo não encontrado", 404);
    }

    const expenses = await this.expenseRepo.findByGroupId(groupId);
    const members = await this.getMembersWithInfo(groupId);

    const memberMap = new Map(members.map((m) => [m.id, m]));
    const balanceMap = new Map<string, number>();

    for (const member of members) {
      balanceMap.set(member.id, 0);
    }

    for (const expense of expenses) {
      const currentPaid = balanceMap.get(expense.paidByUserId) ?? 0;
      balanceMap.set(expense.paidByUserId, currentPaid + expense.amount);

      for (const split of expense.splits) {
        const currentOwed = balanceMap.get(split.userId) ?? 0;
        balanceMap.set(split.userId, currentOwed - split.amountOwed);
      }
    }

    const individualBalances: IndividualBalance[] = [];
    for (const [userId, balance] of balanceMap) {
      const member = memberMap.get(userId);
      individualBalances.push({
        userId,
        name: member?.name ?? "Desconhecido",
        netBalance: Math.round(balance * 100) / 100,
      });
    }

    const simplifiedDebts = this.simplifyDebts(individualBalances, memberMap);

    const mostNegative = individualBalances.reduce<IndividualBalance | null>(
      (min, curr) => (!min || curr.netBalance < min.netBalance ? curr : min),
      null
    );

    return {
      groupId,
      whoPayNext: mostNegative && mostNegative.netBalance < 0 ? mostNegative.userId : null,
      individualBalances,
      simplifiedDebts,
    };
  }

  private simplifyDebts(
    balances: IndividualBalance[],
    memberMap: Map<string, MemberInfo>
  ): SimplifiedDebt[] {
    const debtors: { userId: string; amount: number }[] = [];
    const creditors: { userId: string; amount: number }[] = [];

    for (const b of balances) {
      if (b.netBalance < -0.01) {
        debtors.push({ userId: b.userId, amount: Math.abs(b.netBalance) });
      } else if (b.netBalance > 0.01) {
        creditors.push({ userId: b.userId, amount: b.netBalance });
      }
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debts: SimplifiedDebt[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const transfer = Math.min(debtors[i].amount, creditors[j].amount);
      const roundedTransfer = Math.round(transfer * 100) / 100;

      if (roundedTransfer > 0) {
        const fromMember = memberMap.get(debtors[i].userId);
        const toMember = memberMap.get(creditors[j].userId);

        debts.push({
          from: {
            id: debtors[i].userId,
            name: fromMember?.name ?? "Desconhecido",
          },
          to: {
            id: creditors[j].userId,
            name: toMember?.name ?? "Desconhecido",
            pixKey: toMember?.pixKey ?? null,
          },
          amount: roundedTransfer,
        });
      }

      debtors[i].amount -= transfer;
      creditors[j].amount -= transfer;

      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    return debts;
  }
}
