import client from "../lib/gowaClient";
export const getMyGroups = async () => {
    const r = await client.get("/user/my/groups");
    return r.data;
};
export const getGroupInfo = async (groupId) => {
    const r = await client.get(`/group/${groupId}`);
    return r.data;
};
export const getGroupParticipants = async (groupId) => {
    const r = await client.get(`/group/${groupId}/participants`);
    return r.data;
};
export const createGroup = async (data) => {
    const r = await client.post("/group", data);
    return r.data;
};
export const addGroupParticipants = async (groupId, participants) => {
    const r = await client.post(`/group/${groupId}/participants`, { participants });
    return r.data;
};
export const removeGroupParticipants = async (groupId, participants) => {
    const r = await client.delete(`/group/${groupId}/participants`, { data: { participants } });
    return r.data;
};
export const promoteParticipants = async (groupId, participants) => {
    const r = await client.post(`/group/${groupId}/admin/promote`, { participants });
    return r.data;
};
export const demoteParticipants = async (groupId, participants) => {
    const r = await client.post(`/group/${groupId}/admin/demote`, { participants });
    return r.data;
};
export const updateGroupSubject = async (groupId, subject) => {
    const r = await client.put(`/group/${groupId}/subject`, { subject });
    return r.data;
};
export const updateGroupDescription = async (groupId, description) => {
    const r = await client.put(`/group/${groupId}/description`, { description });
    return r.data;
};
export const getGroupInviteLink = async (groupId) => {
    const r = await client.get(`/group/${groupId}/invite-link`);
    return r.data;
};
export const revokeGroupInviteLink = async (groupId) => {
    const r = await client.post(`/group/${groupId}/invite-link/revoke`);
    return r.data;
};
export const leaveGroup = async (groupId) => {
    const r = await client.post(`/group/${groupId}/leave`);
    return r.data;
};
