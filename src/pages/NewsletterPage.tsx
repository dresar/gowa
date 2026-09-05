import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getNewsletters, unfollowNewsletter } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Newspaper, RefreshCw, UserMinus } from 'lucide-react';
import { DeviceSelector } from '@/components/layout/DeviceSelector';

interface Newsletter {
  id: string;
  name: string;
  description?: string;
  subscriber_count?: number;
}

export default function NewsletterPage() {
  const { deviceId } = useAuth();
  const queryClient = useQueryClient();

  const { data: newslettersData, isLoading, refetch } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => getNewsletters().then((res) => res.data),
    enabled: !!deviceId,
  });

  const unfollowMutation = useMutation({
    mutationFn: (id: string) => unfollowNewsletter(id),
    onSuccess: () => {
      toast.success('Berhasil berhenti mengikuti newsletter');
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal berhenti mengikuti');
    },
  });

  const newsletters: Newsletter[] = newslettersData?.data || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Newsletter WhatsApp</h1>
        <p className="text-muted-foreground">Kelola newsletter yang Anda ikuti dan dapatkan update terbaru.</p>
      </div>

      <DeviceSelector />

      {!deviceId ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Newspaper className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium text-center">
              Silakan pilih perangkat di atas terlebih dahulu untuk melihat newsletter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Daftar Newsletter</h1>
              <p className="text-muted-foreground">
                Kelola newsletter yang diikuti melalui perangkat ini
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Daftar Newsletter
          </CardTitle>
          <CardDescription>
            {newsletters.length} newsletter yang Anda ikuti
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : newsletters.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <Newspaper className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">Tidak ada newsletter</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsletters.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell className="font-medium">{newsletter.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {newsletter.description || '-'}
                    </TableCell>
                    <TableCell>{newsletter.subscriber_count || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => unfollowMutation.mutate(newsletter.id)}
                        disabled={unfollowMutation.isPending}
                      >
                        <UserMinus className="mr-1 h-4 w-4" />
                        Unfollow
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
