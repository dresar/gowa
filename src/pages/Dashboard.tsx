import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkServerStatus, getDevices, getMyGroups, getMyContacts } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Smartphone,
  Users,
  Contact,
  MessageCircle,
  Wifi,
  WifiOff,
  Server,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { DeviceSelector } from '@/components/layout/DeviceSelector';

export default function Dashboard() {
  const { deviceId, isServerOnline } = useAuth();

  const { data: serverStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['serverStatus'],
    queryFn: () => checkServerStatus().then((res) => res.data),
    refetchInterval: isServerOnline ? 30000 : false,
    enabled: isServerOnline,
  });

  const { data: devicesData } = useQuery({
    queryKey: ['devices'],
    queryFn: () => getDevices().then((res) => res.data),
    enabled: isServerOnline,
  });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups', deviceId],
    queryFn: () => getMyGroups().then((res) => res.data),
    enabled: isServerOnline && !!deviceId,
  });

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts', deviceId],
    queryFn: () => getMyContacts().then((res) => res.data),
    enabled: isServerOnline && !!deviceId,
  });

  const isDataLoading = groupsLoading || contactsLoading;

  const extractArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.data?.results)) return data.data.results;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const devices = extractArray(devicesData);
  const groups = extractArray(groupsData);
  const contacts = extractArray(contactsData);

  const connectedDevices = devices.filter((d: any) => d.status === 'CONNECTED' || d.connected).length;

  const stats = [
    {
      title: 'Status Server',
      value: statusLoading ? '...' : (serverStatus ? 'Online' : 'Offline'),
      icon: Server,
      color: serverStatus ? 'text-primary' : 'text-destructive',
      bgColor: serverStatus ? 'bg-primary/10' : 'bg-destructive/10',
    },
    {
      title: 'Perangkat Aktif',
      value: `${connectedDevices} / ${devices.length}`,
      icon: Smartphone,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Total Grup',
      value: isDataLoading ? '...' : (groups?.length ?? 0).toString(),
      icon: Users,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Total Kontak',
      value: isDataLoading ? '...' : (contacts?.length ?? 0).toString(),
      icon: Contact,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground shadow-lg">
        <h1 className="text-2xl font-bold md:text-3xl">Dashboard Kontrol GoWA</h1>
        <p className="mt-2 text-primary-foreground/80">
          Panel kontrol WhatsApp Multi-Device untuk mengelola pesan, grup, dan perangkat Anda.
        </p>
      </div>

      <DeviceSelector />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Kirim Pesan
            </CardTitle>
            <CardDescription>
              Kirim pesan teks, gambar, video, dan media lainnya
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/messages">
              <Button className="w-full">Buka Pusat Pesan</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-secondary" />
              Kelola Perangkat
            </CardTitle>
            <CardDescription>
              Tambah, hubungkan, atau kelola perangkat WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/devices">
              <Button variant="secondary" className="w-full">
                Kelola Perangkat
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-chart-1" />
              Manajemen Grup
            </CardTitle>
            <CardDescription>
              Kelola grup, peserta, dan pengaturan grup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/groups">
              <Button variant="outline" className="w-full">
                Lihat Grup
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* No Devices Info */}
      {devices.length === 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Smartphone className="h-5 w-5" />
              Belum Ada Perangkat
            </CardTitle>
            <CardDescription>
              Anda perlu menambahkan dan menghubungkan perangkat WhatsApp terlebih dahulu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/devices">
              <Button>Tambah Perangkat Baru</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
