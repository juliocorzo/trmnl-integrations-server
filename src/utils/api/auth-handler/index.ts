import type { NextApiRequest } from "next";
import { ApiError } from "next/dist/server/api-utils";

// TODO: Figure out how to make this usable by multiple users
const { TOKEN } = process.env;

const authHandler = async (req: NextApiRequest) => {
  const token = req.headers.authorization?.split(" ")[1];
  const isAuthenticated = token === TOKEN;
  if (!isAuthenticated) {
    throw new ApiError(401, "Unauthorized");
  }
};

export { authHandler };