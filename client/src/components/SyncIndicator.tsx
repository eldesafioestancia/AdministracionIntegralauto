import { useSync } from '@/context/SyncContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SyncIndicator() {
  const { isOnline, isSyncing, lastSyncTime, syncAllCollections } = useSync();

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca';
    
    // Formato corto de fecha y hora
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(lastSyncTime);
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={isOnline ? "outline" : "destructive"}
              className="px-2 py-1 flex items-center gap-1"
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span className="text-xs">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span className="text-xs">Offline</span>
                </>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isOnline 
                ? 'Conectado a internet. Los datos se sincronizarán automáticamente.'
                : 'Sin conexión a internet. Los cambios se guardarán localmente y se sincronizarán cuando vuelva la conexión.'}
            </p>
            <p className="text-xs mt-1">Última sincronización: {formatLastSync()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isOnline && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => syncAllCollections()}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          )}
        </Button>
      )}
    </div>
  );
}