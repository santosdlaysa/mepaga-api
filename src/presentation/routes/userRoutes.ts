import { FastifyInstance } from "fastify";
import { UserController } from "../controllers/UserController";

export function userRoutes(controller: UserController) {
  return async (app: FastifyInstance) => {
    app.post("/register", (req, reply) => controller.registerUser(req, reply));
    app.post("/login", (req, reply) => controller.loginUser(req, reply));
    app.patch("/link-account", (req, reply) => controller.link(req, reply));
    app.patch("/:id/pix-key", (req, reply) => controller.updatePix(req, reply));
    app.post("/forgot-password", (req, reply) => controller.forgot(req, reply));
    app.post("/reset-password", (req, reply) => controller.reset(req, reply));
    app.get("/:id/groups", (req, reply) => controller.groups(req, reply));
    app.get("/:id/summary", (req, reply) => controller.summary(req, reply));
    app.get("/:id/activities", (req, reply) => controller.activities(req, reply));
  };
}
