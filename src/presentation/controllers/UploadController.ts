import { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "crypto";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import { UPLOADS_DIR } from "../../shared/uploads";
import { AppError } from "../../shared/errors/AppError";

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".pdf"]);

export class UploadController {
  async upload(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    if (!data) {
      throw new AppError("Nenhum arquivo enviado", 400);
    }

    let ext = path.extname(data.filename || "").toLowerCase();
    if (!ext) {
      ext = data.mimetype === "application/pdf" ? ".pdf" : ".jpg";
    }
    if (!ALLOWED.has(ext)) {
      throw new AppError("Tipo de arquivo não suportado", 415);
    }

    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    await pipeline(data.file, createWriteStream(filepath));

    if (data.file.truncated) {
      throw new AppError("Arquivo excede o tamanho máximo permitido", 413);
    }

    const relativeUrl = `/uploads/${filename}`;
    const base = process.env.APP_URL ?? "";
    return reply.status(201).send({
      url: relativeUrl,
      absolute_url: `${base}${relativeUrl}`,
    });
  }
}
