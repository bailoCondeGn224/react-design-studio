import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si l'utilisateur est sur mobile
 * Breakpoint: < 768px (tailwind md)
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initial
    checkIsMobile();

    // Listen to resize
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};
