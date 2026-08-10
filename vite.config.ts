import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

const DEFAULT_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_TILE_PATTERN =
  /^https:\/\/([a-z0-9-]+\.)*tile\.openstreetmap\.org\/.*/i;

/**
 * Motif d'URL des tuiles, dérivé du fournisseur configuré.
 *
 * Le service worker est généré au build: le motif doit donc suivre
 * VITE_TILE_URL, sinon un changement de fournisseur désactiverait
 * silencieusement le cache et la carte redeviendrait grise hors réseau.
 */
const buildTilePattern = (tileUrl: string): RegExp => {
  try {
    const host = new URL(tileUrl.replace('{s}.', '')).hostname;
    const escaped = host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^https://([a-z0-9-]+\\.)*${escaped}/.*`, 'i');
  } catch {
    return DEFAULT_TILE_PATTERN;
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const TILE_HOST_PATTERN = buildTilePattern(env.VITE_TILE_URL || DEFAULT_TILE_URL);

  return ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Walli Indistrie - Gestion Boutique',
        short_name: 'Walli Indistrie',
        description: 'Application de gestion de boutique professionnelle pour Walli Indistrie',
        theme_color: '#2f7a3d',
        background_color: '#e8f4ea',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            // Tuiles de carte: indispensables au suivi de livraison, et
            // rejouées en boucle sur les mêmes quartiers. Sans ce cache, la
            // carte est grise dès que le réseau faiblit.
            // Élargir ce motif si VITE_TILE_URL pointe ailleurs qu'OSM.
            urlPattern: TILE_HOST_PATTERN,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                // ~800 tuiles: de quoi couvrir largement une ville comme Conakry
                maxEntries: 800,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Itinéraires: un même trajet est recalculé à chaque relevé GPS
            // quantifié. Le réseau reste prioritaire, le cache sert de filet.
            urlPattern: /^https:\/\/router\.project-osrm\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'routing-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 30 // 30 minutes
              },
              networkTimeoutSeconds: 8
            }
          }
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: false, // Désactivé en dev pour éviter les problèmes de cache
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  });
});
