import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { myGroupsHandler, myContactsHandler, groupInfoHandler, groupParticipantsHandler, createGroupHandler, addGroupParticipantsHandler, removeGroupParticipantsHandler, promoteParticipantsHandler, demoteParticipantsHandler, updateGroupSubjectHandler, updateGroupDescriptionHandler, getGroupInviteLinkHandler, revokeGroupInviteLinkHandler, leaveGroupHandler, joinGroupWithLinkHandler, getGroupInfoFromLinkHandler, exportGroupParticipantsHandler, getParticipantRequestsHandler, approveParticipantRequestHandler, rejectParticipantRequestHandler, setGroupPhotoHandler, setGroupLockedHandler, setGroupAnnounceHandler } from "../controllers/groupsController";

const router = Router();

router.get("/user/my/groups", requireAuth, myGroupsHandler);
router.get("/user/my/contacts", requireAuth, myContactsHandler);
router.get("/group/info-from-link", requireAuth, getGroupInfoFromLinkHandler);
router.post("/group/join-with-link", requireAuth, joinGroupWithLinkHandler);
router.get("/group/:groupId", requireAuth, groupInfoHandler);
router.get("/group/:groupId/participants", requireAuth, groupParticipantsHandler);
router.get("/group/:groupId/participants/export", requireAuth, exportGroupParticipantsHandler);
router.post("/group", requireAuth, createGroupHandler);
router.post("/group/:groupId/participants", requireAuth, addGroupParticipantsHandler);
router.delete("/group/:groupId/participants", requireAuth, removeGroupParticipantsHandler);
router.post("/group/:groupId/admin/promote", requireAuth, promoteParticipantsHandler);
router.post("/group/:groupId/admin/demote", requireAuth, demoteParticipantsHandler);
router.put("/group/:groupId/subject", requireAuth, updateGroupSubjectHandler);
router.put("/group/:groupId/description", requireAuth, updateGroupDescriptionHandler);
router.get("/group/:groupId/invite-link", requireAuth, getGroupInviteLinkHandler);
router.post("/group/:groupId/invite-link/revoke", requireAuth, revokeGroupInviteLinkHandler);
router.post("/group/:groupId/leave", requireAuth, leaveGroupHandler);
router.get("/group/:groupId/participant-requests", requireAuth, getParticipantRequestsHandler);
router.post("/group/:groupId/participant-requests/approve", requireAuth, approveParticipantRequestHandler);
router.post("/group/:groupId/participant-requests/reject", requireAuth, rejectParticipantRequestHandler);
router.post("/group/:groupId/photo", requireAuth, setGroupPhotoHandler);
router.post("/group/:groupId/locked", requireAuth, setGroupLockedHandler);
router.post("/group/:groupId/announce", requireAuth, setGroupAnnounceHandler);

export default router;

