import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  importBroadcastContacts, 
  scheduleBroadcast, 
  getBroadcastSchedules, 
  getBroadcastLogs,
  runBroadcastManual,
  detectActiveDevice
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Send,
  Play,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  MessageSquare,
  History,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeviceSelector } from '@/components/layout/DeviceSelector';

export default function BroadcastPage() {
  const { deviceId } = useAuth();
  const queryClient = useQueryClient();
  
  const [message, setMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const [recipientInput, setRecipientInput] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [activeTab, setActiveTab] = useState('new');

  // Parse recipient input into array
  const contacts = recipientInput
    .split(/[\n,;]/)
    .map(val => val.trim())
    .filter(val => val.length > 0 && /^\d+$/.test(val.replace(/[^\d]/g, '')));

  // Queries
  const schedulesQuery = useQuery({
    queryKey: ['broadcastSchedules'],
    queryFn: () => getBroadcastSchedules().then(res => res.data),
    refetchInterval: 5000,
  });

  const logsQuery = useQuery({
    queryKey: ['broadcastLogs'],
    queryFn: () => getBroadcastLogs().then(res => res.data),
    refetchInterval: 5000,
  });

  const { data: detectedData } = useQuery({
    queryKey: ['detectedDevice'],
    queryFn: () => detectActiveDevice().then(res => res.data),
  });

  // Mutations
  const importMutation = useMutation({
    mutationFn: importBroadcastContacts,
    onSuccess: (res) => {
      setContacts(res.data.results);
      toast.success(`Berhasil mengimpor ${res.data.results.length} kontak`);
      setImporting(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal mengimpor kontak');
      setImporting(false);
    }
  });

  const scheduleMutation = useMutation({
    mutationFn: scheduleBroadcast,
    onSuccess: () => {
      toast.success('Broadcast berhasil dijadwalkan');
      setMessage('');
      setContacts([]);
      setScheduledTime('');
      queryClient.invalidateQueries({ queryKey: ['broadcastSchedules'] });
      setActiveTab('schedules');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal menjadwalkan broadcast');
    }
  });

  const runManualMutation = useMutation({
    mutationFn: runBroadcastManual,
    onSuccess: (res) => {
      toast.success(`Berhasil memproses ${res.data.processed} jadwal`);
      queryClient.invalidateQueries({ queryKey: ['broadcastSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['broadcastLogs'] });
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    importMutation.mutate(file);
  };

  const handleSchedule = () => {
    if (contacts.length === 0) return toast.error('Masukkan nomor penerima terlebih dahulu');
    if (!message.trim()) return toast.error('Isi pesan broadcast');

    const timestamp = scheduledTime ? new Date(scheduledTime).getTime() : Date.now();
    
    scheduleMutation.mutate({
      timestamp,
      content: { type: 'text', message },
      recipients: contacts,
    });
  };

  const activeScheduledDevice = detectedData?.data;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Broadcast Message</h1>
          <p className="text-muted-foreground text-sm md:text-base">Kirim pesan massal secara otomatis dengan sistem penjadwalan.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
            variant="outline" 
            onClick={() => runManualMutation.mutate(deviceId || '')}
            disabled={runManualMutation.isPending || !deviceId}
            className="gap-2"
           >
             {runManualMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
             Jalankan Sekarang
           </Button>
        </div>
      </div>

      <DeviceSelector />

      {activeScheduledDevice && activeScheduledDevice.id !== deviceId && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center gap-3 text-blue-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>
            Perangkat <strong>{activeScheduledDevice.name}</strong> sedang dalam jadwal aktif. 
            Sistem akan otomatis menggunakan perangkat ini untuk broadcast.
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="new" className="gap-2">
            <Send className="h-4 w-4" /> Baru
          </TabsTrigger>
          <TabsTrigger value="schedules" className="gap-2">
            <Clock className="h-4 w-4" /> Jadwal
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="h-4 w-4" /> Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" /> Konten Pesan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Isi Pesan</Label>
                    <Textarea 
                      placeholder="Ketik pesan broadcast Anda di sini..." 
                      className="min-h-[200px] resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">Gunakan format standar WhatsApp untuk menebalkan (*teks*) atau miring (_teks_).</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Waktu Pengiriman
                      </Label>
                      <Input 
                        type="datetime-local" 
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                      <p className="text-[10px] text-muted-foreground italic">Kosongkan untuk mengirim segera.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" /> Penerima
                    </div>
                    {contacts.length > 0 && (
                      <Badge variant="secondary">{contacts.length} Nomor</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Daftar Nomor</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-[10px] text-destructive hover:text-destructive"
                        onClick={() => setRecipientInput('')}
                        disabled={!recipientInput}
                      >
                        Hapus Semua
                      </Button>
                    </div>
                    <Textarea 
                      placeholder="Masukkan nomor WhatsApp...&#10;Contoh:&#10;628123456789&#10;628987654321" 
                      className="min-h-[200px] font-mono text-xs resize-none"
                      value={recipientInput}
                      onChange={(e) => setRecipientInput(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">Pisahkan nomor dengan baris baru atau koma. Gunakan format internasional (62...).</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">Opsi Impor File</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Input 
                        type="file" 
                        accept=".csv,.xls,.xlsx" 
                        className="hidden" 
                        id="file-upload" 
                        onChange={handleFileUpload}
                        disabled={importing}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-9 border-dashed"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={importing}
                      >
                        {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        Impor CSV / Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    disabled={contacts.length === 0 || !message.trim() || scheduleMutation.isPending}
                    onClick={handleSchedule}
                  >
                    {scheduleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Jadwalkan Broadcast
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Antrean Penjadwalan</CardTitle>
              <CardDescription>Daftar broadcast yang sedang menunggu atau sedang diproses.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedulesQuery.isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : !schedulesQuery.data?.results?.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Tidak ada jadwal broadcast yang ditemukan.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {schedulesQuery.data.results.map((s: any) => (
                      <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {s.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Broadcast ID: {s.id}</p>
                            <p className="text-xs text-muted-foreground">Dibuat: {new Date(s.created_at).toLocaleString()}</p>
                            <Badge variant="outline" className="mt-2 capitalize">{s.status}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab('logs')}>Lihat Log</Button>
                        </div>
                      </div>
                    )).reverse()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pengiriman</CardTitle>
              <CardDescription>Log aktivitas broadcast terbaru.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logsQuery.isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : !logsQuery.data?.results?.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Belum ada riwayat aktivitas.</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-medium">Waktu</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Pesan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {logsQuery.data.results.map((log: any) => (
                          <tr key={log.id} className="hover:bg-muted/30">
                            <td className="p-3 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="p-3">
                              <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-[10px] h-5">
                                {log.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-xs">{log.message}</td>
                          </tr>
                        )).reverse()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
}
