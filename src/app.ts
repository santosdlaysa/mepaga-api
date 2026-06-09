import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { prisma } from "./infrastructure/database/prismaClient";
import { UPLOADS_DIR, ensureUploadsDir } from "./shared/uploads";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository";
import { PrismaGroupRepository } from "./infrastructure/repositories/PrismaGroupRepository";
import { PrismaExpenseRepository } from "./infrastructure/repositories/PrismaExpenseRepository";
import { CreateGroup } from "./application/usecases/CreateGroup";
import { JoinGroup } from "./application/usecases/JoinGroup";
import { DeleteGroup } from "./application/usecases/DeleteGroup";
import { GetGroupByInvite } from "./application/usecases/GetGroupByInvite";
import { LinkAccount } from "./application/usecases/LinkAccount";
import { UpdatePixKey } from "./application/usecases/UpdatePixKey";
import { Register } from "./application/usecases/Register";
import { ForgotPassword } from "./application/usecases/ForgotPassword";
import { ResetPassword } from "./application/usecases/ResetPassword";
import { Login } from "./application/usecases/Login";
import { GetUserGroups } from "./application/usecases/GetUserGroups";
import { GetUserSummary } from "./application/usecases/GetUserSummary";
import { GetUserActivities } from "./application/usecases/GetUserActivities";
import { GetGroupActivities } from "./application/usecases/GetGroupActivities";
import { CreateExpense } from "./application/usecases/CreateExpense";
import { GetGroupBalances } from "./application/usecases/GetGroupBalances";
import { GroupController } from "./presentation/controllers/GroupController";
import { UserController } from "./presentation/controllers/UserController";
import { ExpenseController } from "./presentation/controllers/ExpenseController";
import { BalanceController } from "./presentation/controllers/BalanceController";
import { ActivityController } from "./presentation/controllers/ActivityController";
import { UploadController } from "./presentation/controllers/UploadController";
import { groupRoutes } from "./presentation/routes/groupRoutes";
import { userRoutes } from "./presentation/routes/userRoutes";
import { expenseRoutes } from "./presentation/routes/expenseRoutes";
import { balanceRoutes } from "./presentation/routes/balanceRoutes";
import { activityRoutes } from "./presentation/routes/activityRoutes";
import { uploadRoutes } from "./presentation/routes/uploadRoutes";
import { AppError } from "./shared/errors/AppError";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // Upload de comprovantes (multipart) + arquivos estáticos em /uploads
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  });
  ensureUploadsDir();
  await app.register(fastifyStatic, {
    root: UPLOADS_DIR,
    prefix: "/uploads/",
  });

  // Repositories
  const userRepo = new PrismaUserRepository(prisma);
  const groupRepo = new PrismaGroupRepository(prisma);
  const expenseRepo = new PrismaExpenseRepository(prisma);

  // Use Cases
  const createGroup = new CreateGroup(groupRepo, userRepo);
  const joinGroup = new JoinGroup(groupRepo, userRepo);
  const deleteGroup = new DeleteGroup(groupRepo);
  const getGroupByInvite = new GetGroupByInvite(groupRepo);
  const linkAccount = new LinkAccount(userRepo);
  const updatePixKey = new UpdatePixKey(userRepo);
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
        createdByUserId: m.group.createdByUserId,
        inviteToken: m.group.inviteToken,
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

  const getGroupActivities = new GetGroupActivities(
    groupRepo,
    async (groupId: number, userId?: number) => {
      const expenses = await prisma.expense.findMany({
        where: { groupId },
        include: {
          paidBy: true,
          group: true,
          splits: userId ? { where: { userId } } : true,
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
        const userOwes =
          userId && e.splits.length > 0 ? Number(e.splits[0].amountOwed) : 0;
        return {
          id: e.id,
          type: "expense" as const,
          description: e.description,
          amount: Number(e.amount),
          paidByName: e.paidBy.name,
          paidByInitials: initials,
          groupName: e.group.name,
          userOwes,
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
  const groupController = new GroupController(createGroup, joinGroup, deleteGroup, getGroupByInvite);
  const userController = new UserController(
    linkAccount, register, forgotPassword, resetPassword,
    login, getUserGroups, getUserSummary, getUserActivities, updatePixKey
  );
  const expenseController = new ExpenseController(createExpense);
  const balanceController = new BalanceController(getGroupBalances);
  const activityController = new ActivityController(getGroupActivities);
  const uploadController = new UploadController();

  // Routes
  app.register(groupRoutes(groupController), { prefix: "/api/groups" });
  app.register(userRoutes(userController), { prefix: "/api/users" });
  app.register(expenseRoutes(expenseController), { prefix: "/api/groups" });
  app.register(balanceRoutes(balanceController), { prefix: "/api/groups" });
  app.register(activityRoutes(activityController), { prefix: "/api/groups" });
  app.register(uploadRoutes(uploadController), { prefix: "/api/uploads" });

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
