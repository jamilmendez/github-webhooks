import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { envs } from "../../config";

const verify_signature = (req: Request) => {
  try {
    const signature = crypto
      .createHmac("sha256", envs.SECRET_TOKEN)
      .update(JSON.stringify(req.body))
      .digest("hex");

    const xHubSignature = req.header("x-hub-signature-256") ?? "";

    const trusted = Buffer.from(`sha256=${signature}`, "ascii");
    const untrusted = Buffer.from(xHubSignature, "ascii");

    return crypto.timingSafeEqual(trusted, untrusted);
  } catch (error) {
    return false;
  }
};

export class GithubSha256Middleware {
  static verifySignature(req: Request, res: Response, next: NextFunction) {
    if (!verify_signature(req)) {
      res.status(401).send("Unauthorized");
    }

    next();
  }
}
