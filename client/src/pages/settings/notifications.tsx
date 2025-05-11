import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Bell, BellOff, AlertTriangle, Info } from 'lucide-react';
import { notificationManager, NotificationPreferences, NotificationPermission } from '@/lib/notificationManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const NotificationsPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    animalsAlerts: true,
    machinesAlerts: true,
    financialAlerts: true,
    pasturesAlerts: true,
    weatherAlerts: true,
    maintenanceReminders: true,
    enablePushNotifications: true
  });

  // Inicializar el estado y cargar preferencias
  useEffect(() => {
    const initialize = async () => {
      try {
        // Verificar soporte para notificaciones
        const isSupported = notificationManager.isPushSupported();
        setIsPushSupported(isSupported);
        
        if (isSupported) {
          // Inicializar el servicio de notificaciones
          await notificationManager.init();
          
          // Obtener estado actual de los permisos
          const permission = notificationManager.getPermissionStatus();
          setPermissionStatus(permission);
          
          // Verificar si ya está suscrito
          const subscribed = notificationManager.isUserSubscribed();
          setIsSubscribed(subscribed);
          
          // Cargar preferencias
          const userPreferences = await notificationManager.getPreferences();
          setPreferences(userPreferences);
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las preferencias de notificaciones',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [toast]);

  // Manejar cambios en las preferencias
  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Guardar preferencias
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const success = await notificationManager.updatePreferences(preferences);
      if (success) {
        toast({
          title: 'Preferencias guardadas',
          description: 'Tus preferencias de notificaciones han sido actualizadas',
          variant: 'default'
        });
      } else {
        throw new Error('No se pudieron guardar las preferencias');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las preferencias',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Solicitar permiso para notificaciones
  const handleRequestPermission = async () => {
    setIsSubscribing(true);
    try {
      const permission = await notificationManager.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        const subscribed = await notificationManager.subscribe();
        setIsSubscribed(subscribed);
        
        if (subscribed) {
          toast({
            title: 'Notificaciones activadas',
            description: 'Ahora recibirás notificaciones importantes del sistema',
            variant: 'default'
          });
        }
      } else {
        toast({
          title: 'Permiso denegado',
          description: 'No se pudo activar las notificaciones',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: 'Error',
        description: 'No se pudo solicitar permiso para notificaciones',
        variant: 'destructive'
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // Cancelar suscripción
  const handleUnsubscribe = async () => {
    setIsSubscribing(true);
    try {
      const unsubscribed = await notificationManager.unsubscribe();
      if (unsubscribed) {
        setIsSubscribed(false);
        toast({
          title: 'Notificaciones desactivadas',
          description: 'Has cancelado la suscripción a las notificaciones',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la suscripción',
        variant: 'destructive'
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // Enviar notificación de prueba
  const handleTestNotification = async () => {
    try {
      await notificationManager.sendTestNotification();
      toast({
        title: 'Notificación enviada',
        description: 'Se ha enviado una notificación de prueba',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la notificación de prueba',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configuración de Notificaciones</h1>
      
      {!isPushSupported && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No compatible</AlertTitle>
          <AlertDescription>
            Tu navegador no soporta notificaciones push. Actualiza tu navegador para recibir alertas importantes.
          </AlertDescription>
        </Alert>
      )}
      
      {isPushSupported && permissionStatus === 'denied' && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Permiso denegado</AlertTitle>
          <AlertDescription>
            Has bloqueado las notificaciones. Para recibir alertas importantes, debes permitir notificaciones en la configuración de tu navegador.
          </AlertDescription>
        </Alert>
      )}
      
      {isPushSupported && !isSubscribed && permissionStatus !== 'denied' && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Notificaciones no activadas</AlertTitle>
          <AlertDescription>
            Activa las notificaciones para recibir alertas importantes sobre tu operación agropecuaria.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Suscripción a Notificaciones</CardTitle>
            <CardDescription>
              Recibe alertas importantes incluso cuando no estés utilizando la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {isSubscribed ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                <span>Estado: {isSubscribed ? 'Activado' : 'Desactivado'}</span>
              </div>
              <div>
                {isSubscribed ? (
                  <Button 
                    variant="outline" 
                    onClick={handleUnsubscribe} 
                    disabled={isSubscribing || permissionStatus !== 'granted'}
                  >
                    {isSubscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Desactivar
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    onClick={handleRequestPermission}
                    disabled={isSubscribing || permissionStatus === 'denied'}
                  >
                    {isSubscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Activar
                  </Button>
                )}
              </div>
            </div>
            
            {isSubscribed && (
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={handleTestNotification}
              >
                Enviar notificación de prueba
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Preferencias de Notificaciones</CardTitle>
            <CardDescription>
              Personaliza qué tipo de alertas quieres recibir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="animals-alerts" className="flex-1">Alertas de Animales</Label>
              <Switch 
                id="animals-alerts" 
                checked={preferences.animalsAlerts}
                onCheckedChange={() => handlePreferenceChange('animalsAlerts')}
                disabled={!isSubscribed}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="machines-alerts" className="flex-1">Alertas de Maquinarias</Label>
              <Switch 
                id="machines-alerts" 
                checked={preferences.machinesAlerts}
                onCheckedChange={() => handlePreferenceChange('machinesAlerts')}
                disabled={!isSubscribed}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="financial-alerts" className="flex-1">Alertas Financieras</Label>
              <Switch 
                id="financial-alerts" 
                checked={preferences.financialAlerts}
                onCheckedChange={() => handlePreferenceChange('financialAlerts')}
                disabled={!isSubscribed}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="pastures-alerts" className="flex-1">Alertas de Pasturas</Label>
              <Switch 
                id="pastures-alerts" 
                checked={preferences.pasturesAlerts}
                onCheckedChange={() => handlePreferenceChange('pasturesAlerts')}
                disabled={!isSubscribed}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="weather-alerts" className="flex-1">Alertas Meteorológicas</Label>
              <Switch 
                id="weather-alerts" 
                checked={preferences.weatherAlerts}
                onCheckedChange={() => handlePreferenceChange('weatherAlerts')}
                disabled={!isSubscribed}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-reminders" className="flex-1">Recordatorios de Mantenimiento</Label>
              <Switch 
                id="maintenance-reminders" 
                checked={preferences.maintenanceReminders}
                onCheckedChange={() => handlePreferenceChange('maintenanceReminders')}
                disabled={!isSubscribed}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSavePreferences} 
              disabled={isSaving || !isSubscribed} 
              className="w-full"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar preferencias
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;