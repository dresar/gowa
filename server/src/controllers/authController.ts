import { Request, Response } from "express";
import { login, logout, getSession, setDevice } from "../services/authService";
import { ok, badRequest, noContent } from "../utils/response";

export const loginHandler = (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    badRequest(res, "missing_credentials");
    return;
    }
  const success = login(username, password);
  if (!success) {
    badRequest(res, "invalid_credentials");
    return;
  }
  ok(res, getSession());
};

export const logoutHandler = (req: Request, res: Response) => {
  logout();
  noContent(res);
};

export const sessionHandler = (req: Request, res: Response) => {
  ok(res, getSession());
};

export const setActiveDeviceHandler = (req: Request, res: Response) => {
  const { device_id } = req.body || {};
  if (!device_id) {
    badRequest(res, "missing_device_id");
    return;
  }
  const s = setDevice(device_id);
  ok(res, s);
};

