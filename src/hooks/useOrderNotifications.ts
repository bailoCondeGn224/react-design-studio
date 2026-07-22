// src/hooks/useOrderNotifications.ts
import { useEffect, useRef, useCallback } from 'react';
import { usePendingOrderCount } from './useOnlineOrders';
import { toast } from 'sonner';

// Son de notification (base64 encoded beep sound)
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2hm5OLgoOKkZaanJuYk42Jh4aGhoiLj5OWl5eTjoqHhYWGh4qNkJOUk5COi4iFhIWGiIuOkZOTko+MiYaEhIWHiYuOkJKSkI6LiIWEhIWHiYuNj5GQjo2KhoSEhYaIio2PkJCOjImGhISFhoiKjI6Pj42LiYaEhIWGiImLjY6OjYuJhoSEhYaHiYqMjY2Mi4mGhISFhoiJi4yNjIuJh4WEhYaHiImLjIyLiomHhYSFhoeIiouMi4uJh4WEhYaHiImKi4uKiYeGhISFhoeIiYqLioqIh4WEhYaHiImKioqJiIaFhIWGh4iJioqKiYiGhYSFhoeIiYmKiomIh4WEhYaHiIiJioqJiIeGhIWFhoeIiYmJiYiHhoWEhYaHiIiJiYmIh4aFhIWGh4eIiYmJiIeGhYSFhoeHiIiJiIiHhoWEhYaGh4iIiIiIh4aFhIWGhoeIiIiIh4eGhYSFhoaHiIiIiIeHhoWEhYaGh4eIiIiHh4aFhIWGhoeHiIiIh4eGhYWFhoaHh4iIiIeHhoWFhYaGh4eIiIeHh4aFhYWGhoeHh4iHh4eGhYWFhoaHh4eHh4eHhoWFhYaGh4eHh4eHhoaFhYWGhoeHh4eHh4aGhYWFhoaHh4eHh4eGhoWFhYaGhoeHh4eHhoaFhYWGhoaHh4eHh4aGhYWFhoaGh4eHh4eGhoWFhYaGhoeHh4eHhoaFhYWGhoaHh4eHhoaGhYWFhoaGh4eHh4aGhoWFhYaGhoeHh4eGhoaFhYWGhoaHh4eHhoaGhYWFhoaGh4eHh4aGhoWFhYaGhoeHh4aGhoaFhYWGhoaHh4eHhoaGhYWFhoaGh4eHh4aGhoWFhYaGhoeHh4eGhoaFhYWGhoaHh4eGhoaGhYWFhoaGh4eHhoaGhoWFhYaGhoeHh4aGhoaFhYWGhoaHh4eGhoaGhYWFhoaGh4eHhoaGhoWFhYaGhoeHhoaGhoaFhYWGhoaHh4eGhoaGhYWFhoaGh4eGhoaGhoWFhYaGhoeHhoaGhoaFhYWGhoaHh4aGhoaGhYWFhoaGh4eGhoaGhoWFhYaGhoeGhoaGhoaFhYWGhoaHhoaGhoaGhYWFhoaGh4aGhoaGhoWFhYaGhoaGhoaGhoaFhYWGhoaGhoaGhoaGhYWFhoaGhoaGhoaGhoWFhYaGhoaGhoaGhoaFhYWGhoaGhoaGhoaGhYWFhoaGhoaGhoaGhoWFhYaGhoaGhoaGhoaFhYWGhoaGhoaGhoaGhYWFhoaGhoaGhoaGhYWFhYaGhoaGhoaGhoWFhYaGhoaGhoaGhoaFhYWGhoaGhoaGhoaGhYWFhoaGhoaGhoaGhYWFhYaGhoaGhoaGhoWFhYaGhoaGhoaGhoWFhYWGhoaGhoaGhoaFhYWFhoaGhoaGhoaGhYWFhYaGhoaGhoaGhoWFhYWGhoaGhoaGhoaFhYWFhoaGhoaGhoaFhYWFhYaGhoaGhoaGhYWFhYaGhoaGhoaGhYWFhYWGhoaGhoaGhoWFhYWGhoaGhoaGhoWFhYWFhoaGhoaGhoaFhYWFhoaGhoaGhoaFhYWFhYaGhoaGhoaGhYWFhYaGhoaGhoaGhYWFhYWGhoaGhoaGhYWFhYWFhoaGhoaGhoWFhYWFhoaGhoaGhoWFhYWFhoaGhoaGhoWFhYWFhYaGhoaGhoaFhYWFhYaGhoaGhoWFhYWFhYaGhoaGhoaFhYWFhYaGhoaGhoWFhYWFhYaGhoaGhoWFhYWFhYaGhoaGhoWFhYWFhYaGhoaGhoWFhYWFhYWGhoaGhoaFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhYWFhYWFhYWGhoaGhoWFhYWFhYWGhoaGhYWFhYWFhYWGhoaGhYWFhYWFhYWGhoaGhYWFhYWFhYWGhoaFhYWFhYWFhYWGhoaFhYWFhYWFhYWGhoaFhYWFhYWFhYWGhoWFhYWFhYWFhYaGhYWFhYWFhYWFhoaFhYWFhYWFhYWGhoWFhYWFhYWFhYaGhYWFhYWFhYWFhoWFhYWFhYWFhYaGhYWFhYWFhYWFhYWFhYWFhYWFhYaFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhQ==';

export const useOrderNotifications = () => {
  const { data: pendingData, isSuccess } = usePendingOrderCount();
  const previousCountRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasRequestedPermission = useRef(false);

  // Initialiser l'audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.volume = 0.5;
  }, []);

  // Demander la permission pour les notifications
  const requestPermission = useCallback(async () => {
    if (hasRequestedPermission.current) return;

    if ('Notification' in window && Notification.permission === 'default') {
      hasRequestedPermission.current = true;
      await Notification.requestPermission();
    }
  }, []);

  // Jouer le son
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay peut être bloqué, ignorer l'erreur
      });
    }
  }, []);

  // Afficher la notification navigateur
  const showBrowserNotification = useCallback((count: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Nouvelle commande !', {
        body: `Vous avez ${count} commande${count > 1 ? 's' : ''} en attente`,
        icon: '/favicon.ico',
        tag: 'new-order',
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = '/online-orders';
        notification.close();
      };

      // Fermer automatiquement après 10 secondes
      setTimeout(() => notification.close(), 10000);
    }
  }, []);

  // Vérifier les nouvelles commandes
  useEffect(() => {
    if (!isSuccess || pendingData === undefined) return;

    const currentCount = pendingData.count;

    // Demander la permission au premier chargement
    if (previousCountRef.current === null) {
      previousCountRef.current = currentCount;
      requestPermission();
      return;
    }

    // Nouvelle commande détectée
    if (currentCount > previousCountRef.current) {
      const newOrders = currentCount - previousCountRef.current;

      // Jouer le son
      playNotificationSound();

      // Afficher notification navigateur
      showBrowserNotification(currentCount);

      // Toast dans l'app
      toast.info(
        `${newOrders} nouvelle${newOrders > 1 ? 's' : ''} commande${newOrders > 1 ? 's' : ''} !`,
        {
          action: {
            label: 'Voir',
            onClick: () => window.location.href = '/online-orders',
          },
        }
      );
    }

    previousCountRef.current = currentCount;
  }, [isSuccess, pendingData, requestPermission, playNotificationSound, showBrowserNotification]);

  return {
    pendingCount: pendingData?.count ?? 0,
    requestPermission,
  };
};
