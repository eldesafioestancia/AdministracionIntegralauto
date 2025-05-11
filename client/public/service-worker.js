// Service Worker para gestionar notificaciones push
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/'
    },
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Cuando se hace clic en la notificación
self.addEventListener('notificationclick', function(event) {
  const notification = event.notification;
  const action = event.action;
  const url = notification.data.url;
  
  // Cerrar la notificación
  notification.close();
  
  // Abrir la ventana específica
  if (url) {
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Sincronización en segundo plano para enviar notificaciones cuando hay conectividad
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Función para sincronizar notificaciones pendientes
async function syncNotifications() {
  // Implementar la lógica para sincronizar notificaciones almacenadas localmente
  // con el servidor cuando haya conexión a Internet
  try {
    // Aquí iría la lógica para enviar notificaciones almacenadas localmente
    console.log('Sincronizando notificaciones');
  } catch (error) {
    console.error('Error al sincronizar notificaciones:', error);
  }
}