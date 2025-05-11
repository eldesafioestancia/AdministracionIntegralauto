import { useEffect } from 'react';
import { notificationManager } from '@/lib/notificationManager';

/**
 * Componente que inicializa el servicio de notificaciones al cargar la aplicación
 * No renderiza ningún elemento visible.
 */
export default function NotificationInitializer() {
  useEffect(() => {
    const initNotifications = async () => {
      // Comprobar si el navegador soporta notificaciones push
      if (notificationManager.isPushSupported()) {
        try {
          // Inicializar el servicio
          await notificationManager.init();
          console.log('NotificationManager inicializado');
        } catch (error) {
          console.error('Error al inicializar el servicio de notificaciones:', error);
        }
      } else {
        console.log('Las notificaciones push no son compatibles con este navegador');
      }
    };
    
    initNotifications();
  }, []);
  
  // Este componente no renderiza nada visible
  return null;
}