import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const color = statusCode >= 500 ? "\x1b[31m" : statusCode >= 400 ? "\x1b[33m" : "\x1b[32m";
    const reset = "\x1b[0m";
    
    console.log(
      `${new Date().toISOString()} - ${ip} - ${method} ${url} ${color}${statusCode}${reset} - ${duration}ms`
    );
  });

  next();
};
