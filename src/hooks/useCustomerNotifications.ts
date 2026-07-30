// src/hooks/useCustomerNotifications.ts
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

// Son de notification (simple beep)
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2hm5OLgoOKkZaanJuYk42Jh4aGhoiLj5OWl5eTjoqHhYWGh4qNkJOUk5COi4iFhIWGiIuOkZOTko+MiYaEhIWHiYuOkJKSkI6LiIWEhIWHiYuNj5GQjo2KhoSEhYaIio2PkJCOjImGhISFhoiKjI6Pj42LiYaEhIWGiImLjY6OjYuJhoSEhYaHiYqMjY2Mi4mGhISFhoiJi4yNjIuJh4WEhYaHiImLjIyLiomHhYSFhoeIiouMi4uJh4WEhYaHiImKi4uKiYeGhISFhoeIiYqLioqIh4WEhYaHiImKioqJiIaFhIWGh4iJioqKiYiGhYSFhoeIiYmKiomIh4WEhYaHiIiJioqJiIeGhIWFhoeIiYmJiYiHhoWEhYaHiIiJiYmIh4aFhIWGh4eIiYmJiIeGhYSFhoeHiIiJiIiHhoWEhYaGh4iIiIiIh4aFhIWGhoeIiIiIh4eGhYSFhoaHiIiIiIeHhoWEhYaGh4eIiIiHh4aFhIWGhoeHiIiIh4eGhYWFhoaHh4iIiIeHhoWFhYaGh4eIiIeHh4aFhYWGhoeHh4iHh4eGhYWFhoaHh4eHh4eHhoWFhYaGh4eHh4eHhoaFhYWGhoeHh4eHh4aGhYWFhoaHh4eHh4eGhoWFhYaGhoeHh4eHhoaFhYWGhoaHh4eHh4aGhYWFhoaGh4eHh4eGhoWFhYaGhoeHh4eHhoaFhYWGhoaHh4eHhoaGhYWFhoaGh4eHh4aGhoWFhYaGhoeHh4eGhoaFhYWGhoaHh4eHhoaGhYWFhoaGh4eHh4aGhoWFhYaGhoeHh4eGhoaFhYWGhoaHh4eGhoaGhYWFhoaGh4eHhoaGhoWFhYaGhoeHh4aGhoaFhYWGhoaHh4eGhoaGhYWFhoaGh4eHhoaGhoWFhYaGhoeHhoaGhoaFhYWGhoaHh4eGhoaGhYWFhoaGh4eGhoaGhoWFhYaGhoeHhoaGhoaFhYWGhoaHh4aGhoaGhYWFhoaGh4aGhoaGhoWFhYaGhoaGhoaGhoaFhYWGhoaGhoaGhoaGhYWFhoaGhoaGhoaGhoWFhYaGhoaGhoaGhoaFhYWGhoaGhoaGhoaGhYWFhoaGhoaGhoaGhoWFhYaGhoaGhoaGhoaFhYWGhoaGhoaGhoaGhYWFhoaGhoaGhoaGhYWFhYaGhoaGhoaGhoWFhYaGhoaGhoaGhoaFhYWGhoaGhoaGhoaGhYWFhoaGhoaGhoaGhYWFhYaGhoaGhoaGhoWFhYaGhoaGhoaGhoWFhYWGhoaGhoaGhoaFhYWFhoaGhoaGhoaGhYWFhYaGhoaGhoaGhoWFhYWGhoaGhoaGhoaFhYWFhoaGhoaGhoaFhYWFhYaGhoaGhoaGhYWFhYaGhoaGhoaGhYWFhYWGhoaGhoaGhoWFhYWGhoaGhoaGhoWFhYWFhoaGhoaGhoaFhYWFhoaGhoaGhoaFhYWFhYaGhoaGhoaGhYWFhYaGhoaGhoaGhYWFhYWGhoaGhoaGhYWFhYWFhoaGhoaGhoWFhYWFhoaGhoaGhoWFhYWFhoaGhoaGhoWFhYWFhYaGhoaGhoaFhYWFhYaGhoaGhoWFhYWFhYaGhoaGhoWFhYWFhYWGhoaGhoaFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhYWFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhYWFhYWFhYWGhoaGhYWFhYWFhYWGhoaGhYWFhYWFhYWGhoaFhYWFhYWFhYWGhoaFhYWFhYWFhYWGhoaFhYWFhYWFhYWGhoWFhYWFhYWFhYaGhYWFhYWFhYWFhoaFhYWFhYWFhYWGhoWFhYWFhYWFhYaGhYWFhYWFhYWFhoWFhYWFhYWFhYaGhYWFhYWFhYWFhYWFhYWFhYWFhYaFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhQ==';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

export const useCustomerNotifications = () => {
  const { isAuthenticated } = useCustomerAuth();
  const queryClient = useQueryClient();
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const hasShownInitialNotifications = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasRequestedPermission = useRef(false);

  // Initialiser l'audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.volume = 0.5;
  }, []);

  // Demander permission notifications navigateur
  useEffect(() => {
    if (!isAuthenticated || hasRequestedPermission.current) return;

    if ('Notification' in window && Notification.permission === 'default') {
      hasRequestedPermission.current = true;
      Notification.requestPermission();
    }
  }, [isAuthenticated]);

  // Récupérer les notifications
  const { data: notificationsData, refetch } = useQuery<NotificationsResponse>({
    queryKey: ['customer-notifications'],
    queryFn: () => apiClient.get('/public/notifications?limit=10').then(res => res.data),
    enabled: isAuthenticated,
    refetchInterval: 60000, // Polling toutes les 60 secondes
    refetchOnWindowFocus: true, // Rafraîchir quand la fenêtre reprend le focus
  });

  // Filtrer pour ne montrer que les notifications non lues
  const notifications = (notificationsData?.data || []).filter(n => !n.isRead);
  const unreadCount = notificationsData?.meta?.unreadCount || 0;

  // Afficher les nouvelles notifications sous forme de toast
  useEffect(() => {
    if (!notifications.length || !isAuthenticated) return;

    // Au premier chargement, juste sauvegarder l'ID de la dernière notification
    if (!hasShownInitialNotifications.current) {
      setLastNotificationId(notifications[0]?.id || null);
      hasShownInitialNotifications.current = true;
      return;
    }

    // Trouver les nouvelles notifications (non lues et plus récentes que la dernière vue)
    const newNotifications = lastNotificationId
      ? notifications.filter(n => {
          const isNewer = new Date(n.createdAt) > new Date(notifications.find(notif => notif.id === lastNotificationId)?.createdAt || 0);
          return !n.isRead && isNewer;
        })
      : notifications.filter(n => !n.isRead).slice(0, 3); // Maximum 3 toasts à la fois

    // Afficher les nouvelles notifications
    newNotifications.forEach(notification => {
      // Jouer le son
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Autoplay peut être bloqué, ignorer l'erreur
        });
      }

      // Notification navigateur
      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
          requireInteraction: false,
        });

        browserNotification.onclick = () => {
          window.focus();
          if (notification.data?.orderId) {
            window.dispatchEvent(new CustomEvent('navigate-to-order', {
              detail: { orderId: notification.data.orderId }
            }));
          }
          browserNotification.close();
        };

        setTimeout(() => browserNotification.close(), 10000);
      }

      // Type de toast selon le type de notification
      const isError = notification.type === 'COMMANDE_ANNULEE';
      const toastFn = isError ? toast.error : toast.success;

      toastFn(notification.title, {
        description: notification.message,
        duration: 5000,
        action: notification.data?.orderId ? {
          label: 'Voir',
          onClick: () => {
            // Naviguer vers la commande (l'action sera gérée par le composant parent)
            window.dispatchEvent(new CustomEvent('navigate-to-order', {
              detail: { orderId: notification.data.orderId }
            }));
          },
        } : undefined,
      });
    });

    // Mettre à jour l'ID de la dernière notification vue
    if (notifications[0]) {
      setLastNotificationId(notifications[0].id);
    }
  }, [notifications, isAuthenticated, lastNotificationId]);

  // Marquer une notification comme lue (et la retirer de la liste)
  const markAsRead = async (notificationId: string) => {
    try {
      // Retirer immédiatement la notification de la liste
      queryClient.setQueryData<NotificationsResponse>(['customer-notifications'], (old) => {
        if (!old) return old;

        return {
          ...old,
          data: old.data.filter(n => n.id !== notificationId),
          meta: {
            ...old.meta,
            unreadCount: Math.max(0, old.meta.unreadCount - 1),
          },
        };
      });

      // Marquer comme lue dans le backend
      await apiClient.patch(`/public/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      // En cas d'erreur, refetch pour restaurer l'état correct
      queryClient.invalidateQueries({ queryKey: ['customer-notifications'] });
    }
  };

  // Rafraîchir manuellement
  const refresh = () => {
    refetch();
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    refresh,
  };
};
