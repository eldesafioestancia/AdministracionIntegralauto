import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/AuthContext";
import { SyncProvider } from "./context/SyncContext";

// Register service worker for PWA
// Temporarily disabling service worker until we fix class extension issues
/*
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
*/

// Elemento raíz para montar la aplicación
const rootElement = document.getElementById("root");

// Verificación de seguridad
if (!rootElement) {
  console.error("No se pudo encontrar el elemento raíz 'root' en el DOM");
} else {
  console.log("Elemento root encontrado, intentando renderizar la aplicación");
  try {
    createRoot(rootElement).render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SyncProvider>
            <App />
          </SyncProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
    console.log("Renderizado completado");
  } catch (error) {
    console.error("Error al renderizar la aplicación:", error);
  }
}
