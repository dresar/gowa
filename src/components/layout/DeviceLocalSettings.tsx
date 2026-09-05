import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocalDevices, saveLocalDevice } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Settings, Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DeviceLocalSettingsProps {
  deviceId: string;
  deviceName: string;
}

export function DeviceLocalSettings({ deviceId, deviceName }: DeviceLocalSettingsProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const localDevicesQuery = useQuery({
    queryKey: ['localDevices'],
    queryFn: () => getLocalDevices().then(res => res.data),
  });

  const localInfo = localDevicesQuery.data?.results?.find((d: any) => d.id === deviceId);

  const [formData, setFormData] = useState({
    id: deviceId,
    name: localInfo?.name || deviceName,
    specs: localInfo?.specs || {
      platform: '',
      manufacturer: '',
      model: '',
    },
    status: localInfo?.status || 'active',
    schedules: localInfo?.schedules || [],
  });

  const saveMutation = useMutation({
    mutationFn: saveLocalDevice,
    onSuccess: () => {
      toast.success('Pengaturan lokal berhasil disimpan');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['localDevices'] });
      queryClient.invalidateQueries({ queryKey: ['detectedDevice'] });
    },
  });

  const handleAddSchedule = () => {
    setFormData({
      ...formData,
      schedules: [
        ...formData.schedules,
        { day: 'Everyday', startTime: '08:00', endTime: '17:00' }
      ]
    });
  };

  const handleRemoveSchedule = (index: number) => {
    const newSchedules = [...formData.schedules];
    newSchedules.splice(index, 1);
    setFormData({ ...formData, schedules: newSchedules });
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setFormData({ ...formData, schedules: newSchedules });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) {
        setFormData({
          id: deviceId,
          name: localInfo?.name || deviceName,
          specs: localInfo?.specs || { platform: '', manufacturer: '', model: '' },
          status: localInfo?.status || 'active',
          schedules: localInfo?.schedules || [],
        });
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 flex-1">
          <Settings className="h-4 w-4" /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pengaturan Lokal: {deviceName}</DialogTitle>
          <DialogDescription>
            Atur spesifikasi teknis dan jadwal operasional perangkat ini.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Input 
                value={formData.specs.platform} 
                onChange={e => setFormData({...formData, specs: {...formData.specs, platform: e.target.value}})}
                placeholder="misal: Android, iOS"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Manufaktur</label>
              <Input 
                value={formData.specs.manufacturer} 
                onChange={e => setFormData({...formData, specs: {...formData.specs, manufacturer: e.target.value}})}
                placeholder="misal: Samsung, Apple"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Input 
                value={formData.specs.model} 
                onChange={e => setFormData({...formData, specs: {...formData.specs, model: e.target.value}})}
                placeholder="misal: Galaxy S21, iPhone 13"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                className="w-full border rounded-md p-2 text-sm"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" /> Jadwal Operasional
              </h4>
              <Button type="button" variant="ghost" size="sm" onClick={handleAddSchedule} className="h-8 gap-1">
                <Plus className="h-3 w-3" /> Tambah Jadwal
              </Button>
            </div>
            
            {formData.schedules.length === 0 && (
              <p className="text-xs text-muted-foreground italic">Belum ada jadwal yang diatur.</p>
            )}

            {formData.schedules.map((schedule: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <select 
                  className="border rounded-md p-1 text-xs"
                  value={schedule.day}
                  onChange={e => handleScheduleChange(index, 'day', e.target.value)}
                >
                  <option value="Everyday">Setiap Hari</option>
                  <option value="Monday">Senin</option>
                  <option value="Tuesday">Selasa</option>
                  <option value="Wednesday">Rabu</option>
                  <option value="Thursday">Kamis</option>
                  <option value="Friday">Jumat</option>
                  <option value="Saturday">Sabtu</option>
                  <option value="Sunday">Minggu</option>
                </select>
                <Input 
                  type="time" 
                  className="h-8 text-xs w-28"
                  value={schedule.startTime}
                  onChange={e => handleScheduleChange(index, 'startTime', e.target.value)}
                />
                <span className="text-xs">s/d</span>
                <Input 
                  type="time" 
                  className="h-8 text-xs w-28"
                  value={schedule.endTime}
                  onChange={e => handleScheduleChange(index, 'endTime', e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleRemoveSchedule(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
          <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
