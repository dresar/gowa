export const ok = (res, data) => res.json(data);
export const created = (res, data) => res.status(201).json(data);
export const noContent = (res) => res.status(204).end();
export const badRequest = (res, error) => res.status(400).json({ error });
export const unauthorized = (res) => res.status(401).json({ error: "unauthorized" });
export const notFound = (res) => res.status(404).json({ error: "not_found" });
export const serverError = (res, error) => res.status(500).json({ error });
