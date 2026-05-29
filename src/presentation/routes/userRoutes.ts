import { FastifyInstance } from "fastify";
import { UserController } from "../controllers/UserController";

export function userRoutes(controller: UserController) {
  return async (app: FastifyInstance) => {
    app.post("/register", (req, reply) => controller.registerUser(req, reply));
    app.patch("/link-account", (req, reply) => controller.link(req, reply));
    app.post("/forgot-password", (req, reply) => controller.forgot(req, reply));
    app.post("/reset-password", (req, reply) => controller.reset(req, reply));
  };
}
