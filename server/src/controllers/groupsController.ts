import { Request, Response } from "express";
import { ok, badRequest, serverError } from "../utils/response";
import { getMyGroups, getMyContacts, getGroupInfo, getGroupParticipants, createGroup, addGroupParticipants, removeGroupParticipants, promoteParticipants, demoteParticipants, updateGroupSubject, updateGroupDescription, getGroupInviteLink, revokeGroupInviteLink, leaveGroup, joinGroupWithLink, getGroupInfoFromLink, exportGroupParticipants, getParticipantRequests, approveParticipantRequest, rejectParticipantRequest, setGroupPhoto, setGroupLocked, setGroupAnnounce } from "../services/groupsService";

export const myGroupsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const data = await getMyGroups(deviceId);
    ok(res, data);
  } catch (e: any) {
    console.error("[Groups Error]", e.response?.data || e.message);
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const myContactsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const data = await getMyContacts(deviceId);
    ok(res, data);
  } catch (e: any) {
    console.error("[Contacts Error]", e.response?.data || e.message);
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const groupInfoHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const data = await getGroupInfo(deviceId, groupId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const groupParticipantsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const data = await getGroupParticipants(deviceId, groupId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const createGroupHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { name, participants } = req.body || {};
    if (!name || !participants) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await createGroup(deviceId, { name, participants });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const addGroupParticipantsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { participants } = req.body || {};
    if (!participants) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await addGroupParticipants(deviceId, groupId, participants);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const removeGroupParticipantsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { participants } = req.body || {};
    if (!participants) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await removeGroupParticipants(deviceId, groupId, participants);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const promoteParticipantsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { participants } = req.body || {};
    if (!participants) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await promoteParticipants(deviceId, groupId, participants);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const demoteParticipantsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { participants } = req.body || {};
    if (!participants) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await demoteParticipants(deviceId, groupId, participants);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const updateGroupSubjectHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { subject } = req.body || {};
    if (!subject) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await updateGroupSubject(deviceId, groupId, subject);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const updateGroupDescriptionHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { description } = req.body || {};
    if (!description) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await updateGroupDescription(deviceId, groupId, description);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const getGroupInviteLinkHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const data = await getGroupInviteLink(deviceId, groupId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const revokeGroupInviteLinkHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const data = await revokeGroupInviteLink(deviceId, groupId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const leaveGroupHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const data = await leaveGroup(deviceId, groupId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const joinGroupWithLinkHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { link } = req.body || {};
    if (!link) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await joinGroupWithLink(deviceId, link);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const getGroupInfoFromLinkHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { link } = req.query;
    if (!link) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await getGroupInfoFromLink(deviceId, link as string);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const exportGroupParticipantsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const data = await exportGroupParticipants(deviceId, groupId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const getParticipantRequestsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const data = await getParticipantRequests(deviceId, groupId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const approveParticipantRequestHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { participants } = req.body || {};
    if (!participants) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await approveParticipantRequest(deviceId, groupId, participants);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const rejectParticipantRequestHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { participants } = req.body || {};
    if (!participants) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await rejectParticipantRequest(deviceId, groupId, participants);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const setGroupPhotoHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { image } = req.body || {};
    if (!image) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await setGroupPhoto(deviceId, groupId, image);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const setGroupLockedHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { locked } = req.body;
    const data = await setGroupLocked(deviceId, groupId, locked);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const setGroupAnnounceHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { groupId } = req.params;
    const { announce } = req.body;
    const data = await setGroupAnnounce(deviceId, groupId, announce);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

