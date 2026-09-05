import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  checkServerStatus, 
  getDevices, 
  getWebhookEvents, 
  clearWebhookEvents, 
  getConnectionSettings, 
  updateConnectionSettings, 
  logoutDevice,
  createDevice,
  loginDevice
} from '@/lib/api';
import { Wifi, WifiOff, Server, Smartphone, QrCode, Trash2, RefreshCw, LogIn, LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Device {
  device_id: string;
  name?: string;
  phone?: string;
  connected: boolean;
  platform?: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { credentials, deviceId, setActiveDevice, login } = useAuth();
  const [host, setHost] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Load current settings
  useEffect(() => {
    getConnectionSettings().then(res => {
      const data = res.data;
      if (data) {
        setHost(data.base_url || '');
        setUsername(data.username || '');
        setPassword(data.password || '');
      }
    }).catch(err => {
      console.error('Failed to load connection settings:', err);
    });
  }, []);
  
  // QR Code State
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const { data: serverStatusData, refetch: refetchServerStatus } = useQuery({
    queryKey: ['serverStatus'],
    queryFn: () => checkServerStatus().then((res) => res.data),
    refetchInterval: 30000,
  });

  const serverOnline = useMemo(() => !!serverStatusData, [serverStatusData]);

  const { data: devicesData, refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => getDevices().then((res) => res.data),
    refetchInterval: 5000, // Faster refresh to catch connection status changes
  });

  const devices: Device[] = devicesData?.results || devicesData?.data || [];
  const currentDevice = devices.length > 0 ? devices[0] : null;
  const currentDeviceId = currentDevice ? (currentDevice.device_id || (currentDevice as any).id) : null;
  
  const { data: webhookEventsData, refetch: refetchWebhook } = useQuery({
    queryKey: ['webhookEvents'],
    queryFn: () => getWebhookEvents().then((res) => res.data),
    refetchInterval: 5000,
  });

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error('Masukkan username dan password');
      return;
    }
    setLoginLoading(true);
    try {
      await updateConnectionSettings({ base_url: host, username, password });
      toast.success('Pengaturan GoWA disimpan');
      refetchServerStatus();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal menyimpan pengaturan');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleClearWebhook = async () => {
    try {
      await clearWebhookEvents();
      toast.success('Log webhook dibersihkan');
      queryClient.invalidateQueries({ queryKey: ['webhookEvents'] });
      refetchWebhook();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal membersihkan webhook');
    }
  };

  const handleLogoutDevice = async (id: string) => {
    try {
      await logoutDevice(id);
      toast.success('Logout berhasil');
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal logout');
    }
  };

  const handleConnect = async (id: string) => {
    // Session check: prevent QR modal if already connected
    const device = devices.find(d => (d.device_id || (d as any).id) === id);
    const isConnected = device?.connected || (device as any)?.status === 'CONNECTED' || (device as any)?.state === 'logged_in';
    if (isConnected) {
      toast.success('Perangkat sudah terhubung (Active)');
      return;
    }

    try {
      const res = await loginDevice(id);
      // Check if response has QR code data
      if (res.results?.qr_link || res.results?.qr_code) {
        setQrCodeUrl(res.results.qr_link || res.results.qr_code);
        setQrDialogOpen(true);
      } else {
        toast.info('Silakan cek console server untuk QR Code jika tidak muncul disini');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Gagal mengambil QR Code');
    }
  };

  useEffect(() => {
    setUsername(credentials?.username || '');
    setPassword(credentials?.password || '');
    (async () => {
      try {
        const r = await getConnectionSettings();
        const s = r.data || {};
        if (s.base_url) setHost(s.base_url);
        if (s.device_id) setActiveDevice(String(s.device_id));
      } catch {}
    })();
  }, [credentials?.username, credentials?.password]);

  // Auto close QR dialog if device becomes connected
  useEffect(() => {
    const isConnected = currentDevice?.connected || (currentDevice as any)?.status === 'CONNECTED' || (currentDevice as any)?.state === 'logged_in';
    if (isConnected && qrDialogOpen) {
      toast.success('Login berhasil', {
        duration: 3000,
      });
      
      const timer = setTimeout(() => {
        setQrDialogOpen(false);
        setQrCodeUrl(null);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentDevice?.connected, qrDialogOpen]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Atur koneksi GoWA dan pantau status sistem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Koneksi GoWA
            </CardTitle>
            <CardDescription>Status server API GoWA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full p-3 bg-primary/10">
                  {serverOnline ? <Wifi className="h-6 w-6 text-primary" /> : <WifiOff className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-semibold">Status Server</p>
                  <p className="text-sm text-muted-foreground">{serverOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <Badge variant={serverOnline ? 'default' : 'secondary'} className={serverOnline ? 'bg-primary' : ''}>
                {serverOnline ? 'Terhubung' : 'Terputus'}
              </Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => refetchServerStatus()} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Cek Koneksi
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Koneksi WhatsApp
            </CardTitle>
            <CardDescription>Status hubungan ke WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            {currentDevice ? (
               (() => {
                 const isConnected = currentDevice.connected || (currentDevice as any).status === 'CONNECTED' || (currentDevice as any).state === 'logged_in';
                 return (
                   <div className="flex flex-col gap-4">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                           <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
                              <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
                           </div>
                           <div>
                              <p className="font-semibold">{currentDevice.phone || (currentDevice as any).jid ? `+${(currentDevice.phone || (currentDevice as any).jid).split('@')[0]}` : currentDevice.name || 'WhatsApp'}</p>
                              <p className="text-sm text-muted-foreground">{isConnected ? 'Siap digunakan' : 'Terputus'}</p>
                           </div>
                        </div>
                        <Badge 
                          variant={isConnected ? 'default' : 'secondary'}
                          className={isConnected ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                           {isConnected ? 'Active' : 'Available'}
                        </Badge>
                     </div>
                     
                     <div className="flex flex-col gap-2">
                       <Button 
                         variant="outline"
                         onClick={() => handleConnect(currentDeviceId as string)} 
                         className={`w-full ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                         disabled={isConnected}
                       >
                         <QrCode className="mr-2 h-4 w-4" />
                         Scan QR Code
                       </Button>
                       
                       {isConnected && (
                         <Button 
                           variant="destructive" 
                           onClick={() => handleLogoutDevice(currentDeviceId as string)} 
                           className="w-full"
                         >
                           <LogOut className="mr-2 h-4 w-4" />
                           Putuskan Koneksi
                         </Button>
                       )}
                     </div>
                   </div>
                 );
               })()
            ) : (
               <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Belum ada sesi WhatsApp yang aktif</p>
                  <Button onClick={() => navigate('/devices')}>
                     <QrCode className="mr-2 h-4 w-4" />
                     Monitor Perangkat
                  </Button>
               </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Login GoWA</CardTitle>
            <CardDescription>Konfigurasi akses ke server GoWA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Host URL</Label>
                <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="https://gowa.ekacode.web.id" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin" />
                </div>
              </div>
            </div>
            <Button onClick={handleLogin} disabled={loginLoading} className="mt-4 w-full md:w-auto">
                <LogIn className="mr-2 h-4 w-4" />
                {loginLoading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle>Webhook Console</CardTitle>
          <CardDescription>Pantau event webhook yang diterima secara real-time</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-2 mb-4">
            <Button variant="outline" onClick={() => refetchWebhook()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Muat Ulang
            </Button>
            <Button variant="destructive" onClick={handleClearWebhook}>
              <Trash2 className="mr-2 h-4 w-4" />
              Bersihkan Log
            </Button>
          </div>
          <div className="rounded-md border">
            {Array.isArray(webhookEventsData) && webhookEventsData.length > 0 ? (
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Pengirim</TableHead>
                    <TableHead>Pesan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookEventsData.map((event: any, i: number) => {
                     const timestamp = event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : '-';
                     const isMessage = event.type === 'message' || !!event.message;
                     const sender = event.pushname || event.sender_id || '-';
                     const text = event.message?.text || event.message?.conversation || '-';
                     
                     return (
                        <TableRow key={i}>
                           <TableCell>{timestamp}</TableCell>
                           <TableCell><Badge variant="outline">{event.type || 'message'}</Badge></TableCell>
                           <TableCell>{sender}</TableCell>
                           <TableCell className="max-w-[300px] truncate">{text}</TableCell>
                        </TableRow>
                     );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Belum ada data webhook yang diterima
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Buka WhatsApp di HP Anda, menu Perangkat Tautkan, lalu scan QR Code ini.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 border rounded-lg" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <p>Memuat QR Code...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
