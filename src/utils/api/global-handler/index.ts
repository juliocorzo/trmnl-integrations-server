import { ApiError } from "next/dist/server/api-utils";
import type { NextApiResponse, NextApiRequest } from "next";
import { authHandler } from "@/utils/api/auth-handler";

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export const globalHandler = (...handlers: Handler[]) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await authHandler(req);
      for (const handler of handlers) {
        await handler(req, res);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json(
           { message: error.message },
        );
      } else {
        console.log(error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ 
          message: `Internal API: ${message}`, 
        });
      }
    }
  };