import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./infrastructure/database/prismaClient";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository";
import { PrismaGroupRepository } from "./infrastructure/repositories/PrismaGroupRepository";
import { PrismaExpenseRepository } from "./infrastructure/repositories/PrismaExpenseRepository";
import { CreateGroup } from "./application/usecases/CreateGroup";
import { JoinGroup } from "./application/usecases/JoinGroup";
import { LinkAccount } from "./application/usecases/LinkAccount";
import { Register } from "./application/usecases/Register";
import { ForgotPassword } from "./application/usecases/ForgotPassword";
import { ResetPassword } from "./application/usecases/ResetPassword";
import { Login } from "./application/usecases/Login";
import { GetUserGroups } from "./application/usecases/GetUserGroups";
import { GetUserSummary } from "./application/usecases/GetUserSummary";
import { GetUserActivities } from "./application/usecases/GetUserActivities";
import { CreateExpense } from "./application/usecases/CreateExpense";
import { GetGroupBalances } from "./application/usecases/GetGroupBalances";
import { GroupController } from "./presentation/controllers/GroupController";
import { UserController } from "./presentation/controllers/UserController";
import { ExpenseController } from "./presentation/controllers/ExpenseController";
import { BalanceController } from "./presentation/controllers/BalanceController";
import { groupRoutes } from "./presentation/routes/groupRoutes";
import { userRoutes } from "./presentation/routes/userRoutes";
import { expenseRoutes } from "./presentation/routes/expenseRoutes";
import { balanceRoutes } from "./presentation/routes/balanceRoutes";
import { AppError } from "./shared/errors/AppError";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  // Repositories
  const userRepo = new PrismaUserRepository(prisma);
  const groupRepo = new PrismaGroupRepository(prisma);
  const expenseRepo = new PrismaExpenseRepository(prisma);

  // Use Cases
  const createGroup = new CreateGroup(groupRepo, userRepo);
  const joinGroup = new JoinGroup(groupRepo, userRepo);
  const linkAccount = new LinkAccount(userRepo);
  const register = new Register(userRepo);
  const forgotPassword = new ForgotPassword(userRepo);
  const resetPassword = new ResetPassword(userRepo);
  const login = new Login(userRepo);

  const getUserGroups = new GetUserGroups(
    userRepo,
    groupRepo,
    async (userId: number) => {
      const members = await prisma.groupMember.findMany({
        where: { userId },
        include: {
          group: {
            include: { members: true },
          },
        },
      });
      return members.map((m) => ({
        id: m.group.id,
        name: m.group.name,
        category: m.group.category,
        memberCount: m.group.members.length,
      }));
    }
  );

  const getUserSummary = new GetUserSummary(
    userRepo,
    async (userId: number) => {
      const expenses = await prisma.expense.findMany({
        where: {
          group: { members: { some: { userId } } },
        },
        include: { splits: true },
      });
      let balance = 0;
      for (const exp of expenses) {
        if (exp.paidByUserId === userId) {
          balance += Number(exp.amount);
        }
        for (const split of exp.splits) {
          if (split.userId === userId) {
            balance -= Number(split.amountOwed);
          }
        }
      }
      return Math.round(balance * 100) / 100;
    }
  );

  const getUserActivities = new GetUserActivities(
    userRepo,
    async (userId: number) => {
      const expenses = await prisma.expense.findMany({
        where: {
          group: { members: { some: { userId } } },
        },
        include: {
          paidBy: true,
          group: true,
          splits: { where: { userId } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return expenses.map((e) => {
        const initials = e.paidBy.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return {
          id: e.id,
          type: "expense" as const,
          description: e.description,
          amount: Number(e.amount),
          paidByName: e.paidBy.name,
          paidByInitials: initials,
          groupName: e.group.name,
          userOwes: e.splits.length > 0 ? Number(e.splits[0].amountOwed) : 0,
          createdAt: e.createdAt.toISOString(),
        };
      });
    }
  );

  const createExpense = new CreateExpense(expenseRepo, groupRepo);

  const getGroupBalances = new GetGroupBalances(
    expenseRepo,
    groupRepo,
    async (groupId: number) => {
      const members = await prisma.groupMember.findMany({
        where: { groupId },
        include: { user: true },
      });
      return members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        pixKey: m.user.pixKey,
      }));
    }
  );

  // Controllers
  const groupController = new GroupController(createGroup, joinGroup);
  const userController = new UserController(
    linkAccount, register, forgotPassword, resetPassword,
    login, getUserGroups, getUserSummary, getUserActivities
  );
  const expenseController = new ExpenseController(createExpense);
  const balanceController = new BalanceController(getGroupBalances);

  // Routes
  app.register(groupRoutes(groupController), { prefix: "/api/groups" });
  app.register(userRoutes(userController), { prefix: "/api/users" });
  app.register(expenseRoutes(expenseController), { prefix: "/api/groups" });
  app.register(balanceRoutes(balanceController), { prefix: "/api/groups" });

  // Error handler
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    app.log.error(error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  });

  return app;
}
