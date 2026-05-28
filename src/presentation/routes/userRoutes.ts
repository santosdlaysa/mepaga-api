import { FastifyInstance } from "fastify";
import { UserController } from "../controllers/UserController";

export function userRoutes(controller: UserController) {
  return async (app: FastifyInstance) => {
    app.patch("/link-account", (req, reply) => controller.link(req, reply));
  };
}
