/**
 * Service Worker Registration for PWA Installability
 */
export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('EBMS ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('EBMS ServiceWorker registration failed:', error);
        });
    });
  }
}
