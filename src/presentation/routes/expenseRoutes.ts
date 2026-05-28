import { FastifyInstance } from "fastify";
import { ExpenseController } from "../controllers/ExpenseController";

export function expenseRoutes(controller: ExpenseController) {
  return async (app: FastifyInstance) => {
    app.post("/:group_id/expenses", (req, reply) => controller.create(req, reply));
  };
}
