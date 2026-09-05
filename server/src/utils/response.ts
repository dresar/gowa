import { Response } from "express";

export const ok = (res: Response, data: unknown) => res.json(data);
export const created = (res: Response, data: unknown) => res.status(201).json(data);
export const noContent = (res: Response) => res.status(204).end();
export const badRequest = (res: Response, error: string) => res.status(400).json({ error });
export const unauthorized = (res: Response) => res.status(401).json({ error: "unauthorized" });
export const notFound = (res: Response) => res.status(404).json({ error: "not_found" });
export const serverError = (res: Response, error: any) => {
  const message = error?.message || (typeof error === 'string' ? error : "internal_server_error");
  console.error(`[Server Error] ${new Date().toISOString()}:`, error);
  res.status(500).json({ error: message });
};

