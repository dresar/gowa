import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { MessageSquare, Plus, Trash2, Search, Upload, Download, RefreshCw, Settings, Smartphone, Users, Ban, CheckCircle2, XCircle } from 'lucide-react';
import { 
  getAutoReplies, 
  addAutoReply, 
  deleteAutoReply, 
  getAutoReplySettings, 
  updateAutoReplySettings,
  getAllDevices,
  getLocalDevices
} from '@/lib/api';

import { useAuth } from '@/contexts/AuthContext';
import { DeviceSelector } from '@/components/layout/DeviceSelector';
import { Cpu, Calendar, Clock } from 'lucide-react';

export default function AutoReplyPage() {
  const { deviceId, isServerOnline } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReply, setNewReply] = useState({ contains: '', reply: '' });
  const [importing, setImporting] = useState(false);
  const [newNumber, setNewNumber] = useState('');

  // Queries
  const { data: autoRepliesData } = useQuery({
    queryKey: ['autoReplies'],
    queryFn: () => getAutoReplies().then((res) => res.data),
    enabled: isServerOnline
  });

  const { data: settingsData } = useQuery({
    queryKey: ['autoReplySettings'],
    queryFn: () => getAutoReplySettings().then((res) => res.data),
    enabled: isServerOnline
  });

  const { data: devicesData } = useQuery({
    queryKey: ['allDevices'],
    queryFn: getAllDevices,
    enabled: isServerOnline
  });

  const { data: localDevicesData } = useQuery({
    queryKey: ['localDevices'],
    queryFn: () => getLocalDevices().then(res => res.data),
    enabled: isServerOnline,
  });

  const localDevices = localDevicesData?.results || [];

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: updateAutoReplySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoReplySettings'] });
      toast.success('Pengaturan diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui pengaturan')
  });

  const rules = (autoRepliesData?.rules || []).filter((r: any) => 
    (r.contains || '').toLowerCase().includes(search.toLowerCase()) || 
    (r.reply || '').toLowerCase().includes(search.toLowerCase())
  );

  const devices = Array.isArray(devicesData?.data) ? devicesData.data : (Array.isArray(devicesData?.data?.results) ? devicesData.data.results : []);

  const handleAdd = async () => {
    if (!newReply.contains || !newReply.reply) {
      toast.error('Isi semua field');
      return;
    }
    try {
      await addAutoReply({
        contains: newReply.contains.toLowerCase(),
        reply: newReply.reply
      });
      toast.success('Auto reply berhasil ditambahkan');
      setDialogOpen(false);
      setNewReply({ contains: '', reply: '' });
      queryClient.invalidateQueries({ queryKey: ['autoReplies'] });
    } catch (e: any) {
      toast.error('Gagal menambah auto reply');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAutoReply(id);
      toast.success('Auto reply dihapus');
      queryClient.invalidateQueries({ queryKey: ['autoReplies'] });
    } catch (e) {
      toast.error('Gagal menghapus');
    }
  };

  const toggleGlobal = (checked: boolean) => {
    updateSettingsMutation.mutate({ globalEnabled: checked });
  };

  const toggleDevice = (devId: string, disabled: boolean) => {
    const currentDisabled = settingsData?.disabledDevices || [];
    const nextDisabled = disabled 
      ? [...currentDisabled, devId]
      : currentDisabled.filter((id: string) => id !== devId);
    
    updateSettingsMutation.mutate({ disabledDevices: nextDisabled });
  };

  const addDisabledNumber = () => {
    if (!newNumber) return;
    const cleanNumber = newNumber.replace(/\D/g, '');
    const currentDisabled = settingsData?.disabledNumbers || [];
    if (currentDisabled.includes(cleanNumber)) {
      toast.error('Nomor sudah ada di daftar');
      return;
    }
    updateSettingsMutation.mutate({ disabledNumbers: [...currentDisabled, cleanNumber] });
    setNewNumber('');
  };

  const removeDisabledNumber = (num: string) => {
    const currentDisabled = settingsData?.disabledNumbers || [];
    updateSettingsMutation.mutate({ 
      disabledNumbers: currentDisabled.filter((n: string) => n !== num) 
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
        const text = await file.text();
        const lines = text.split('\n');
        let successCount = 0;

        const startIdx = lines[0].toLowerCase().includes('contains') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',');
          if (parts.length >= 2) {
              const contains = parts[0].trim().toLowerCase();
              const reply = parts.slice(1).join(',').trim();
              
              if (contains && reply) {
                try {
                    await addAutoReply({ contains, reply });
                    successCount++;
                } catch (e) {}
              }
          }
        }
        
        toast.success(`${successCount} auto reply berhasil diimport`);
        queryClient.invalidateQueries({ queryKey: ['autoReplies'] });
    } catch (e) {
        toast.error('Gagal membaca file');
    } finally {
        setImporting(false);
        e.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const content = "kata_kunci,pesan_balasan\nhalo,Halo! Ada yang bisa dibantu?\nharga,Silakan cek katalog kami.";
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_autoreply.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Auto Reply Manager</h1>
          <p className="text-muted-foreground">Kelola balasan otomatis global, pengecualian perangkat, dan daftar blokir nomor.</p>
        </div>
        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Status Global</span>
              <span className="text-xs text-muted-foreground">Aktifkan untuk semua device</span>
            </div>
            <Switch 
              checked={settingsData?.globalEnabled ?? true} 
              onCheckedChange={toggleGlobal}
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Aturan
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> Perangkat
          </TabsTrigger>
          <TabsTrigger value="numbers" className="flex items-center gap-2">
            <Ban className="h-4 w-4" /> Nomor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kata kunci atau balasan..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadTemplate} size="sm" className="hidden sm:flex">
                    <Download className="mr-2 h-4 w-4" /> Template
                  </Button>
                  <div className="relative">
                    <Input 
                      type="file" 
                      accept=".csv,.txt" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileUpload}
                      disabled={importing}
                    />
                    <Button variant="outline" size="sm" disabled={importing}>
                      {importing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      Import
                    </Button>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Baru
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Auto Reply</DialogTitle>
                        <DialogDescription>Aturan ini akan berlaku global untuk semua perangkat yang tidak dinonaktifkan.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Kata Kunci (Mengandung)</Label>
                          <Input 
                            value={newReply.contains} 
                            onChange={(e) => setNewReply({...newReply, contains: e.target.value})}
                            placeholder="Contoh: harga"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pesan Balasan</Label>
                          <Input 
                            value={newReply.reply} 
                            onChange={(e) => setNewReply({...newReply, reply: e.target.value})}
                            placeholder="Contoh: Harga mulai 50rb"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAdd}>Simpan Aturan</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kata Kunci</TableHead>
                      <TableHead>Balasan</TableHead>
                      <TableHead className="w-[100px] text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.length > 0 ? (
                      rules.map((rule: any) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono">{rule.contains}</Badge>
                          </TableCell>
                          <TableCell>{rule.reply}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(rule.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          {search ? 'Tidak ditemukan hasil pencarian' : 'Belum ada data auto reply'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle className="text-xl font-bold tracking-tight">Pengecualian Perangkat</CardTitle>
              <CardDescription>Pilih perangkat mana yang akan menjalankan auto reply. Matikan switch untuk menonaktifkan auto reply pada perangkat tersebut.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {devices.length > 0 ? (
                  devices.map((dev: any) => {
                    const devId = dev.device_id || dev.id;
                    const isDisabled = settingsData?.disabledDevices?.includes(devId);
                    const isConnected = dev.status === 'CONNECTED' || dev.connected || dev.state === 'logged_in';
                    const localInfo = localDevices.find((ld: any) => ld.id === devId);
                    
                    return (
                      <Card key={devId} className={`group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/50 backdrop-blur-sm rounded-2xl ${isDisabled ? 'opacity-70 grayscale-[0.5]' : ''}`}>
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
                                {dev.phone || dev.jid ? `+${(dev.phone || dev.jid).split('@')[0]}` : 'Unlinked Device'}
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

                        <CardContent className="pb-6 space-y-5 relative z-10">
                          {/* 2 Column Grid for Settings/Specs */}
                          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-white/10 shadow-inner">
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-black text-muted-foreground/70 tracking-widest">Platform</span>
                              <div className="text-xs font-bold flex items-center gap-1.5 truncate">
                                <Cpu className="h-3 w-3 text-blue-500" /> {localInfo?.specs?.platform || dev.platform || '-'}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-black text-muted-foreground/70 tracking-widest">System</span>
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]'}`} />
                                {isConnected ? 'Ready' : 'Standby'}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-black text-muted-foreground/70 tracking-widest">Auto Reply</span>
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <div className={`h-1.5 w-1.5 rounded-full ${isDisabled ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`} />
                                {isDisabled ? 'Disabled' : 'Enabled'}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-black text-muted-foreground/70 tracking-widest">Last Sync</span>
                              <div className="text-xs font-bold truncate">{localInfo?.lastUpdated ? new Date(localInfo.lastUpdated).toLocaleTimeString() : '-'}</div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-muted/50 flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-[0.1em]">Status Auto Reply</span>
                              <span className="text-[10px] font-medium text-muted-foreground italic">
                                {isDisabled ? 'Ignoring messages' : 'Answering automatically'}
                              </span>
                            </div>
                            <Switch 
                              checked={!isDisabled} 
                              onCheckedChange={(checked) => toggleDevice(devId, !checked)}
                              className="data-[state=checked]:bg-green-500 shadow-sm"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
                    <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-bold tracking-tight">Tidak ada perangkat ditemukan</h3>
                    <p className="text-muted-foreground text-sm">Pastikan Anda sudah mendaftarkan perangkat di menu Monitor Perangkat.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numbers">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blokir Nomor</CardTitle>
                <CardDescription>Nomor di daftar ini tidak akan pernah menerima balasan otomatis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Contoh: 62812345678" 
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDisabledNumber()}
                  />
                  <Button onClick={addDisabledNumber}>Tambah</Button>
                </div>
                <div className="rounded-md border h-[300px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nomor Telepon</TableHead>
                        <TableHead className="w-[80px] text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settingsData?.disabledNumbers?.length > 0 ? (
                        settingsData.disabledNumbers.map((num: string) => (
                          <TableRow key={num}>
                            <TableCell className="font-mono text-sm">{num}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeDisabledNumber(num)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                            Belum ada nomor yang diblokir
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> Informasi Sistem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p><strong>Real-time JSON Storage:</strong> Semua pengaturan disimpan langsung ke <code>autoReply.json</code> di server.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p><strong>Global Sync:</strong> Perubahan yang Anda lakukan di sini akan langsung berdampak pada semua perangkat yang terkoneksi.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p><strong>Hierarki Blokir:</strong> Pesan akan dicek melalui Global Switch &rarr; Device Status &rarr; Blocked Number &rarr; Keyword Matching.</p>
                </div>
                <div className="mt-4 p-3 bg-background rounded-lg border text-[12px] font-mono">
                  Status: {settingsData?.globalEnabled ? 'GLOBAL ACTIVE' : 'GLOBAL DISABLED'}
                  <br />
                  Devices Excluded: {settingsData?.disabledDevices?.length || 0}
                  <br />
                  Numbers Blocked: {settingsData?.disabledNumbers?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
