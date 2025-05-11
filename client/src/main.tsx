import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Elemento raíz para montar la aplicación
const rootElement = document.getElementById("root");

// Verificación de seguridad
if (!rootElement) {
  console.error("No se pudo encontrar el elemento raíz 'root' en el DOM");
} else {
  console.log("Elemento root encontrado, intentando renderizar la aplicación simplificada");
  try {
    createRoot(rootElement).render(<App />);
    console.log("Renderizado completado");
  } catch (error) {
    console.error("Error al renderizar la aplicación:", error);
  }
}
