import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import routes from "./routes";
import { logger } from "./middleware/logger";
import { serverError } from "./utils/response";

const app = express();
app.use(cors());
app.use(logger);
app.use(express.json({ limit: "5mb" }));
app.use("/api", routes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Unhandled Error]", err);
  serverError(res, err);
});

export default app;
