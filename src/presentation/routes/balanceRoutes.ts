import { FastifyInstance } from "fastify";
import { BalanceController } from "../controllers/BalanceController";

export function balanceRoutes(controller: BalanceController) {
  return async (app: FastifyInstance) => {
    app.get("/:group_id/balances", (req, reply) => controller.get(req, reply));
  };
}
