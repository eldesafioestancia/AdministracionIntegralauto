import { useState } from 'react';
import { useSync } from '@/context/SyncContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';

export default function SyncSettings() {
  const { isOnline, isSyncing, lastSyncTime, syncStatus, syncAllCollections, syncCollection } = useSync();
  const [activeTab, setActiveTab] = useState('status');

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca';
    
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(lastSyncTime);
  };

  const collectionNames = [
    { id: 'machines', name: 'Maquinarias' },
    { id: 'animals', name: 'Animales' },
    { id: 'pastures', name: 'Pasturas' },
    { id: 'pastureWorks', name: 'Trabajos de Pasturas' },
    { id: 'maintenance', name: 'Mantenimiento' },
    { id: 'investments', name: 'Inversiones' },
    { id: 'capital', name: 'Capital' },
    { id: 'employees', name: 'Empleados' }
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración de Sincronización</h1>
      
      <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Estado</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Estado de Conexión
                {isOnline ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Wifi className="w-3 h-3 mr-1" /> Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <WifiOff className="w-3 h-3 mr-1" /> Offline
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Información sobre el estado actual de la conexión y última sincronización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Última sincronización</p>
                    <p className="text-lg font-semibold">{formatLastSync()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Estado</p>
                    <p className="text-lg font-semibold flex items-center">
                      {isSyncing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sincronizando</>
                      ) : (
                        <>Listo</>
                      )}
                    </p>
                  </div>
                </div>
                
                {!isOnline && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTitle className="text-amber-800">Modo sin conexión</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      Estás trabajando en modo offline. Los cambios se guardarán localmente y 
                      se sincronizarán cuando vuelvas a estar conectado a internet.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => syncAllCollections()} 
                disabled={isSyncing || !isOnline}
                className="w-full"
              >
                {isSyncing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sincronizando...</>
                ) : (
                  <>Sincronizar Ahora</>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estado de las colecciones</CardTitle>
              <CardDescription>
                Estado de sincronización de cada tipo de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collectionNames.map(collection => {
                  const isSynced = syncStatus.get(collection.id as any);
                  
                  return (
                    <div key={collection.id} className="flex items-center justify-between py-2 border-b border-neutral-100">
                      <div className="flex items-center">
                        <span className="font-medium">{collection.name}</span>
                      </div>
                      <div className="flex items-center">
                        {isSynced ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" /> Sincronizado
                          </Badge>
                        ) : (
                          <Badge className="bg-neutral-50 text-neutral-700 border-neutral-200">
                            <XCircle className="w-3 h-3 mr-1" /> Pendiente
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-2 px-2"
                          onClick={() => syncCollection(collection.id as any)}
                          disabled={isSyncing || !isOnline}
                        >
                          {isSyncing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
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
                            >
                              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                              <path d="M3 3v5h5" />
                              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                              <path d="M16 21h5v-5" />
                            </svg>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ajustes de sincronización</CardTitle>
              <CardDescription>
                Configura las opciones de sincronización de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTitle className="text-blue-800">Información</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    La aplicación está configurada para sincronizarse automáticamente cuando hay conexión a internet.
                    Puedes sincronizar manualmente cuando lo necesites.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4 mt-4">
                  <p className="text-sm text-neutral-500">
                    Si necesitas borrar los datos almacenados localmente, puedes usar el botón a continuación.
                    Esto no afectará a los datos en el servidor.
                  </p>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro? Esto borrará todos los datos almacenados localmente. Los datos en el servidor no se verán afectados.')) {
                        // TODO: Implementar limpieza de base de datos local
                        console.log('Borrar datos locales (no implementado)');
                      }
                    }}
                  >
                    Borrar datos locales
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}