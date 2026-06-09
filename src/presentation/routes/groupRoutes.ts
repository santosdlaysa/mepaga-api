import { FastifyInstance } from "fastify";
import { GroupController } from "../controllers/GroupController";

export function groupRoutes(controller: GroupController) {
  return async (app: FastifyInstance) => {
    app.post("/", (req, reply) => controller.create(req, reply));
    app.get("/invite/:token", (req, reply) => controller.getByInvite(req, reply));
    app.post("/join", (req, reply) => controller.join(req, reply));
    app.delete("/:group_id", (req, reply) => controller.delete(req, reply));
  };
}
