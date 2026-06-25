import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Nettoyer les Service Workers en développement pour éviter les problèmes de cache
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('Service Worker désenregistré:', registration.scope);
    }
  });
  // Vider aussi les caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
        console.log('Cache supprimé:', name);
      }
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);


