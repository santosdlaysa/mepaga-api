import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./infrastructure/database/prismaClient";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository";
import { PrismaGroupRepository } from "./infrastructure/repositories/PrismaGroupRepository";
import { PrismaExpenseRepository } from "./infrastructure/repositories/PrismaExpenseRepository";
import { CreateGroup } from "./application/usecases/CreateGroup";
import { JoinGroup } from "./application/usecases/JoinGroup";
import { LinkAccount } from "./application/usecases/LinkAccount";
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
  const createExpense = new CreateExpense(expenseRepo, groupRepo);

  const getGroupBalances = new GetGroupBalances(
    expenseRepo,
    groupRepo,
    async (groupId: string) => {
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
  const userController = new UserController(linkAccount);
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
