import axios from 'axios';

// Estado de los permisos
export type NotificationPermission = 'default' | 'granted' | 'denied';

// Tipo para las preferencias de notificación
export interface NotificationPreferences {
  animalsAlerts: boolean;
  machinesAlerts: boolean;
  financialAlerts: boolean;
  pasturesAlerts: boolean;
  weatherAlerts: boolean;
  maintenanceReminders: boolean;
  enablePushNotifications: boolean;
}

// Clase para gestionar notificaciones
export class NotificationManager {
  private static instance: NotificationManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSubscribed = false;
  private userId = '1'; // En un sistema real, esto vendría de la autenticación
  
  // Singleton
  private constructor() {}
  
  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }
  
  // Comprobar si las notificaciones push son compatibles con el navegador
  public isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }
  
  // Obtener los permisos actuales para notificaciones
  public getPermissionStatus(): NotificationPermission {
    return Notification.permission as NotificationPermission;
  }
  
  // Inicializar el service worker y comprobar suscripción
  public async init(): Promise<boolean> {
    if (!this.isPushSupported()) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }
    
    try {
      // Registrar el service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      this.swRegistration = registration;
      
      // Comprobar si ya existe una suscripción
      const subscription = await this.swRegistration.pushManager.getSubscription();
      this.isSubscribed = !!subscription;
      
      console.log('Notification service initialized', this.isSubscribed ? 'subscribed' : 'not subscribed');
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }
  
  // Solicitar permiso para notificaciones
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isPushSupported()) {
      return 'denied';
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }
  
  // Suscribirse a notificaciones push
  public async subscribe(): Promise<boolean> {
    if (!this.swRegistration || this.isSubscribed) {
      return false;
    }
    
    try {
      // Obtener la clave pública VAPID del servidor
      const response = await axios.get('/api/notifications/vapid-public-key');
      const vapidPublicKey = response.data.publicKey;
      
      // Convertir la clave a un Uint8Array
      const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);
      
      // Crear la suscripción
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      
      // Enviar la suscripción al servidor
      await axios.post('/api/notifications/subscribe', {
        userId: this.userId,
        subscription: subscription
      });
      
      this.isSubscribed = true;
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }
  
  // Cancelar suscripción
  public async unsubscribe(): Promise<boolean> {
    if (!this.swRegistration || !this.isSubscribed) {
      return false;
    }
    
    try {
      // Obtener la suscripción actual
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (!subscription) {
        return false;
      }
      
      // Enviar solicitud al servidor para eliminar la suscripción
      await axios.post('/api/notifications/unsubscribe', {
        userId: this.userId,
        endpoint: subscription.endpoint
      });
      
      // Cancelar la suscripción en el cliente
      await subscription.unsubscribe();
      
      this.isSubscribed = false;
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }
  
  // Actualizar preferencias de notificación
  public async updatePreferences(preferences: NotificationPreferences): Promise<boolean> {
    try {
      await axios.post('/api/notifications/preferences', {
        userId: this.userId,
        preferences
      });
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }
  
  // Obtener preferencias actuales
  public async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await axios.get(`/api/notifications/preferences?userId=${this.userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        animalsAlerts: true,
        machinesAlerts: true,
        financialAlerts: true,
        pasturesAlerts: true,
        weatherAlerts: true,
        maintenanceReminders: true,
        enablePushNotifications: true
      };
    }
  }
  
  // Enviar una notificación de prueba
  public async sendTestNotification(): Promise<boolean> {
    try {
      await axios.post('/api/notifications/test', {
        userId: this.userId
      });
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }
  
  // Comprobar si el usuario está suscrito
  public isUserSubscribed(): boolean {
    return this.isSubscribed;
  }
  
  // Función utilitaria para convertir URL base64 a Uint8Array (requerida para las claves VAPID)
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Exportamos una instancia singleton
export const notificationManager = NotificationManager.getInstance();