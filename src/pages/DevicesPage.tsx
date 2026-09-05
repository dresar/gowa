import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllDevices, 
  createDevice as createRemoteDevice, 
  deleteDevice as deleteRemoteDevice, 
  loginDevice, 
  logoutDevice, 
  reconnectDevice,
  loginDefaultApp,
  detectActiveDevice,
  getLocalDevices,
  isDeviceConnected
} from '@/lib/api';
import { DeviceLocalSettings } from '@/components/layout/DeviceLocalSettings';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Smartphone, RefreshCw, LogOut, QrCode, Clock, Cpu, Calendar, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/contexts/AuthContext';

export default function DevicesPage() {
  const { isServerOnline } = useAuth();
  const [newDeviceId, setNewDeviceId] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [selectedDeviceForQr, setSelectedDeviceForQr] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Poll devices every 2 seconds for "real-time" monitoring
  const devicesQuery = useQuery({
    queryKey: ['allDevices'],
    queryFn: getAllDevices,
    refetchInterval: isServerOnline ? 2000 : false,
    enabled: isServerOnline,
  });

  const localDevicesQuery = useQuery({
    queryKey: ['localDevices'],
    queryFn: () => getLocalDevices().then(res => res.data),
    refetchInterval: isServerOnline ? 5000 : false,
    enabled: isServerOnline,
  });

  const detectedQuery = useQuery({
    queryKey: ['detectedDevice'],
    queryFn: () => detectActiveDevice().then(res => res.data),
    refetchInterval: isServerOnline ? 10000 : false,
    enabled: isServerOnline,
  });

  const getDevicesList = () => {
    // ... (logic remains same)
    const data = devicesQuery.data?.data;
    const rootData = devicesQuery.data;

    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(rootData?.results)) return rootData.results;
    if (Array.isArray(data)) return data;
    if (Array.isArray(rootData?.data)) return rootData.data;
    
    return [];
  };

  const devices = getDevicesList();
  const localDevices = localDevicesQuery.data?.results || [];
  const detectedId = detectedQuery.data?.data?.id;

  // ... (useEffect remains same)

  // Watch for connection success to close QR modal
  useEffect(() => {
    if (selectedDeviceForQr && isQrDialogOpen) {
      const currentDevice = devices.find((d: any) => (d.device_id || d.id) === selectedDeviceForQr);
      const isConnected = isDeviceConnected(currentDevice);
      
      if (isConnected) {
        toast.success('Login berhasil', {
          duration: 3000,
        });
        
        // Auto close modal
        const timer = setTimeout(() => {
          setIsQrDialogOpen(false);
          setSelectedDeviceForQr(null);
          setQrCode(null);
        }, 500); // Small delay to let user see the success state
        
        return () => clearTimeout(timer);
      }
    }
  }, [devices, selectedDeviceForQr, isQrDialogOpen]);

  const createDeviceMutation = useMutation({
    mutationFn: createRemoteDevice,
    onSuccess: () => {
      toast.success('Perangkat berhasil didaftarkan. Silakan klik tombol "Scan QR" pada kartu perangkat untuk menghubungkan WhatsApp.');
      setIsAddDialogOpen(false);
      setNewDeviceId('');
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan perangkat');
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: deleteRemoteDevice,
    onSuccess: () => {
      toast.success('Perangkat berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus perangkat');
    },
  });

  const logoutDeviceMutation = useMutation({
    mutationFn: logoutDevice,
    onSuccess: () => {
      toast.success('Logout berhasil');
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal logout');
    },
  });
  
  const reconnectDeviceMutation = useMutation({
    mutationFn: reconnectDevice,
    onSuccess: () => {
      toast.success('Perintah reconnect dikirim');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal reconnect');
    },
  });

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newDeviceId.trim();
    if (!id) return;
    
    // Validasi ID perangkat: hanya boleh huruf, angka, dan dash/underscore
    const idRegex = /^[a-zA-Z0-9-_]+$/;
    if (!idRegex.test(id)) {
      toast.error('ID Perangkat hanya boleh berisi huruf, angka, tanda hubung (-), atau garis bawah (_). Tanpa spasi.');
      return;
    }

    createDeviceMutation.mutate(id);
  };

  const handleShowQr = async (deviceId: string) => {
    // Session check: prevent QR modal if already connected
    const device = devices.find((d: any) => (d.device_id || d.id) === deviceId);
    if (isDeviceConnected(device)) {
      toast.success('Perangkat sudah terhubung (Active)');
      return;
    }

    try {
      setSelectedDeviceForQr(deviceId);
      setIsQrDialogOpen(true);
      setQrCode(null); // Reset QR code before fetching
      try {
        const res = await loginDevice(deviceId);
        
        // Handle "already logged in" case from backend
        if (res.message === 'Already logged in' || res.data?.results?.status === 'CONNECTED') {
          toast.success('Login berhasil');
          setIsQrDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ['allDevices'] });
          return;
        }

        const qr = res.data?.results?.qr_link || res.data?.results?.qr_code || res.data?.data?.qr;
        if (qr) {
          setQrCode(qr);
          return;
        }
      } catch (e: any) { 
        console.error('Login error details:', e.response?.data);
      }
      
      toast.error('Gagal mengambil QR Code. Pastikan server GoWA sudah dalam mode REST.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengambil QR Code');
    }
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitor Perangkat</h1>
          <p className="text-muted-foreground">Kelola semua perangkat WhatsApp Anda secara real-time.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!isServerOnline}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Perangkat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Perangkat Baru</DialogTitle>
              <DialogDescription>
                Masukkan ID unik untuk mendaftarkan perangkat WhatsApp baru di server GoWA.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDevice}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="deviceId" className="text-sm font-medium">ID Perangkat</label>
                  <Input
                    id="deviceId"
                    placeholder="Contoh: marketing-01, cs-jakarta"
                    value={newDeviceId}
                    onChange={(e) => setNewDeviceId(e.target.value)}
                    autoFocus
                  />
                  <p className="text-[12px] text-muted-foreground">
                    Gunakan huruf, angka, atau tanda hubung. Jangan gunakan spasi atau simbol khusus.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createDeviceMutation.isPending}>
                  {createDeviceMutation.isPending ? 'Mendaftarkan...' : 'Daftarkan Perangkat'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!isServerOnline && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold text-destructive">Server Tidak Terjangkau</h2>
            <p className="text-muted-foreground max-w-md mt-2">
              Aplikasi tidak dapat terhubung ke server GoWA. Pastikan backend server Anda sudah dijalankan agar dapat mengelola perangkat.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {isServerOnline && (
        <>
          {devicesQuery.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-64 rounded-2xl" />
          ))}
        </div>
      ) : devicesQuery.isError ? (
        <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
          <p>Gagal memuat perangkat.</p>
          <Button variant="outline" className="mt-4" onClick={() => devicesQuery.refetch()}>Coba Lagi</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {devices.map((device: any) => {
            const devId = device.device_id || device.id;
            const isConnected = device.status === 'CONNECTED' || device.connected || device.state === 'logged_in';
            const localInfo = localDevices.find((ld: any) => ld.id === devId);
            const isDetected = detectedId === devId;

            return (
              <Card key={devId} className={`group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/50 backdrop-blur-sm rounded-2xl ${isDetected ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                {/* Status Glow Effect */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 blur-3xl opacity-20 transition-colors duration-500 ${isConnected ? 'bg-green-500' : 'bg-orange-500'}`} />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${isConnected ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                          <Smartphone className={`h-5 w-5 ${isConnected ? 'text-green-500' : 'text-orange-500'}`} />
                        </div>
                        <CardTitle className="text-xl font-bold tracking-tight">{devId}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded-lg">
                        <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                        {device.phone || device.jid ? `+${(device.phone || device.jid).split('@')[0]}` : 'Unlinked Device'}
                      </div>
                    </div>
                    <Badge 
                      variant={isConnected ? 'default' : 'secondary'}
                      className={`${isConnected ? 'bg-green-500/15 text-green-600 hover:bg-green-500/20' : 'bg-orange-500/15 text-orange-600'} border-none font-black text-[10px] tracking-wider px-2.5 py-1 rounded-full`}
                    >
                      {isConnected ? 'ACTIVE' : 'OFFLINE'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-4 space-y-5 relative z-10">
                  {/* 2 Column Grid for Settings/Specs */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-white/10 shadow-inner">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-black text-muted-foreground/70 tracking-widest">Platform</span>
                      <div className="text-xs font-bold flex items-center gap-1.5 truncate">
                        <Cpu className="h-3 w-3 text-blue-500" /> {localInfo?.specs?.platform || device.platform || '-'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-black text-muted-foreground/70 tracking-widest">Manufacturer</span>
                      <div className="text-xs font-bold truncate">{localInfo?.specs?.manufacturer || '-'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-black text-muted-foreground/70 tracking-widest">Device Name</span>
                      <div className="text-xs font-bold truncate">{localInfo?.name || device.name || device.display_name || '-'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-black text-muted-foreground/70 tracking-widest">System</span>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]'}`} />
                        {isConnected ? 'Ready' : 'Standby'}
                      </div>
                    </div>
                  </div>

                  {localInfo?.schedules && localInfo.schedules.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-black uppercase text-muted-foreground/80 flex items-center gap-1.5 tracking-widest px-1">
                        <Calendar className="h-3 w-3 text-primary" /> Schedule
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {localInfo.schedules.map((s: any, idx: number) => (
                          <div key={idx} className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20">
                            {s.day === 'Everyday' ? 'Harian' : s.day.substring(0, 3)}: {s.startTime}-{s.endTime}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {localInfo?.lastUpdated && (
                    <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground font-medium italic opacity-70">
                      <Clock className="h-2.5 w-2.5" />
                      Sync: {new Date(localInfo.lastUpdated).toLocaleTimeString()}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2 pb-6 px-6 relative z-10">
                  {/* Row 1: Settings & Logout */}
                  <div className="flex w-full gap-2.5">
                    <DeviceLocalSettings 
                      deviceId={devId} 
                      deviceName={localInfo?.name || device.name || device.display_name || devId} 
                    />
                    
                    {isConnected && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 font-bold text-orange-600 border-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all rounded-xl h-10 shadow-sm"
                        onClick={() => logoutDeviceMutation.mutate(devId)}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Button>
                    )}
                  </div>
                  
                  {/* Row 2: Scan QR (Main Action if not connected) */}
                  {!isConnected && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full font-bold h-11 shadow-lg hover:shadow-primary/20 transition-all rounded-xl bg-primary hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => handleShowQr(devId)}
                    >
                      <QrCode className="mr-2 h-5 w-5" /> SCAN QR CODE
                    </Button>
                  )}

                  {/* Row 3: Hapus (Bottom) */}
                  <button 
                    className="w-full text-muted-foreground hover:text-destructive transition-colors h-8 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                    onClick={() => {
                      if (confirm('Yakin ingin menghapus perangkat ini?')) {
                        deleteDeviceMutation.mutate(devId);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove Device
                  </button>
                </CardFooter>
              </Card>
            );
          })}
          
          {devices.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
              <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Belum ada perangkat</h3>
              <p className="text-muted-foreground mb-4">Tambahkan perangkat baru untuk mulai menggunakan WhatsApp.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Tambah Perangkat
              </Button>
            </div>
          )}
        </div>
      )}
        </>
      )}

      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code - {selectedDeviceForQr}</DialogTitle>
            <DialogDescription>
              Buka WhatsApp di HP Anda, masuk ke menu Perangkat Tertaut, lalu arahkan kamera ke kode QR di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            {qrCode ? (
              String(qrCode).startsWith('http') ? (
                <img src={qrCode} alt="QR Code" className="h-64 w-64 object-contain rounded-md border" />
              ) : (
                <QRCodeSVG value={qrCode} size={256} />
              )
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Mengambil QR Code...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
