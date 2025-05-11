import { useEffect, useState } from 'react';
import { useSync } from '@/context/SyncContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function SyncInitializer() {
  const { isOnline, isSyncing, syncAllCollections } = useSync();
  const [showAlert, setShowAlert] = useState(false);
  const [isInitialSync, setIsInitialSync] = useState(true);

  // Intentar sincronización inicial al cargar el componente
  useEffect(() => {
    const initializeSync = async () => {
      if (isOnline && isInitialSync) {
        try {
          await syncAllCollections();
          setIsInitialSync(false);
        } catch (error) {
          console.error('Error en sincronización inicial:', error);
          setShowAlert(true);
        }
      } else if (!isOnline && isInitialSync) {
        setIsInitialSync(false);
        setShowAlert(true);
      }
    };

    initializeSync();
  }, [isOnline, isInitialSync, syncAllCollections]);

  if (!showAlert) return null;

  return (
    <Alert 
      className="fixed bottom-4 right-4 w-80 z-50 border-yellow-500 bg-yellow-50 shadow-lg"
      role="alert"
    >
      <AlertTitle className="text-yellow-800">
        {isOnline ? 'Error de sincronización' : 'Modo sin conexión'}
      </AlertTitle>
      <AlertDescription className="text-sm text-yellow-700">
        {isOnline 
          ? 'No se pudieron sincronizar los datos. La app funcionará con datos locales.' 
          : 'Sin conexión a internet. La app funcionará en modo offline.'}
      </AlertDescription>
      {isOnline && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full border-yellow-500 text-yellow-700 hover:bg-yellow-100"
          onClick={() => syncAllCollections()}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            'Reintentar sincronización'
          )}
        </Button>
      )}
    </Alert>
  );
}