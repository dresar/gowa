import { Request, Response } from "express";
import { getNewsletters, unfollowNewsletter } from "../services/newsletterService";
import { ok, serverError } from "../utils/response";

export const newslettersHandler = async (_: Request, res: Response) => {
  try {
    const data = await getNewsletters();
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const unfollowNewsletterHandler = async (req: Request, res: Response) => {
  try {
    const { newsletterId } = req.params;
    const data = await unfollowNewsletter(newsletterId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

