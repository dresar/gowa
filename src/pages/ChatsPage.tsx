import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChats,
  getChatMessages,
  sendTextMessage,
  getAllDevices,
  setChatPin,
  setChatMute,
  setChatArchive,
  deleteChat,
  clearChat,
  setChatLabel,
  readMessage,
  isDeviceConnected,
  sendImage,
  sendVideo,
  sendDocument,
  sendAudio,
  downloadMedia
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Send, Phone, MoreVertical, Paperclip, Smile, Pin, VolumeX, Archive, Trash2, Eraser, Tag, AlertCircle, Smartphone, Image as ImageIcon, Video, FileText, Mic, X, Download, Play, Pause, File, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { DeviceSelector } from '@/components/layout/DeviceSelector';

import { Label } from '@/components/ui/label';

// --- Media Components ---

function MediaMessage({ msg, deviceId }: { msg: any, deviceId: string }) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleDownload = async () => {
    if (mediaUrl || loading) return;
    setLoading(true);
    try {
      const res = await downloadMedia(msg.key.id);
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      setMediaUrl(url);
    } catch (err) {
      console.error('Failed to download media:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-download images and stickers for preview
    if (msg.message?.imageMessage || msg.message?.stickerMessage) {
      handleDownload();
    }
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, []);

  if (msg.message?.imageMessage) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-md overflow-hidden bg-slate-200 dark:bg-slate-700 min-h-[150px] flex items-center justify-center">
          {mediaUrl ? (
            <img src={mediaUrl} alt="WhatsApp Image" className="max-w-full h-auto cursor-pointer" onClick={() => window.open(mediaUrl, '_blank')} />
          ) : loading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <Button variant="ghost" size="sm" onClick={handleDownload} className="flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Unduh Gambar</span>
            </Button>
          )}
        </div>
        {msg.message.imageMessage.caption && <p className="text-sm">{msg.message.imageMessage.caption}</p>}
      </div>
    );
  }

  if (msg.message?.videoMessage) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-md overflow-hidden bg-slate-200 dark:bg-slate-700 min-h-[150px] flex items-center justify-center">
          {mediaUrl ? (
            <video src={mediaUrl} controls className="max-w-full h-auto" />
          ) : loading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <Button variant="ghost" size="sm" onClick={handleDownload} className="flex flex-col gap-2">
              <Video className="h-6 w-6" />
              <span>Unduh Video</span>
            </Button>
          )}
        </div>
        {msg.message.videoMessage.caption && <p className="text-sm">{msg.message.videoMessage.caption}</p>}
      </div>
    );
  }

  if (msg.message?.audioMessage) {
    return (
      <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-md min-w-[200px]">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Mic className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {mediaUrl ? (
            <div className="flex flex-col gap-1">
              <audio src={mediaUrl} controls className="w-full h-8" />
              <p className="text-[9px] text-muted-foreground text-right px-1">Audio Message</p>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 w-full justify-start gap-2" disabled={loading}>
              <Download className="h-4 w-4" />
              <span className="text-xs">Unduh Audio</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (msg.message?.documentMessage) {
    const doc = msg.message.documentMessage;
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
        <div className="h-10 w-10 rounded bg-blue-500/20 flex items-center justify-center shrink-0">
          <FileText className="h-6 w-6 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-sm font-medium truncate">{doc.fileName || 'Dokumen Tanpa Nama'}</p>
          <p className="text-[10px] text-muted-foreground uppercase">{doc.mimetype?.split('/')[1] || 'FILE'} • {Math.round(doc.fileLength / 1024)} KB</p>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0" onClick={handleDownload} disabled={loading}>
          {loading ? <Skeleton className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  if (msg.message?.stickerMessage) {
    return (
      <div className="flex justify-center">
        {mediaUrl ? (
          <img src={mediaUrl} alt="Sticker" className="w-32 h-32 object-contain" />
        ) : loading ? (
          <Skeleton className="h-32 w-32" />
        ) : (
          <Button variant="ghost" size="sm" onClick={handleDownload}>Unduh Sticker</Button>
        )}
      </div>
    );
  }

  return <p className="text-sm italic text-muted-foreground">Tipe pesan ini belum didukung untuk ditampilkan langsung.</p>;
}

export default function ChatsPage() {
  const { deviceId, isServerOnline } = useAuth();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');



  const [messageInput, setMessageInput] = useState('');
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'audio' | 'document' | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // --- Search Logic ---
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const chatActionMutation = useMutation({
    mutationFn: async ({ action, data }: { action: string; data: any }) => {
      switch (action) {
        case 'pin': return setChatPin(selectedChat.jid, data.pin);
        case 'mute': return setChatMute(selectedChat.jid, data.mute, data.duration);
        case 'archive': return setChatArchive(selectedChat.jid, data.archive);
        case 'delete': return deleteChat(selectedChat.jid);
        case 'clear': return clearChat(selectedChat.jid);
        case 'label': return setChatLabel(selectedChat.jid, data.labels);
        default: throw new Error('Unknown action');
      }
    },
    onSuccess: (_, variables) => {
      toast.success(`Berhasil ${variables.action} chat`);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      if (variables.action === 'delete') setSelectedChat(null);
    },
    onError: (error: any) => {
      toast.error('Gagal melakukan aksi: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleAction = (action: string, data?: any) => {
    chatActionMutation.mutate({ action, data });
  };

  const handleSetLabels = (e: React.FormEvent) => {
    e.preventDefault();
    const labels = labelInput.split(',').map(l => l.trim()).filter(l => l !== '');
    handleAction('label', { labels });
    setIsLabelDialogOpen(false);
  };

  // 1. Get Device Info
  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: () => getAllDevices().then((res) => res.data),
    enabled: isServerOnline,
    refetchInterval: isServerOnline ? 5000 : false, // Poll device status every 5s
  });

  const devices = Array.isArray(devicesQuery.data?.results) ? devicesQuery.data.results :
                  Array.isArray(devicesQuery.data?.data) ? devicesQuery.data.data : [];

  const currentDevice = devices.find(
    (d: any) => (d.device_id || d.id) === deviceId
  );

  // Unified connection status check
  const isConnected = isDeviceConnected(currentDevice);

  const isDeviceDisconnected = !!deviceId && devicesQuery.isSuccess && !isConnected;

  // 2. Get Chats List (Limit 50) - Real-time sync with auto-cleanup
  const chatsQuery = useQuery({
    queryKey: ['chats', deviceId],
    queryFn: () => getChats({ limit: 50, device_id: deviceId }).then(res => res.data),
    enabled: isServerOnline && !!deviceId && isConnected,
    refetchInterval: isServerOnline && isConnected ? 3000 : false, // Real-time sync every 3s
    staleTime: 0, // Always fetch fresh data
    gcTime: 0,    // Do not cache chat data
    retry: false, // Don't retry on failure to avoid UI flickering
  });

  // Filter and sort chats based on search query and timestamp
  const chatsList = Array.isArray(chatsQuery.data) ? chatsQuery.data :
                    Array.isArray(chatsQuery.data?.results) ? chatsQuery.data.results :
                    Array.isArray(chatsQuery.data?.data) ? chatsQuery.data.data : [];

  const filteredChats = chatsList.filter((chat: any) => {
    const name = (chat.name || chat.jid || "").toLowerCase();
    const lastMsg = chat.last_message?.conversation || chat.last_message?.extendedTextMessage?.text || '';
    return name.includes(searchQuery.toLowerCase()) || lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a: any, b: any) => {
    const timeA = a.last_message_timestamp || 0;
    const timeB = b.last_message_timestamp || 0;
    return Number(timeB) - Number(timeA);
  });

  // 3. Get Messages for Selected Chat (Limit 50) - Real-time sync with auto-cleanup
  const messagesQuery = useQuery({
    queryKey: ['messages', deviceId, selectedChat?.jid],
    queryFn: () => getChatMessages(selectedChat.jid, { limit: 50, device_id: deviceId }).then(res => res.data),
    enabled: isServerOnline && !!selectedChat && !!deviceId && isConnected,
    refetchInterval: isServerOnline && isConnected ? 2000 : false, // Faster sync for active chat
    staleTime: 0,
    gcTime: 0,
  });

  // --- Auto-Cleanup Logic ---
  useEffect(() => {
    // If device is disconnected or changed, clear current chat session
    if (!isConnected || !deviceId) {
      setSelectedChat(null);
      // Invalidate queries to ensure UI is cleared
      queryClient.invalidateQueries({ queryKey: ['chats', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['messages', deviceId] });
    }
  }, [isConnected, deviceId, queryClient]);

  const messages = Array.isArray(messagesQuery.data) ? messagesQuery.data :
                   Array.isArray(messagesQuery.data?.results) ? messagesQuery.data.results :
                   Array.isArray(messagesQuery.data?.data) ? messagesQuery.data.data : [];

  // Scroll to bottom when messages load and mark as read
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Mark messages as read
    if (selectedChat && messages.length > 0) {
      const unreadIds = messages
        .filter((msg: any) => !msg.key?.fromMe && msg.status !== 'READ')
        .map((msg: any) => msg.key?.id);
      
      if (unreadIds.length > 0) {
        // Just mark the latest one as read if multiple, or call for each
        // Backend currently expects singular message_id
        const phone = selectedChat.jid.split('@')[0];
        unreadIds.forEach(id => {
          readMessage(phone, id).catch(console.error);
        });
      }
    }
  }, [messages, selectedChat]);

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { phone: string; message: string }) => sendTextMessage(data),
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChat?.jid] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error: any) => {
      toast.error('Gagal mengirim pesan: ' + (error.response?.data?.message || error.message));
    },
  });

  // Media Send Mutation
  const sendMediaMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      switch (uploadType) {
        case 'image': return sendImage(formData);
        case 'video': return sendVideo(formData);
        case 'audio': return sendAudio(formData);
        case 'document': return sendDocument(formData);
        default: throw new Error('Unknown media type');
      }
    },
    onSuccess: () => {
      toast.success('Media berhasil dikirim');
      setUploadType(null);
      setIsMediaMenuOpen(false);
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChat?.jid] });
    },
    onError: (error: any) => {
      toast.error('Gagal mengirim media: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    // Extract phone number from JID (remove @s.whatsapp.net or @g.us)
    const phone = selectedChat.jid.split('@')[0];
    
    sendMessageMutation.mutate({
      phone: phone,
      message: messageInput,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat || !uploadType) return;

    setSelectedFile(file);
    setMediaCaption(messageInput || '');
    
    // Create preview URL for images and videos
    if (uploadType === 'image' || uploadType === 'video') {
      const url = URL.createObjectURL(file);
      setMediaPreviewUrl(url);
    } else {
      setMediaPreviewUrl(null);
    }
    
    setIsPreviewOpen(true);
    
    // Reset file input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMedia = () => {
    if (!selectedFile || !selectedChat || !uploadType) return;

    const formData = new FormData();
    const phone = selectedChat.jid.split('@')[0];
    formData.append('phone', phone);
    formData.append('file', selectedFile);
    
    if (uploadType === 'image' || uploadType === 'video') {
      formData.append('caption', mediaCaption);
    }

    sendMediaMutation.mutate(formData, {
      onSuccess: () => {
        setIsPreviewOpen(false);
        setSelectedFile(null);
        setMediaPreviewUrl(null);
        setMediaCaption('');
        setMessageInput('');
      }
    });
  };

  const triggerUpload = (type: 'image' | 'video' | 'audio' | 'document') => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const formatTime = (timestamp: string | number) => {
    if (!timestamp) return '';
    const date = new Date(typeof timestamp === 'string' ? timestamp : Number(timestamp) * 1000);
    return format(date, 'HH:mm', { locale: id });
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    messages.forEach(msg => {
      const date = new Date(Number(msg.messageTimestamp) * 1000);
      const dateStr = format(date, 'yyyy-MM-dd');
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(msg);
    });
    return groups;
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'Hari Ini';
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) return 'Kemarin';
    return format(date, 'd MMMM yyyy', { locale: id });
  };

  const formatMessageContent = (msg: any) => {
    // Check if it's a media message
    if (msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.audioMessage || msg.message?.documentMessage || msg.message?.stickerMessage) {
      return <MediaMessage msg={msg} deviceId={deviceId!} />;
    }

    // Handle text messages
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    if (text) return <p className="text-sm break-words whitespace-pre-wrap">{text}</p>;

    return <p className="text-sm italic text-muted-foreground">Pesan tidak didukung atau kosong</p>;
  };

  const getChatPreview = (chat: any) => {
    const msg = chat.last_message;
    if (!msg) return 'Tidak ada pesan';
    if (msg.conversation) return msg.conversation;
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
    if (msg.imageMessage) return '📷 Foto';
    if (msg.videoMessage) return '🎥 Video';
    if (msg.audioMessage) return '🎵 Audio';
    if (msg.documentMessage) return '📄 Dokumen';
    if (msg.stickerMessage) return '🧩 Sticker';
    return 'Pesan media';
  };

  if (devicesQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 overflow-hidden">
      <div className="flex flex-col gap-1 px-4 md:px-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Obrolan Terpusat</h1>
            <p className="text-muted-foreground">Sinkronisasi pesan dan media secara real-time.</p>
          </div>
          {deviceId && isConnected && (
            <Badge variant="outline" className="h-fit py-1 px-3 border-green-500/30 bg-green-500/5 text-green-600 gap-2 hidden sm:flex">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {currentDevice?.name || currentDevice?.phone || deviceId}
            </Badge>
          )}
        </div>
      </div>

      <DeviceSelector />

      {!isServerOnline ? (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="mb-4 h-16 w-16 text-destructive opacity-50" />
          <h2 className="mb-2 text-2xl font-bold">Server Offline</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            Tidak dapat terhubung ke server GoWA. Pastikan backend server Anda sedang berjalan.
          </p>
        </div>
      ) : !deviceId ? (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <Smartphone className="mb-4 h-16 w-16 text-muted-foreground opacity-50" />
          <h2 className="mb-2 text-2xl font-bold">Pilih Perangkat</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            Silakan pilih perangkat WhatsApp di atas terlebih dahulu untuk melihat obrolan.
          </p>
        </div>
      ) : isDeviceDisconnected ? (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
          <AlertCircle className="mb-4 h-16 w-16 text-destructive opacity-50" />
          <h2 className="mb-2 text-2xl font-bold">Perangkat Terputus</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            Perangkat <span className="font-bold text-foreground">{currentDevice?.name || currentDevice?.phone || deviceId}</span> belum terhubung ke WhatsApp. 
          </p>
          <Button onClick={() => window.location.href = '/devices'}>
            Buka Pengaturan Perangkat
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 gap-4 overflow-hidden min-h-0 px-4 md:px-0">
        {/* Chat List Sidebar */}
        <Card className="flex w-full md:w-1/3 flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-muted/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari chat atau pesan..." 
                className="pl-9 bg-background" 
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col divide-y divide-border/50">
              {chatsQuery.isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <Skeleton className="h-4 w-[60%]" />
                      <Skeleton className="h-3 w-[80%]" />
                    </div>
                  </div>
                ))
              ) : filteredChats.length > 0 ? (
                filteredChats.map((chat: any) => (
                  <button
                    key={chat.jid}
                    onClick={() => setSelectedChat(chat)}
                    className={`flex items-center gap-3 p-4 text-left transition-all hover:bg-accent/50 ${
                      selectedChat?.jid === chat.jid ? 'bg-accent border-l-4 border-primary' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {chat.name?.substring(0, 2).toUpperCase() || '?' }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold truncate text-sm">{chat.name || chat.jid}</span>
                        <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">
                          {chat.last_message_timestamp ? formatTime(chat.last_message_timestamp) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-muted-foreground leading-relaxed flex-1">
                          {getChatPreview(chat)}
                        </p>
                        {chat.unread_count > 0 && (
                          <Badge className="h-4 min-w-[16px] rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-[9px] border-none">
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Tidak ada percakapan ditemukan"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Conversation Area */}
        <Card className="hidden md:flex flex-1 flex-col overflow-hidden shadow-sm">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b p-4 bg-muted/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedChat.name?.substring(0, 2).toUpperCase() || '?' }
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{selectedChat.name || selectedChat.jid}</h3>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <p className="text-[10px] text-muted-foreground truncate">{selectedChat.jid}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8"><Search className="h-4 w-4" /></Button>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-48">
                       <DropdownMenuLabel>Opsi Obrolan</DropdownMenuLabel>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={() => handleAction('pin', { pin: true })}>
                         <Pin className="mr-2 h-4 w-4" /> Sematkan Chat
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleAction('mute', { mute: true, duration: 8 * 3600 })}>
                         <VolumeX className="mr-2 h-4 w-4" /> Bisukan Notifikasi
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleAction('archive', { archive: true })}>
                         <Archive className="mr-2 h-4 w-4" /> Arsipkan Chat
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setIsLabelDialogOpen(true)}>
                         <Tag className="mr-2 h-4 w-4" /> Kelola Label
                       </DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={() => handleAction('clear')} className="text-orange-600">
                         <Eraser className="mr-2 h-4 w-4" /> Bersihkan Riwayat
                       </DropdownMenuItem>
                       <DropdownMenuItem className="text-destructive" onClick={() => handleAction('delete')}>
                         <Trash2 className="mr-2 h-4 w-4" /> Hapus Permanen
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50" ref={scrollRef}>
                <div className="space-y-6 max-w-3xl mx-auto">
                  {messagesQuery.isLoading ? (
                     <div className="flex justify-center p-8">
                       <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-medium shadow-sm">
                         Memuat riwayat pesan...
                       </div>
                     </div>
                  ) : messagesQuery.isError ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                       <div className="bg-destructive/10 p-4 rounded-full mb-4">
                         <AlertCircle className="h-8 w-8 text-destructive" />
                       </div>
                       <h4 className="font-semibold text-destructive">Gagal Memuat Pesan</h4>
                       <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                         {((messagesQuery.error as any)?.response?.data?.error || messagesQuery.error.message)}
                       </p>
                       <Button variant="outline" size="sm" className="mt-6" onClick={() => messagesQuery.refetch()}>Coba Muat Ulang</Button>
                    </div>
                  ) : messages.length ? (
                    Object.entries(groupMessagesByDate([...messages].reverse())).map(([dateStr, msgs]) => (
                      <div key={dateStr} className="space-y-6">
                        <div className="flex justify-center">
                          <span className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm border border-border/40">
                            {getDateLabel(dateStr)}
                          </span>
                        </div>
                        {msgs.map((msg: any) => {
                          const isMe = msg.key?.fromMe;
                          return (
                            <div key={msg.key?.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`group relative max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm transition-all ${
                                isMe 
                                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                  : 'bg-background dark:bg-slate-800 rounded-tl-none border border-border/50'
                              }`}>
                                <div className="flex flex-col gap-1">
                                  {formatMessageContent(msg)}
                                  <div className={`flex items-center justify-end gap-1.5 mt-0.5 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                    <span className="text-[9px] font-medium">{formatTime(msg.messageTimestamp)}</span>
                                    {isMe && (
                                      <div className="flex items-center">
                                         {msg.status === 'READ' ? (
                                           <CheckCheck className="h-3 w-3 text-blue-400" />
                                         ) : msg.status === 'DELIVERED' ? (
                                           <CheckCheck className="h-3 w-3" />
                                         ) : (
                                           <Check className="h-3 w-3" />
                                         )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
                      <MessageSquare className="h-16 w-16 mb-4" />
                      <p className="text-sm font-medium">Belum ada percakapan</p>
                      <p className="text-[11px]">Mulai kirim pesan pertama Anda!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-background/95 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <DropdownMenu open={isMediaMenuOpen} onOpenChange={setIsMediaMenuOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="shrink-0 h-10 w-10 rounded-full hover:bg-muted">
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="start" className="w-48 mb-2 p-2">
                          <DropdownMenuItem className="gap-3 py-2.5 cursor-pointer" onClick={() => triggerUpload('image')}>
                            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="font-medium text-xs">Gambar / Foto</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 py-2.5 cursor-pointer" onClick={() => triggerUpload('video')}>
                            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                              <Video className="h-4 w-4 text-orange-600" />
                            </div>
                            <span className="font-medium text-xs">Video</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 py-2.5 cursor-pointer" onClick={() => triggerUpload('audio')}>
                            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                              <Mic className="h-4 w-4 text-red-600" />
                            </div>
                            <span className="font-medium text-xs">Pesan Suara</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 py-2.5 cursor-pointer" onClick={() => triggerUpload('document')}>
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-xs">Dokumen</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Input 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Ketik pesan WhatsApp..." 
                      className="flex-1 h-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm"
                    />
                    
                    <Button 
                      type="submit" 
                      className="h-10 w-10 rounded-full shrink-0 shadow-md"
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                    accept={
                      uploadType === 'image' ? 'image/*' :
                      uploadType === 'video' ? 'video/*' :
                      uploadType === 'audio' ? 'audio/*' :
                      '*'
                    }
                  />
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center p-12 bg-muted/5">
              <div className="relative mb-8">
                <div className="h-32 w-32 rounded-full bg-primary/5 flex items-center justify-center animate-pulse">
                  <MessageSquare className="h-16 w-16 text-primary/20" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-background shadow-lg flex items-center justify-center border-4 border-muted/20">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">WhatsApp Terpusat</h3>
              <p className="text-muted-foreground max-w-sm mt-3 leading-relaxed">
                Pilih percakapan untuk mulai menyinkronkan pesan, gambar, video, dan dokumen secara real-time.
              </p>
            </div>
          )}
        </Card>
      </div>
      )}

      {/* Label Dialog */}
      <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kelola Label Obrolan</DialogTitle>
            <DialogDescription>
              Gunakan label untuk mengelompokkan percakapan ini. Pisahkan dengan koma.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetLabels} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="labels">Label</Label>
              <Input 
                id="labels"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Penting, Follow Up, Pelanggan..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLabelDialogOpen(false)}>Batal</Button>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Media Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={(open) => {
        if (!open) {
          setIsPreviewOpen(false);
          setSelectedFile(null);
          setMediaPreviewUrl(null);
          setMediaCaption('');
        }
      }}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-black/95 border-none">
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="flex items-center justify-between p-4 bg-black/40 text-white">
              <div className="flex items-center gap-2">
                {uploadType === 'image' && <ImageIcon className="h-4 w-4" />}
                {uploadType === 'video' && <Video className="h-4 w-4" />}
                {uploadType === 'audio' && <Mic className="h-4 w-4" />}
                {uploadType === 'document' && <FileText className="h-4 w-4" />}
                <span className="text-sm font-medium">{selectedFile?.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4 bg-black/20">
              {uploadType === 'image' && mediaPreviewUrl && (
                <img src={mediaPreviewUrl} alt="Preview" className="max-w-full max-h-[50vh] object-contain shadow-2xl rounded-sm" />
              )}
              {uploadType === 'video' && mediaPreviewUrl && (
                <video src={mediaPreviewUrl} controls className="max-w-full max-h-[50vh] shadow-2xl rounded-sm" />
              )}
              {uploadType === 'audio' && (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <Mic className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-white text-sm font-medium">Pesan Suara</p>
                </div>
              )}
              {uploadType === 'document' && (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="h-20 w-20 rounded bg-blue-500/20 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-blue-500" />
                  </div>
                  <p className="text-white text-sm font-medium">{selectedFile?.name}</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">{selectedFile?.type.split('/')[1]}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/40 space-y-4">
              {(uploadType === 'image' || uploadType === 'video') && (
                <div className="relative">
                  <Input 
                    value={mediaCaption}
                    onChange={(e) => setMediaCaption(e.target.value)}
                    placeholder="Tambahkan keterangan..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMedia();
                      }
                    }}
                  />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-white hover:bg-white/10">
                  Batal
                </Button>
                <Button 
                  onClick={handleSendMedia} 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 min-w-[100px]"
                  disabled={sendMediaMutation.isPending}
                >
                  {sendMediaMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <span>Kirim</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}