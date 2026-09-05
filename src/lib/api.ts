import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:3006/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor for adding auth headers
api.interceptors.request.use(
  (config) => {
    // Only set application/json if not sending FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    const credentials = localStorage.getItem('gowa_credentials');
    const deviceId = localStorage.getItem('gowa_device_id');

    if (credentials) {
      const { username, password } = JSON.parse(credentials);
      const basicAuth = btoa(`${username}:${password}`);
      config.headers.Authorization = `Basic ${basicAuth}`;
    }

    if (deviceId && deviceId !== 'undefined' && deviceId !== 'null') {
      config.headers['X-Device-Id'] = deviceId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Variable to track the last toast time to prevent spamming
let lastToastTime = 0;
const TOAST_THROTTLE_MS = 3000; // 3 seconds

// Variable to track server health
let isServerOnline = true;
export const getServerOnlineStatus = () => isServerOnline;

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    isServerOnline = true; // Reset status on successful response
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';

    // Handle connection refused or network errors
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      isServerOnline = false;
    }

    const now = Date.now();
    const shouldShowToast = now - lastToastTime > TOAST_THROTTLE_MS;

    if (!isServerOnline) {
      if (shouldShowToast) {
        toast({
          title: "Koneksi Terputus",
          description: "Tidak dapat terhubung ke server GoWA. Pastikan backend berjalan.",
          variant: "destructive",
        });
        lastToastTime = now;
      }
      return Promise.reject(error);
    }

    // SILENCE notifications for common expected errors during device deletion or clean state
    const isExpectedError = 
      (status === 404 && (errorMessage.includes('not found') || errorMessage.includes('no device'))) ||
      (status === 400 && errorMessage.includes('missing device id'));

    if (isExpectedError) {
      console.log(`[API] Suppressed expected error: ${errorMessage}`);
      return Promise.reject(error);
    }

    if (status === 401) {
      localStorage.removeItem('gowa_credentials');
      if (shouldShowToast) {
        toast({
          title: "Sesi Berakhir",
          description: "Silakan login kembali.",
          variant: "destructive",
        });
        lastToastTime = now;
      }
      window.location.reload();
    } else if (status >= 500) {
      if (shouldShowToast) {
        toast({
          title: "Server Error",
          description: errorMessage,
          variant: "destructive",
        });
        lastToastTime = now;
      }
    } else if (status >= 400) {
      if (shouldShowToast) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        lastToastTime = now;
      }
    }

    return Promise.reject(error);
  }
);

// Auth & Status
export const checkServerStatus = () => api.get('/app/status');
export const getDevices = () => api.get('/app/devices');

/**
 * Global helper to check if a device is in a connected/active state
 * Handles various status strings from different GoWA versions
 */
export const isDeviceConnected = (device: any): boolean => {
  if (!device) return false;
  
  // Normalized status/state strings
  const status = (device.status || device.state || '').toUpperCase();
  const isConnected = (
    status === 'CONNECTED' || 
    status === 'AUTHENTICATED' || 
    status === 'LOGGED_IN' || 
    status === 'READY' ||
    device.connected === true
  );
  
  return isConnected;
};
export const getWebhookEvents = () => api.get('/admin/webhook-events');
export const clearWebhookEvents = () => api.delete('/admin/webhook-events');

// Auto Reply
export const getAutoReplies = (device_id?: string) => api.get('/admin/auto-reply', { params: { device_id } });
export const addAutoReply = (data: { contains: string; reply: string; device_id?: string }) => api.post('/admin/auto-reply', data);
export const deleteAutoReply = (id: string, device_id?: string) => api.delete(`/admin/auto-reply/${id}`, { params: { device_id } });
export const getAutoReplySettings = () => api.get('/admin/auto-reply/settings');
export const updateAutoReplySettings = (data: { 
  globalEnabled?: boolean; 
  disabledDevices?: string[]; 
  disabledNumbers?: string[] 
}) => api.post('/admin/auto-reply/settings', data);

export const getConnectionSettings = () => api.get('/settings/connection');
export const updateConnectionSettings = (data: { base_url: string; username: string; password: string; device_id?: string }) =>
  api.post('/settings/connection', data);

// Device Management
export const getAllDevices = () => api.get('/devices');
export const getLocalDevices = () => api.get('/devices/local');
export const saveLocalDevice = (data: any) => api.post('/devices/local', data);
export const deleteLocalDevice = (id: string) => api.delete(`/devices/local/${id}`);
export const detectActiveDevice = () => api.get('/devices/detect');
export const getDeviceInfo = (deviceId: string) => api.get(`/devices/${deviceId}`);

// Broadcast
export const importBroadcastContacts = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/broadcast/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const scheduleBroadcast = (data: any) => api.post('/broadcast/schedule', data);
export const getBroadcastSchedules = () => api.get('/broadcast/schedules');
export const getBroadcastLogs = () => api.get('/broadcast/logs');
export const runBroadcastManual = (device_id: string) => api.post('/broadcast/run', { device_id });

export const createDevice = (deviceId: string) => 
  api.post('/devices', { device_id: deviceId });

export const deleteDevice = (deviceId: string) => 
  api.delete(`/devices/${deviceId}`);

export const loginDevice = (deviceId: string) => 
  api.get(`/devices/${deviceId}/login`);

export const loginDeviceWithCode = (deviceId: string, phone: string) => 
  api.post(`/devices/${deviceId}/login/code`, { phone });

export const logoutDevice = (deviceId: string) => 
  api.post(`/devices/${deviceId}/logout`);

export const reconnectDevice = (deviceId: string) => 
  api.post(`/devices/${deviceId}/reconnect`);

// Default login (multi-device friendly)
export const loginDefaultApp = () => api.get('/app/login');
export const loginDefaultWithCode = () => api.get('/app/login-with-code');
export const logoutDefaultApp = () => api.get('/app/logout');
export const reconnectDefaultApp = () => api.get('/app/reconnect');

// User Profile
export const getMyInfo = () => api.get('/user/info');
export const getMyAvatar = () => api.get('/user/avatar');
export const updateMyAvatar = (avatar: string) => api.post('/user/avatar', { avatar });
export const updateMyPushName = (pushname: string) => api.post('/user/pushname', { pushname });
export const getMyNewsletters = (device_id?: string) => api.get('/user/my/newsletters', { params: { device_id } });
export const getPrivacySettings = () => api.get('/user/my/privacy');

// Messages
export const sendTextMessage = (data: {
  phone: string;
  message: string;
  reply_message_id?: string;
  mentions?: string[];
  mention_everyone?: boolean;
  device_id?: string;
}) => api.post('/send/message', data);

export const sendImage = (formData: FormData) => 
  api.post('/send/image', formData);

export const sendVideo = (formData: FormData) => 
  api.post('/send/video', formData);

export const sendDocument = (formData: FormData) => 
  api.post('/send/document', formData);

export const sendAudio = (formData: FormData) => 
  api.post('/send/audio', formData);

export const sendSticker = (formData: FormData) => 
  api.post('/send/sticker', formData);

export const sendLocation = (data: {
  phone: string;
  latitude: number;
  longitude: number;
  device_id?: string;
}) => api.post('/send/location', data);

export const sendContact = (data: {
  phone: string;
  contact_name: string;
  contact_phone: string;
  device_id?: string;
}) => api.post('/send/contact', data);

export const sendPoll = (data: {
  phone: string;
  question: string;
  options: string[];
  max_answer: number;
  device_id?: string;
}) => api.post('/send/poll', data);

export const sendLink = (data: {
  phone: string;
  url: string;
  caption?: string;
  device_id?: string;
}) => api.post('/send/link', data);

export const sendPresence = (presence: string) => 
  api.post('/send/presence', { presence });

export const sendChatPresence = (jid: string, presence: string) => 
  api.post('/send/chat-presence', { jid, presence });

// Message Actions
export const revokeMessage = (data: { phone: string; message_id: string }) => 
  api.post('/message/revoke', data);

export const deleteMessage = (data: { phone: string; message_id: string }) => 
  api.post('/message/delete', data);

export const reactToMessage = (data: { phone: string; message_id: string; emoji: string }) => 
  api.post('/message/react', data);

export const editMessage = (data: { phone: string; message_id: string; message: string }) => 
  api.post('/message/update', data);

export const starMessage = (data: { phone: string; message_id: string; star: boolean }) => 
  api.post('/message/star', data);

export const readMessage = (phone: string, message_id: string) => 
  api.post('/message/read', { phone, message_id });

export const downloadMedia = (messageId: string) => 
  api.get(`/message/${messageId}/download`, { responseType: 'arraybuffer' });

// Chats
export const getChats = (params?: { page?: number; limit?: number; device_id?: string }) => 
  api.get('/chats', { params });

export const getChatMessages = (jid: string, params?: { page?: number; limit?: number; device_id?: string }) => 
  api.get(`/chat/${jid}/messages`, { params });

export const setChatLabel = (jid: string, labels: string[]) => 
  api.post(`/chat/${jid}/label`, { labels });

export const setChatPin = (jid: string, pin: boolean) => 
  api.post(`/chat/${jid}/pin`, { pin });

export const setChatMute = (jid: string, mute: boolean, duration?: number) => 
  api.post(`/chat/${jid}/mute`, { mute, duration });

export const setChatArchive = (jid: string, archive: boolean) => 
  api.post(`/chat/${jid}/archive`, { archive });

export const deleteChat = (jid: string) => 
  api.delete(`/chat/${jid}/delete`);

export const clearChat = (jid: string) => 
  api.delete(`/chat/${jid}/clear`);

// Groups
export const getMyGroups = (device_id?: string) => api.get('/user/my/groups', { params: { device_id } });

export const getGroupInfo = (groupId: string, device_id?: string) => 
  api.get(`/group/${groupId}`, { params: { device_id } });

export const getGroupParticipants = (groupId: string) => 
  api.get(`/group/${groupId}/participants`);

export const createGroup = (data: { name: string; participants: string[]; device_id?: string }) => 
  api.post('/group', data);

export const addGroupParticipants = (groupId: string, participants: string[]) => 
  api.post(`/group/${groupId}/participants`, { participants });

export const removeGroupParticipants = (groupId: string, participants: string[]) => 
  api.delete(`/group/${groupId}/participants`, { data: { participants } });

export const promoteParticipants = (groupId: string, participants: string[]) => 
  api.post(`/group/${groupId}/admin/promote`, { participants });

export const demoteParticipants = (groupId: string, participants: string[]) => 
  api.post(`/group/${groupId}/admin/demote`, { participants });

export const updateGroupSubject = (groupId: string, subject: string) => 
  api.put(`/group/${groupId}/subject`, { subject });

export const updateGroupDescription = (groupId: string, description: string) => 
  api.put(`/group/${groupId}/description`, { description });

export const getGroupInviteLink = (groupId: string) => 
  api.get(`/group/${groupId}/invite-link`);

export const revokeGroupInviteLink = (groupId: string) => 
  api.post(`/group/${groupId}/invite-link/revoke`);

export const leaveGroup = (groupId: string, device_id?: string) => 
  api.post(`/group/${groupId}/leave`, { device_id });

export const getGroupInfoFromLink = (link: string, device_id?: string) => 
  api.get('/group/info-from-link', { params: { link, device_id } });

export const joinGroupWithLink = (link: string, device_id?: string) => 
  api.post('/group/join-with-link', { link, device_id });

export const exportGroupParticipants = (groupId: string) => 
  api.get(`/group/${groupId}/participants/export`);

export const getParticipantRequests = (groupId: string) => 
  api.get(`/group/${groupId}/participant-requests`);

export const approveParticipantRequest = (groupId: string, participants: string[]) => 
  api.post(`/group/${groupId}/participant-requests/approve`, { participants });

export const rejectParticipantRequest = (groupId: string, participants: string[]) => 
  api.post(`/group/${groupId}/participant-requests/reject`, { participants });

export const setGroupPhoto = (groupId: string, image: string) => 
  api.post(`/group/${groupId}/photo`, { image });

export const setGroupLocked = (groupId: string, locked: boolean) => 
  api.post(`/group/${groupId}/locked`, { locked });

export const setGroupAnnounce = (groupId: string, announce: boolean) => 
  api.post(`/group/${groupId}/announce`, { announce });

// Contacts & Profile
export const getMyContacts = (device_id?: string) => api.get('/user/my/contacts', { params: { device_id } });

export const checkUser = (phone: string, device_id?: string) => 
  api.get('/user/check', { params: { phone, device_id } });

export const getUserInfo = (phone: string, device_id?: string) => 
  api.get('/user/info', { params: { phone, device_id } });

export const getUserAvatar = (phone: string, device_id?: string) => 
  api.get('/user/avatar', { params: { phone, device_id } });

export const getBusinessProfile = (phone: string, device_id?: string) => 
  api.get('/user/business-profile', { params: { phone, device_id } });

// Newsletter
export const getNewsletters = (device_id?: string) => api.get('/newsletter', { params: { device_id } });
export const followNewsletter = (id: string, device_id?: string) => api.post(`/newsletter/${id}/follow`, { device_id });
export const unfollowNewsletter = (id: string, device_id?: string) => api.post(`/newsletter/${id}/unfollow`, { device_id });
export const getNewsletterInfo = (id: string, device_id?: string) => api.get(`/newsletter/${id}`, { params: { device_id } });

export default api;
