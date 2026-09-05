import client from "../lib/gowaClient";

export const getMyGroups = async (deviceId: string) => {
  try {
    const r = await client.get("/user/my/groups", {
      params: { device_id: deviceId },
      headers: { "X-Device-Id": deviceId }
    });
    return r.data;
  } catch (e: any) {
    console.warn(`[Groups Service] Error fetching groups for device ${deviceId}:`, e.message);
    return { status: false, data: { results: [] } };
  }
};

export const getMyContacts = async (deviceId: string) => {
  try {
    const r = await client.get("/user/my/contacts", {
      params: { device_id: deviceId },
      headers: { "X-Device-Id": deviceId }
    });
    return r.data;
  } catch (e: any) {
    console.warn(`[Groups Service] Error fetching contacts for device ${deviceId}:`, e.message);
    return { status: false, data: { results: [] } };
  }
};

export const getGroupInfo = async (deviceId: string, groupId: string) => {
  const r = await client.get(`/group/${groupId}`, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const getGroupParticipants = async (deviceId: string, groupId: string) => {
  const r = await client.get(`/group/${groupId}/participants`, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const createGroup = async (deviceId: string, data: { name: string; participants: string[] }) => {
  const r = await client.post("/group", data, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const addGroupParticipants = async (deviceId: string, groupId: string, participants: string[]) => {
  const r = await client.post(`/group/${groupId}/participants`, { participants }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const removeGroupParticipants = async (deviceId: string, groupId: string, participants: string[]) => {
  const r = await client.delete(`/group/${groupId}/participants`, { 
    data: { participants },
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const promoteParticipants = async (deviceId: string, groupId: string, participants: string[]) => {
  const r = await client.post(`/group/${groupId}/admin/promote`, { participants }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const demoteParticipants = async (deviceId: string, groupId: string, participants: string[]) => {
  const r = await client.post(`/group/${groupId}/admin/demote`, { participants }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const updateGroupSubject = async (deviceId: string, groupId: string, subject: string) => {
  const r = await client.put(`/group/${groupId}/subject`, { subject }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const updateGroupDescription = async (deviceId: string, groupId: string, description: string) => {
  const r = await client.put(`/group/${groupId}/description`, { description }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const getGroupInviteLink = async (deviceId: string, groupId: string) => {
  const r = await client.get(`/group/${groupId}/invite-link`, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const revokeGroupInviteLink = async (deviceId: string, groupId: string) => {
  const r = await client.post(`/group/${groupId}/invite-link/revoke`, {}, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const leaveGroup = async (deviceId: string, groupId: string) => {
  const r = await client.post(`/group/${groupId}/leave`, {}, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const joinGroupWithLink = async (deviceId: string, link: string) => {
  const r = await client.post("/group/join-with-link", { link }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const getGroupInfoFromLink = async (deviceId: string, link: string) => {
  const r = await client.get("/group/info-from-link", {
    params: { device_id: deviceId, link },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const exportGroupParticipants = async (deviceId: string, groupId: string) => {
  const r = await client.get(`/group/${groupId}/participants/export`, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const getParticipantRequests = async (deviceId: string, groupId: string) => {
  const r = await client.get(`/group/${groupId}/participant-requests`, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const approveParticipantRequest = async (deviceId: string, groupId: string, participants: string[]) => {
  const r = await client.post(`/group/${groupId}/participant-requests/approve`, { participants }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const rejectParticipantRequest = async (deviceId: string, groupId: string, participants: string[]) => {
  const r = await client.post(`/group/${groupId}/participant-requests/reject`, { participants }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const setGroupPhoto = async (deviceId: string, groupId: string, image: string) => {
  const r = await client.post(`/group/${groupId}/photo`, { image }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const setGroupLocked = async (deviceId: string, groupId: string, locked: boolean) => {
  const r = await client.post(`/group/${groupId}/locked`, { locked }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const setGroupAnnounce = async (deviceId: string, groupId: string, announce: boolean) => {
  const r = await client.post(`/group/${groupId}/announce`, { announce }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};
