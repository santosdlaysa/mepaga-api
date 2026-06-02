import { FastifyInstance } from "fastify";
import { UploadController } from "../controllers/UploadController";

export function uploadRoutes(controller: UploadController) {
  return async (app: FastifyInstance) => {
    app.post("/", (req, reply) => controller.upload(req, reply));
  };
}
