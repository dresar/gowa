import { getStatus, getDevices } from "../services/statusService";
import { ok, serverError } from "../utils/response";
export const statusHandler = async (_, res) => {
    try {
        const data = await getStatus();
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const devicesHandler = async (_, res) => {
    try {
        const data = await getDevices();
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
