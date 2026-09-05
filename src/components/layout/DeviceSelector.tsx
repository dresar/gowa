import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Smartphone, Clock, RefreshCw } from 'lucide-react';
import {
  getAllDevices,
  detectActiveDevice,
  isDeviceConnected
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Device {
  device_id?: string;
  id?: string;
  name?: string;
  phone?: string;
  status?: string;
  connected?: boolean;
  state?: string;
}

export function DeviceSelector() {
  const { deviceId, setActiveDevice, isServerOnline } = useAuth();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: devicesData, isLoading: isDevicesLoading, isError: isDevicesError, refetch: refetchDevices } = useQuery({
    queryKey: ['allDevices'],
    queryFn: () => getAllDevices().then((res) => res.data),
    refetchInterval: isServerOnline ? 5000 : false,
    enabled: isServerOnline,
  });

  const { data: detectedData, refetch: refetchDetected } = useQuery({
    queryKey: ['detectedDevice'],
    queryFn: () => detectActiveDevice().then((res) => res.data),
    refetchInterval: isServerOnline ? 10000 : false,
    enabled: isServerOnline,
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchDevices(), refetchDetected()]);
      queryClient.invalidateQueries({ queryKey: ['localDevices'] });
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const getDevicesList = (): Device[] => {
    if (!devicesData) return [];
    
    let list: any[] = [];
    
    // Check priority: devicesData.results, devicesData.data.results, devicesData.data, devicesData
    if (Array.isArray(devicesData.results)) list = devicesData.results;
    else if (Array.isArray(devicesData.data?.results)) list = devicesData.data.results;
    else if (Array.isArray(devicesData.data)) list = devicesData.data;
    else if (Array.isArray(devicesData)) list = devicesData;

    return list.filter((d: Device) => d && (d.device_id || d.id));
  };

  const devices = getDevicesList();

  // Auto-detect and cleanup mechanism
  useEffect(() => {
    if (!isServerOnline || devices.length === 0) return;

    // 1. Cleanup: If deviceId is set but doesn't exist in the list anymore
    if (deviceId) {
      const exists = devices.some(d => (d.device_id || d.id) === deviceId);
      if (!exists) {
        setActiveDevice(null);
        return;
      }
    }

    // 2. Auto-switch to scheduled device if detected
    const detectedDevice = detectedData?.data || detectedData;
    if (detectedDevice && (detectedDevice.device_id || detectedDevice.id)) {
      const detectedId = detectedDevice.device_id || detectedDevice.id;
      if (detectedId !== deviceId) {
        setActiveDevice(detectedId);
        return;
      }
    } 

    // 3. Initial pick: If no device is selected but we have devices
    if (!deviceId) {
      const activeDevice = devices.find(d => isDeviceConnected(d));
      
      const targetId = activeDevice 
        ? (activeDevice.device_id || activeDevice.id) 
        : (devices[0].device_id || devices[0].id);
        
      if (targetId) {
        setActiveDevice(targetId as string);
      }
    }
  }, [devices, detectedData, deviceId, setActiveDevice, isServerOnline]);

  const currentDevice = devices.find((d) => (d.device_id || d.id) === deviceId);
  const isConnected = isDeviceConnected(currentDevice);
  const detectedDeviceData = detectedData?.data || detectedData;
  const isScheduled = detectedDeviceData?.device_id === deviceId || detectedDeviceData?.id === deviceId;

  return (
    <div className="flex items-center justify-between mb-6 p-3 border rounded-xl bg-card shadow-sm transition-all duration-300 hover:shadow-md gap-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-lg shrink-0 transition-colors duration-500 ${isConnected ? 'bg-green-500/10' : 'bg-primary/10'}`}>
          <Smartphone className={`h-5 w-5 transition-colors duration-500 ${isConnected ? 'text-green-600' : 'text-primary'}`} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-none mb-1 truncate">WhatsApp</h3>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
              {isConnected ? 'Terhubung' : deviceId ? 'Terputus' : 'Pilih Perangkat'}
            </p>
            {isScheduled && (
              <span className="flex items-center gap-1 text-[10px] text-blue-500 font-medium animate-pulse">
                <Clock className="h-3 w-3" /> Jadwal Aktif
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={handleManualRefresh}
          disabled={isRefreshing || !isServerOnline}
          className={`p-2 rounded-lg transition-all hover:bg-accent disabled:opacity-50 ${isRefreshing ? 'animate-spin text-primary' : 'text-muted-foreground'}`}
          title="Refresh Perangkat"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <Select 
          value={deviceId || ""} 
          onValueChange={(val) => setActiveDevice(val)}
          disabled={isDevicesLoading || !isServerOnline}
        >
          <SelectTrigger 
            className={`w-[160px] sm:w-[200px] h-9 text-xs transition-all duration-300 bg-background border-muted-foreground/20 hover:border-primary/50 ${
              !deviceId ? 'border-destructive/30' : isConnected ? 'border-green-500/30' : 'border-yellow-500/30'
            }`}
          >
            <div className="flex items-center gap-2 truncate w-full">
              {deviceId && (
                <div className={`h-2 w-2 rounded-full shrink-0 transition-all duration-500 ${
                  isConnected ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.4)]'
                }`} />
              )}
              <div className="truncate flex-1 text-left">
                {currentDevice ? (
                  <span className="truncate">{currentDevice.name || currentDevice.phone || "WhatsApp"}</span>
                ) : deviceId ? (
                  <span className="text-muted-foreground italic">Memuat perangkat...</span>
                ) : (
                  <SelectValue placeholder="Pilih Perangkat" />
                )}
              </div>
            </div>
          </SelectTrigger>
          <SelectContent className="z-[100] max-h-[280px]">
            {!isServerOnline ? (
              <div className="p-4 text-center text-xs text-destructive">Server Offline</div>
            ) : isDevicesLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin mx-auto mb-2" />
                Memuat...
              </div>
            ) : isDevicesError ? (
              <div className="p-4 text-center text-xs text-destructive font-medium">
                Gagal memuat perangkat
                <Button variant="ghost" size="sm" className="mt-2 w-full text-[10px]" onClick={() => refetchDevices()}>
                  Coba Lagi
                </Button>
              </div>
            ) : devices.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <Smartphone className="h-8 w-8 opacity-20" />
                <span>Tidak ada perangkat terdaftar</span>
                <Button variant="link" size="sm" className="text-[10px]" onClick={() => window.location.href='/devices'}>
                  Tambah Perangkat
                </Button>
              </div>
            ) : (
              devices.map((d) => {
                const id = (d.device_id || d.id) as string;
                const connected = d.status === 'CONNECTED' || d.connected || d.state === 'logged_in';
                const name = d.name || d.phone || "WhatsApp";
                
                return (
                  <SelectItem 
                    key={id} 
                    value={id}
                    className="cursor-pointer py-2.5 text-xs transition-colors focus:bg-accent"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${
                        connected ? 'bg-green-500 shadow-[0_0_3px_rgba(34,197,94,0.4)]' : 'bg-muted-foreground/30'
                      }`} />
                      <div className="flex flex-col min-w-0">
                        <span className={`font-medium truncate ${id === deviceId ? 'text-primary' : ''}`}>{name}</span>
                        <span className="text-[9px] text-muted-foreground opacity-60">ID: {id.substring(0, 12)}...</span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
