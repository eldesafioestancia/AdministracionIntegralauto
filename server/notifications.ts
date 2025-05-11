import webpush from 'web-push';
import { Request, Response } from 'express';
import { storage } from './storage';

// Generar claves VAPID (deberían almacenarse de forma segura y no regenerarse en cada inicio)
// En un entorno de producción, estas claves deben generarse una vez y almacenarse de forma segura
const vapidKeys = webpush.generateVAPIDKeys();

// Configurar web-push
webpush.setVapidDetails(
  'mailto:ejemplo@dominio.com', // Debería ser un correo de contacto real
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Almacenará las suscripciones de los usuarios
// El storage ya está importado desde './storage'

/**
 * Obtiene la clave pública VAPID para que el cliente pueda suscribirse
 */
export const getPublicKey = (_req: Request, res: Response) => {
  return res.status(200).json({
    publicKey: vapidKeys.publicKey
  });
};

/**
 * Guarda una nueva suscripción de notificaciones push
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const subscription = req.body;
    const userId = req.body.userId || 'anonymous'; // En un sistema real, usar autenticación

    // Guardar la suscripción en la base de datos
    await storage.addPushSubscription(userId, subscription);

    res.status(201).json({ message: 'Subscription stored successfully' });
  } catch (error) {
    console.error('Error storing subscription:', error);
    res.status(500).json({ error: 'Failed to store subscription' });
  }
};

/**
 * Cancela una suscripción existente
 */
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const subscription = req.body;
    const userId = req.body.userId || 'anonymous';

    // Eliminar la suscripción de la base de datos
    await storage.removePushSubscription(userId, subscription.endpoint);

    res.status(200).json({ message: 'Subscription removed successfully' });
  } catch (error) {
    console.error('Error removing subscription:', error);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
};

/**
 * Actualiza las preferencias de notificación de un usuario
 */
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || 'anonymous';
    const preferences = req.body.preferences;

    // Actualizar preferencias en la base de datos
    await storage.updateNotificationPreferences(userId, preferences);

    res.status(200).json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

/**
 * Envía una notificación a un único usuario
 */
export const sendNotificationToUser = async (userId: string, notification: any) => {
  try {
    // Recuperar subscripciones del usuario
    const subscriptions = await storage.getUserPushSubscriptions(userId);
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No subscriptions found for user ${userId}`);
      return;
    }

    // Enviar notificación a cada dispositivo suscrito
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify(notification)
        );
      } catch (error) {
        console.error(`Error sending notification to subscription: ${error}`);
        // Si el error es porque la suscripción ya no es válida, eliminarla
        if ((error as any).statusCode === 410) {
          await storage.removePushSubscription(userId, subscription.endpoint);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
  }
};

/**
 * Envía una notificación a todos los usuarios suscritos
 */
export const sendNotificationToAll = async (notification: any) => {
  try {
    // Recuperar todas las subscripciones
    const allSubscriptions = await storage.getAllPushSubscriptions();
    
    if (!allSubscriptions || Object.keys(allSubscriptions).length === 0) {
      console.log('No subscriptions found');
      return;
    }

    // Enviar a cada usuario
    for (const userId in allSubscriptions) {
      await sendNotificationToUser(userId, notification);
    }
  } catch (error) {
    console.error('Error sending notification to all users:', error);
  }
};

/**
 * API para enviar una notificación de prueba
 */
export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || 'anonymous';
    
    const notification = {
      title: 'Notificación de prueba',
      body: 'Esta es una notificación de prueba del sistema de gestión agrícola',
      url: '/',
      actions: [
        {
          action: 'explore',
          title: 'Ver detalles'
        }
      ]
    };

    await sendNotificationToUser(userId, notification);
    
    res.status(200).json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
};

/**
 * API para enviar una alerta crítica a todos los usuarios
 */
export const sendCriticalAlert = async (req: Request, res: Response) => {
  try {
    const { title, body, url, level } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const notification = {
      title,
      body,
      url: url || '/',
      actions: [
        {
          action: 'view',
          title: 'Ver ahora'
        }
      ],
      level: level || 'critical'
    };

    await sendNotificationToAll(notification);
    
    res.status(200).json({ message: 'Critical alert sent successfully' });
  } catch (error) {
    console.error('Error sending critical alert:', error);
    res.status(500).json({ error: 'Failed to send critical alert' });
  }
};