import { seedPastures } from './sample-pastures';

// Esperar un poco para que el servidor esté completamente iniciado
setTimeout(() => {
  console.log("[Load Pastures] Iniciando carga de parcelas...");
  seedPastures()
    .then(() => {
      console.log("[Load Pastures] Parcelas cargadas correctamente");
    })
    .catch(err => {
      console.error("[Load Pastures] Error al cargar parcelas:", err);
    });
}, 5000); // Esperar 5 segundos