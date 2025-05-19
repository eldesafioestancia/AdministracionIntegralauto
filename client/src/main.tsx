import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/AuthContext";
import { SyncProvider } from "./context/SyncContext";

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registrado correctamente:", registration);
        
        // Solicitar permisos de notificación cuando sea apropiado
        if ('Notification' in window) {
          // Verificar si ya tenemos permiso
          if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            // Esperar a que el usuario interactúe con la página antes de solicitar permisos
            document.addEventListener('click', function askNotificationPermission() {
              Notification.requestPermission().then(permission => {
                console.log('Permiso de notificación:', permission);
                // Remover el event listener después de solicitar el permiso
                document.removeEventListener('click', askNotificationPermission);
              });
            }, { once: true });
          }
        }
      })
      .catch((registrationError) => {
        console.error("Error al registrar el Service Worker:", registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SyncProvider>
        <App />
      </SyncProvider>
    </AuthProvider>
  </QueryClientProvider>
);
