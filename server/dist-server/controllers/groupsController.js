import { ok, badRequest, serverError } from "../utils/response";
import { getMyGroups, getGroupInfo, getGroupParticipants, createGroup, addGroupParticipants, removeGroupParticipants, promoteParticipants, demoteParticipants, updateGroupSubject, updateGroupDescription, getGroupInviteLink, revokeGroupInviteLink, leaveGroup } from "../services/groupsService";
export const myGroupsHandler = async (_, res) => {
    try {
        const data = await getMyGroups();
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const groupInfoHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const data = await getGroupInfo(groupId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const groupParticipantsHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const data = await getGroupParticipants(groupId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const createGroupHandler = async (req, res) => {
    try {
        const { name, participants } = req.body || {};
        if (!name || !participants) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await createGroup({ name, participants });
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const addGroupParticipantsHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { participants } = req.body || {};
        if (!participants) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await addGroupParticipants(groupId, participants);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const removeGroupParticipantsHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { participants } = req.body || {};
        if (!participants) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await removeGroupParticipants(groupId, participants);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const promoteParticipantsHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { participants } = req.body || {};
        if (!participants) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await promoteParticipants(groupId, participants);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const demoteParticipantsHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { participants } = req.body || {};
        if (!participants) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await demoteParticipants(groupId, participants);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const updateGroupSubjectHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { subject } = req.body || {};
        if (!subject) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await updateGroupSubject(groupId, subject);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const updateGroupDescriptionHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { description } = req.body || {};
        if (!description) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await updateGroupDescription(groupId, description);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const getGroupInviteLinkHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const data = await getGroupInviteLink(groupId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const revokeGroupInviteLinkHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const data = await revokeGroupInviteLink(groupId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const leaveGroupHandler = async (req, res) => {
    try {
        const { groupId } = req.params;
        const data = await leaveGroup(groupId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
