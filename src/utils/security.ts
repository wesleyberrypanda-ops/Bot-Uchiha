import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import logger from "./logger.js";

export function verifySignature(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.APP_SECRET;
  if (!secret) return next();

  const signature = (req.headers["x-hub-signature-256"] as string) || "";
  if (!signature) {
    logger.warn("Nenhuma assinatura encontrada no header");
    return res.sendStatus(401);
  }

  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const expected = `sha256=${hmac}`;

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      logger.warn("Assinatura inválida");
      return res.sendStatus(401);
    }
  } catch (e) {
    logger.warn("Erro na validação da assinatura");
    return res.sendStatus(401);
  }

  return next();
}

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  handler: (_req, res) => {
    res.status(429).json({ message: "Muitas requisições, tente novamente mais tarde." });
  }
});
