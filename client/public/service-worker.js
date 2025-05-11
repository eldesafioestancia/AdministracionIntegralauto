// Service Worker para manejar notificaciones push

const CACHE_NAME = 'agro-app-cache-v1';
const OFFLINE_URL = '/offline.html';
const ICON_URL = '/icons/notification-icon.png';

// Eventos del ciclo de vida del service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Creando caché');
      return cache.addAll([
        OFFLINE_URL,
        ICON_URL,
        '/icons/badge-icon.png'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando');
  // Limpiar cachés viejas
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché vieja', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Manejo de las notificaciones push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido');
  
  let notificationData = {};
  
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Nueva notificación',
      body: event.data ? event.data.text() : 'No hay contenido',
      tag: 'default'
    };
  }
  
  const options = {
    body: notificationData.body || 'No hay contenido',
    icon: notificationData.icon || ICON_URL,
    badge: notificationData.badge || '/icons/badge-icon.png',
    data: notificationData.data || {},
    tag: notificationData.tag || 'default',
    vibrate: [100, 50, 100],
    timestamp: Date.now(),
    renotify: notificationData.renotify || false,
    actions: notificationData.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'Nueva notificación', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clic en notificación', event.notification.tag);
  
  event.notification.close();
  
  // Determinar la URL a abrir según el tipo de notificación
  let urlToOpen = '/';
  
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  } else {
    // URLs predeterminadas según el tag de la notificación
    switch(event.notification.tag) {
      case 'animal':
        urlToOpen = '/animals';
        break;
      case 'machine':
        urlToOpen = '/machines';
        break;
      case 'maintenance':
        urlToOpen = '/machines/maintenance';
        break;
      case 'pasture':
        urlToOpen = '/pastures';
        break;
      case 'weather':
        urlToOpen = '/weather';
        break;
      case 'finance':
        urlToOpen = '/finances';
        break;
      default:
        urlToOpen = '/';
    }
  }
  
  // Manejo de acciones específicas
  if (event.action) {
    switch(event.action) {
      case 'view-details':
        // Abrir página de detalles
        if (event.notification.data && event.notification.data.detailsUrl) {
          urlToOpen = event.notification.data.detailsUrl;
        }
        break;
      case 'dismiss':
        // Solo cerrar la notificación
        return;
    }
  }
  
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then((clientList) => {
      // Verificar si ya existe una ventana abierta y enfocarla
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Sincronización de notificaciones en segundo plano
async function syncNotifications() {
  try {
    // Intentar recuperar notificaciones pendientes
    const response = await fetch('/api/notifications/pending');
    if (response.ok) {
      const pendingNotifications = await response.json();
      
      // Mostrar notificaciones pendientes
      pendingNotifications.forEach(notification => {
        self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || ICON_URL,
          badge: notification.badge || '/icons/badge-icon.png',
          tag: notification.tag || 'default',
          data: notification.data || {},
          vibrate: [100, 50, 100],
          timestamp: Date.now()
        });
      });
      
      // Confirmar que se procesaron
      if (pendingNotifications.length > 0) {
        await fetch('/api/notifications/confirm-delivery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ids: pendingNotifications.map(n => n.id)
          })
        });
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error sincronizando notificaciones:', error);
  }
}

// Manejar sincronización periódica
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Manejar eventos de sincronización periódica
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-notifications-sync') {
    event.waitUntil(syncNotifications());
  }
});

// Manejar peticiones de red fallidas
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then((cache) => {
              return cache.match(OFFLINE_URL);
            });
        })
    );
  }
});