import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  sendTextMessage,
  sendImage,
  sendVideo,
  sendDocument,
  sendAudio,
  sendSticker,
  sendLocation,
  sendContact,
  sendPoll,
  sendLink,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Send,
  MessageSquare,
  Image,
  Video,
  FileText,
  Music,
  Sticker,
  MapPin,
  UserCircle,
  Vote,
  Link as LinkIcon,
  Plus,
  Trash2,
} from 'lucide-react';

import { DeviceSelector } from '@/components/layout/DeviceSelector';

export default function MessagesPage() {
  const { deviceId } = useAuth();
  
  // Text message state
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [replyMessageId, setReplyMessageId] = useState('');
  const [mentionEveryone, setMentionEveryone] = useState(false);

  // Media state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [viewOnce, setViewOnce] = useState(false);
  const [compress, setCompress] = useState(true);

  // Location state
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Contact state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [maxAnswer, setMaxAnswer] = useState(1);

  // Link state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCaption, setLinkCaption] = useState('');

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && (cleaned.startsWith('62') || cleaned.startsWith('0') || cleaned.startsWith('8'));
  };

  const getCleanPhone = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const textMutation = useMutation({
    mutationFn: () =>
      sendTextMessage({
        phone: getCleanPhone(phone),
        message,
        reply_message_id: replyMessageId || undefined,
        mention_everyone: mentionEveryone,
      }),
    onSuccess: () => {
      toast.success('Pesan berhasil dikirim!');
      setMessage('');
      setReplyMessageId('');
      setMentionEveryone(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim pesan');
    },
  });

  const imageMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('phone', getCleanPhone(phone));
      if (mediaFile) formData.append('image', mediaFile);
      formData.append('caption', caption);
      formData.append('view_once', viewOnce.toString());
      formData.append('compress', compress.toString());
      return sendImage(formData);
    },
    onSuccess: () => {
      toast.success('Gambar berhasil dikirim!');
      setMediaFile(null);
      setCaption('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim gambar');
    },
  });

  const videoMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('phone', getCleanPhone(phone));
      if (mediaFile) formData.append('file', mediaFile);
      formData.append('caption', caption);
      formData.append('view_once', viewOnce.toString());
      formData.append('compress', compress.toString());
      return sendVideo(formData);
    },
    onSuccess: () => {
      toast.success('Video berhasil dikirim!');
      setMediaFile(null);
      setCaption('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim video');
    },
  });

  const documentMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('phone', getCleanPhone(phone));
      if (mediaFile) formData.append('file', mediaFile);
      formData.append('caption', caption);
      return sendDocument(formData);
    },
    onSuccess: () => {
      toast.success('Dokumen berhasil dikirim!');
      setMediaFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim dokumen');
    },
  });

  const audioMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('phone', getCleanPhone(phone));
      if (mediaFile) formData.append('file', mediaFile);
      return sendAudio(formData);
    },
    onSuccess: () => {
      toast.success('Audio berhasil dikirim!');
      setMediaFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim audio');
    },
  });

  const stickerMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('phone', getCleanPhone(phone));
      if (mediaFile) formData.append('image', mediaFile);
      return sendSticker(formData);
    },
    onSuccess: () => {
      toast.success('Sticker berhasil dikirim!');
      setMediaFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim sticker');
    },
  });

  const locationMutation = useMutation({
    mutationFn: () =>
      sendLocation({
        phone: getCleanPhone(phone),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      }),
    onSuccess: () => {
      toast.success('Lokasi berhasil dikirim!');
      setLatitude('');
      setLongitude('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim lokasi');
    },
  });

  const contactMutation = useMutation({
    mutationFn: () =>
      sendContact({
        phone: getCleanPhone(phone),
        contact_name: contactName,
        contact_phone: contactPhone,
      }),
    onSuccess: () => {
      toast.success('Kontak berhasil dikirim!');
      setContactName('');
      setContactPhone('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim kontak');
    },
  });

  const pollMutation = useMutation({
    mutationFn: () =>
      sendPoll({
        phone: getCleanPhone(phone),
        question: pollQuestion,
        options: pollOptions.filter((o) => o.trim() !== ''),
        max_answer: maxAnswer,
      }),
    onSuccess: () => {
      toast.success('Polling berhasil dikirim!');
      setPollQuestion('');
      setPollOptions(['', '']);
      setMaxAnswer(1);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim polling');
    },
  });

  const linkMutation = useMutation({
    mutationFn: () =>
      sendLink({
        phone: getCleanPhone(phone),
        url: linkUrl,
        caption: linkCaption || undefined,
      }),
    onSuccess: () => {
      toast.success('Link berhasil dikirim!');
      setLinkUrl('');
      setLinkCaption('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim link');
    },
  });

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Pusat Pesan</h1>
        <p className="text-muted-foreground">
          Kirim berbagai jenis pesan WhatsApp ke nomor tujuan.
        </p>
      </div>

      <DeviceSelector />

      {!deviceId ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium text-center">
              Silakan pilih perangkat di atas terlebih dahulu untuk mengirim pesan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Phone Input */}
          <Card>
        <CardHeader>
          <CardTitle>Nomor Tujuan</CardTitle>
          <CardDescription>
            Format internasional tanpa tanda + (contoh: 628123456789)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="628xxxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="max-w-sm"
          />
          {phone && !validatePhone(phone) && (
            <p className="mt-2 text-sm text-destructive">
              Format nomor tidak valid. Gunakan format: 628xxxxxxxxxx
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs
        defaultValue="text"
        className="w-full"
        onValueChange={() => {
          setMediaFile(null);
          setCaption('');
        }}
      >
        <TabsList className="mb-4 grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="text" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden lg:inline">Teks</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-1">
            <Image className="h-4 w-4" />
            <span className="hidden lg:inline">Gambar</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-1">
            <Video className="h-4 w-4" />
            <span className="hidden lg:inline">Video</span>
          </TabsTrigger>
          <TabsTrigger value="document" className="gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden lg:inline">Dokumen</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-1">
            <Music className="h-4 w-4" />
            <span className="hidden lg:inline">Audio</span>
          </TabsTrigger>
          <TabsTrigger value="sticker" className="gap-1">
            <Sticker className="h-4 w-4" />
            <span className="hidden lg:inline">Sticker</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-1">
            <MapPin className="h-4 w-4" />
            <span className="hidden lg:inline">Lokasi</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1">
            <UserCircle className="h-4 w-4" />
            <span className="hidden lg:inline">Kontak</span>
          </TabsTrigger>
          <TabsTrigger value="poll" className="gap-1">
            <Vote className="h-4 w-4" />
            <span className="hidden lg:inline">Poll</span>
          </TabsTrigger>
          <TabsTrigger value="link" className="gap-1">
            <LinkIcon className="h-4 w-4" />
            <span className="hidden lg:inline">Link</span>
          </TabsTrigger>
        </TabsList>

        {/* Text Message */}
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Kirim Pesan Teks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pesan</Label>
                <Textarea
                  placeholder="Tulis pesan Anda..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Reply Message ID (Opsional)</Label>
                <Input
                  placeholder="ID pesan yang ingin di-reply"
                  value={replyMessageId}
                  onChange={(e) => setReplyMessageId(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mention-everyone"
                  checked={mentionEveryone}
                  onCheckedChange={(checked) => setMentionEveryone(checked as boolean)}
                />
                <Label htmlFor="mention-everyone">
                  Mention Everyone (@everyone) - untuk grup
                </Label>
              </div>
              <Button
                onClick={() => {
                  if (!phone) {
                    toast.error('Silakan masukkan nomor tujuan');
                    return;
                  }
                  if (!validatePhone(phone)) {
                    toast.error('Format nomor telepon tidak valid');
                    return;
                  }
                  if (!message) {
                    toast.error('Silakan masukkan pesan');
                    return;
                  }
                  textMutation.mutate();
                }}
                disabled={textMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {textMutation.isPending ? 'Mengirim...' : 'Kirim Pesan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image */}
        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Kirim Gambar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Gambar</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Caption (Opsional)</Label>
                <Textarea
                  placeholder="Caption gambar..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="view-once-image"
                    checked={viewOnce}
                    onCheckedChange={(checked) => setViewOnce(checked as boolean)}
                  />
                  <Label htmlFor="view-once-image">View Once</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compress-image"
                    checked={compress}
                    onCheckedChange={(checked) => setCompress(checked as boolean)}
                  />
                  <Label htmlFor="compress-image">Kompres</Label>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (!phone) {
                    toast.error('Silakan masukkan nomor tujuan');
                    return;
                  }
                  if (!validatePhone(phone)) {
                    toast.error('Format nomor telepon tidak valid');
                    return;
                  }
                  if (!mediaFile) {
                    toast.error('Silakan pilih file gambar');
                    return;
                  }
                  imageMutation.mutate();
                }}
                disabled={imageMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {imageMutation.isPending ? 'Mengirim...' : 'Kirim Gambar'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video */}
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Kirim Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Video</Label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Caption (Opsional)</Label>
                <Textarea
                  placeholder="Caption video..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="view-once-video"
                    checked={viewOnce}
                    onCheckedChange={(checked) => setViewOnce(checked as boolean)}
                  />
                  <Label htmlFor="view-once-video">View Once</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compress-video"
                    checked={compress}
                    onCheckedChange={(checked) => setCompress(checked as boolean)}
                  />
                  <Label htmlFor="compress-video">Kompres</Label>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (!phone) {
                    toast.error('Silakan masukkan nomor tujuan');
                    return;
                  }
                  if (!validatePhone(phone)) {
                    toast.error('Format nomor telepon tidak valid');
                    return;
                  }
                  if (!mediaFile) {
                    toast.error('Silakan pilih file video');
                    return;
                  }
                  videoMutation.mutate();
                }}
                disabled={videoMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {videoMutation.isPending ? 'Mengirim...' : 'Kirim Video'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document */}
        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Kirim Dokumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih File</Label>
                <Input
                  type="file"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button
                onClick={() => {
                  if (!phone) {
                    toast.error('Silakan masukkan nomor tujuan');
                    return;
                  }
                  if (!validatePhone(phone)) {
                    toast.error('Format nomor telepon tidak valid');
                    return;
                  }
                  if (!mediaFile) {
                    toast.error('Silakan pilih file dokumen');
                    return;
                  }
                  documentMutation.mutate();
                }}
                disabled={documentMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {documentMutation.isPending ? 'Mengirim...' : 'Kirim Dokumen'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio */}
        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                Kirim Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Audio</Label>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button
                onClick={() => {
                  if (!phone) {
                    toast.error('Silakan masukkan nomor tujuan');
                    return;
                  }
                  if (!validatePhone(phone)) {
                    toast.error('Format nomor telepon tidak valid');
                    return;
                  }
                  if (!mediaFile) {
                    toast.error('Silakan pilih file audio');
                    return;
                  }
                  audioMutation.mutate();
                }}
                disabled={audioMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {audioMutation.isPending ? 'Mengirim...' : 'Kirim Audio'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sticker */}
        <TabsContent value="sticker">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sticker className="h-5 w-5 text-primary" />
                Kirim Sticker
              </CardTitle>
              <CardDescription>
                Gambar akan otomatis dikonversi ke format sticker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Gambar</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button
                onClick={() => {
                  if (!phone) {
                    toast.error('Silakan masukkan nomor tujuan');
                    return;
                  }
                  if (!validatePhone(phone)) {
                    toast.error('Format nomor telepon tidak valid');
                    return;
                  }
                  if (!mediaFile) {
                    toast.error('Silakan pilih file gambar untuk sticker');
                    return;
                  }
                  stickerMutation.mutate();
                }}
                disabled={stickerMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {stickerMutation.isPending ? 'Mengirim...' : 'Kirim Sticker'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Kirim Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="-6.2088"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="106.8456"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  if (!phone) {
                    toast.error('Silakan masukkan nomor tujuan');
                    return;
                  }
                  if (!validatePhone(phone)) {
                    toast.error('Format nomor telepon tidak valid');
                    return;
                  }
                  if (!latitude || !longitude) {
                    toast.error('Silakan masukkan koordinat lokasi');
                    return;
                  }
                  locationMutation.mutate();
                }}
                disabled={locationMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {locationMutation.isPending ? 'Mengirim...' : 'Kirim Lokasi'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                Kirim Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Kontak</Label>
                <Input
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Telepon Kontak</Label>
                <Input
                  placeholder="628123456789"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  if (!phone) {
                    toast.error('Silakan masukkan nomor tujuan');
                    return;
                  }
                  if (!validatePhone(phone)) {
                    toast.error('Format nomor telepon tidak valid');
                    return;
                  }
                  if (!contactName || !contactPhone) {
                    toast.error('Silakan lengkapi data kontak');
                    return;
                  }
                  contactMutation.mutate();
                }}
                disabled={contactMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {contactMutation.isPending ? 'Mengirim...' : 'Kirim Kontak'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Poll */}
        <TabsContent value="poll">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-5 w-5 text-primary" />
                Kirim Polling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pertanyaan</Label>
                <Input
                  placeholder="Apa warna favorit Anda?"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Opsi Jawaban</Label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Opsi ${index + 1}`}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePollOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addPollOption}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Opsi
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Maksimal Jawaban</Label>
                <Input
                  type="number"
                  min={1}
                  max={pollOptions.length}
                  value={maxAnswer}
                  onChange={(e) => setMaxAnswer(parseInt(e.target.value))}
                  className="w-24"
                />
              </div>
              <Button
                onClick={() => {
                  if (!phone) {
                    toast.error('Silakan masukkan nomor tujuan');
                    return;
                  }
                  if (!validatePhone(phone)) {
                    toast.error('Format nomor telepon tidak valid');
                    return;
                  }
                  if (!pollQuestion) {
                    toast.error('Silakan masukkan pertanyaan polling');
                    return;
                  }
                  if (pollOptions.filter((o) => o.trim()).length < 2) {
                    toast.error('Minimal harus ada 2 pilihan polling');
                    return;
                  }
                  pollMutation.mutate();
                }}
                disabled={pollMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {pollMutation.isPending ? 'Mengirim...' : 'Kirim Polling'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Link */}
        <TabsContent value="link">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Kirim Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Caption (Opsional)</Label>
                <Textarea
                  placeholder="Deskripsi link..."
                  value={linkCaption}
                  onChange={(e) => setLinkCaption(e.target.value)}
                  rows={2}
                />
              </div>
              <Button
                onClick={() => {
                  if (!phone) {
                    toast.error('Silakan masukkan nomor tujuan');
                    return;
                  }
                  if (!validatePhone(phone)) {
                    toast.error('Format nomor telepon tidak valid');
                    return;
                  }
                  if (!linkUrl) {
                    toast.error('Silakan masukkan URL');
                    return;
                  }
                  linkMutation.mutate();
                }}
                disabled={linkMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {linkMutation.isPending ? 'Mengirim...' : 'Kirim Link'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      )}
    </div>
  );
}
