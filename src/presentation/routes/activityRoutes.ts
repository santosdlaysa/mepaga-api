import { FastifyInstance } from "fastify";
import { ActivityController } from "../controllers/ActivityController";

export function activityRoutes(controller: ActivityController) {
  return async (app: FastifyInstance) => {
    app.get("/:group_id/activities", (req, reply) => controller.list(req, reply));
  };
}
