import { getNewsletters, unfollowNewsletter } from "../services/newsletterService";
import { ok, serverError } from "../utils/response";
export const newslettersHandler = async (_, res) => {
    try {
        const data = await getNewsletters();
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const unfollowNewsletterHandler = async (req, res) => {
    try {
        const { newsletterId } = req.params;
        const data = await unfollowNewsletter(newsletterId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
