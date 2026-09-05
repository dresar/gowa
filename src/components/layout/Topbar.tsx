import { useQuery } from '@tanstack/react-query';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { checkServerStatus } from '@/lib/api';
import { Server, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Topbar() {
  const { isServerOnline } = useAuth();

  const { data: serverStatus } = useQuery({
    queryKey: ['serverStatus'],
    queryFn: () => checkServerStatus().then((res) => res.data).catch(() => null),
    refetchInterval: isServerOnline ? 10000 : 30000, // Still check occasionally if offline
  });

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="hidden items-center gap-2 lg:flex">
          {isServerOnline ? (
            <Server className="h-5 w-5 text-muted-foreground" />
          ) : (
            <WifiOff className="h-5 w-5 text-destructive" />
          )}
          <span className="text-sm font-medium">Server:</span>
          <Badge variant={isServerOnline ? "default" : "destructive"} className={isServerOnline ? "bg-green-500" : ""}>
            {isServerOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>
    </header>
  );
}
