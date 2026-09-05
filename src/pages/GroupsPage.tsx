import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getMyGroups, createGroup, joinGroupWithLink, leaveGroup, getGroupInfo } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Users, RefreshCw, Crown, Settings, Info, Plus, Link as LinkIcon, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { DeviceSelector } from '@/components/layout/DeviceSelector';

export default function GroupsPage() {
  const { deviceId } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const { data: groupsData, isLoading, refetch } = useQuery({
    queryKey: ['groups', deviceId],
    queryFn: () => getMyGroups().then((res) => res.data),
    enabled: !!deviceId,
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string; participants: string[] }) => createGroup(data),
    onSuccess: () => {
      toast.success('Grup berhasil dibuat');
      setIsCreateDialogOpen(false);
      setGroupName('');
      setParticipants('');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: any) => {
      toast.error('Gagal membuat grup: ' + (error.response?.data?.message || error.message));
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: (link: string) => joinGroupWithLink(link),
    onSuccess: () => {
      toast.success('Berhasil bergabung ke grup');
      setIsJoinDialogOpen(false);
      setInviteLink('');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: any) => {
      toast.error('Gagal bergabung ke grup: ' + (error.response?.data?.message || error.message));
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: () => {
      toast.success('Berhasil keluar dari grup');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: any) => {
      toast.error('Gagal keluar dari grup: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const participantList = participants.split(',').map(p => p.trim()).filter(p => p !== '');
    if (!groupName || participantList.length === 0) {
      toast.error('Nama grup dan minimal satu peserta wajib diisi');
      return;
    }
    createGroupMutation.mutate({ name: groupName, participants: participantList });
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteLink) return;
    joinGroupMutation.mutate(inviteLink);
  };

  const getGroupsList = (): any[] => {
    if (!groupsData) return [];
    
    // Check priority: groupsData.results, groupsData.data.results, groupsData.data, groupsData
    if (Array.isArray(groupsData.results)) return groupsData.results;
    if (Array.isArray(groupsData.data?.results)) return groupsData.data.results;
    if (Array.isArray(groupsData.data)) return groupsData.data;
    if (Array.isArray(groupsData)) return groupsData;
    
    return [];
  };

  const groups = getGroupsList();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Grup WhatsApp</h1>
        <p className="text-muted-foreground">Kelola grup, buat grup baru, atau bergabung melalui tautan.</p>
      </div>

      <DeviceSelector />

      {!deviceId ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Users className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium text-center">
              Silakan pilih perangkat di atas terlebih dahulu untuk melihat grup.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Manajemen Grup</h1>
              <p className="text-muted-foreground">
                Kelola grup WhatsApp Anda
              </p>
            </div>
            <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" /> Buat Grup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Grup Baru</DialogTitle>
                <DialogDescription>
                  Masukkan nama grup dan nomor peserta (format: 628123456789)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Grup</label>
                    <Input 
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Contoh: Grup Proyek"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Peserta (pisahkan dengan koma)</label>
                    <Input 
                      value={participants}
                      onChange={(e) => setParticipants(e.target.value)}
                      placeholder="628xxx, 628xxx"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={createGroupMutation.isPending}>
                    {createGroupMutation.isPending ? 'Memproses...' : 'Buat Grup'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <LinkIcon className="mr-2 h-4 w-4" /> Gabung via Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gabung via Link Undangan</DialogTitle>
                <DialogDescription>
                  Masukkan link undangan grup WhatsApp
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleJoinGroup}>
                <div className="py-4">
                  <Input 
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsJoinDialogOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={joinGroupMutation.isPending}>
                    {joinGroupMutation.isPending ? 'Memproses...' : 'Gabung'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Daftar Grup
          </CardTitle>
          <CardDescription>
            {groups.length} grup ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : groups.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <Users className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">Tidak ada grup ditemukan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Grup</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Peserta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(groups) && groups.length > 0 ? (
                  groups.map((group) => (
                    <TableRow key={group.jid}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {group.jid}
                      </TableCell>
                      <TableCell>{group.participants_count || '-'}</TableCell>
                      <TableCell>
                        {group.is_admin && (
                          <Badge className="bg-primary">
                            <Crown className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            getGroupInfo(group.jid).then(res => {
                              toast.info(`Info Grup: ${res.data?.subject || group.name}`);
                            });
                          }}>
                            <Info className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => {
                            if (confirm(`Yakin ingin keluar dari grup ${group.name}?`)) {
                              leaveGroupMutation.mutate(group.jid);
                            }
                          }}>
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {isLoading ? 'Memuat data...' : 'Tidak ada grup ditemukan atau format data salah.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
      )}
    </div>
  );
}
