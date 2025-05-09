/**
 * Script para crear parcelas de ejemplo en el sistema usando la API
 * 
 * Para ejecutar:
 * npx tsx create-sample-pastures.ts
 */

// Importamos librería de cliente HTTP
import axios from 'axios';

async function main() {
  try {
    console.log("Iniciando creación de parcelas de ejemplo...");
    
    // URL base de la API
    const API_URL = "http://localhost:5000";

    // Parcela 1: Lote Norte
    const parcela1 = {
      name: "Lote Norte",
      area: "45.8",
      location: "Sector Norte de la Estancia",
      soilType: "Arcilloso",
      waterSource: "Arroyo permanente, tanque australiano",
      status: "active",
      latitude: "-34.584912",
      longitude: "-58.412954",
      acquisitionDate: "2010-05-15",
      acquisitionValue: "850000",
      description: "Excelente tierra para cultivos de maíz y soja. Cuenta con acceso directo desde el camino principal y buena infraestructura de riego."
    };
    
    // Crear Parcela 1
    const responseParcela1 = await axios.post(`${API_URL}/api/pastures`, parcela1);
    console.log("✓ Creada Parcela 1:", responseParcela1.data.name, `(ID: ${responseParcela1.data.id})`);
    
    // Trabajo agrícola para Parcela 1
    const trabajo1 = {
      pastureId: responseParcela1.data.id,
      workType: "siembra",
      description: "Siembra de maíz híbrido",
      startDate: "2025-04-15",
      endDate: "2025-04-18",
      machineId: 1,
      areaWorked: "42.3",
      workingHours: "32.5",
      fuelUsed: "355",
      operativeCost: "125000",
      suppliesCost: "480000",
      totalCost: "605000",
      weatherConditions: "Despejado, leve viento del este",
      temperature: "24.5",
      soilHumidity: "65",
      observations: "Siembra realizada en condiciones óptimas, aprovechando humedad de lluvias previas",
      seedType: "Maíz DK 7210 VT3P",
      seedQuantity: "25.2"
    };
    
    // Crear trabajo agrícola para Parcela 1
    const responseTrabajo1 = await axios.post(`${API_URL}/api/pasture-works`, trabajo1);
    console.log("✓ Creado trabajo agrícola para Parcela 1:", responseTrabajo1.data.workType);
    
    // Parcela 2: Campo Sur
    const parcela2 = {
      name: "Campo Sur",
      area: "32.5",
      location: "Sector Sur, lindante con ruta provincial",
      soilType: "Franco-arenoso",
      waterSource: "Aguada natural, molino de viento",
      status: "active",
      latitude: "-34.593827",
      longitude: "-58.425381",
      acquisitionDate: "2015-11-23",
      acquisitionValue: "620000",
      description: "Ideal para pastoreo. Cuenta con alambrado perimetral en buen estado y corrales para manejo de hacienda. Apto para cultivo de forrajeras."
    };
    
    // Crear Parcela 2
    const responseParcela2 = await axios.post(`${API_URL}/api/pastures`, parcela2);
    console.log("✓ Creada Parcela 2:", responseParcela2.data.name, `(ID: ${responseParcela2.data.id})`);
    
    // Trabajo agrícola para Parcela 2
    const trabajo2 = {
      pastureId: responseParcela2.data.id,
      workType: "fertilizacion",
      description: "Aplicación de fertilizante para pastura",
      startDate: "2025-04-28",
      endDate: "2025-04-29",
      machineId: 3,
      areaWorked: "30.8",
      workingHours: "16.0",
      fuelUsed: "180",
      operativeCost: "85000",
      suppliesCost: "320000",
      totalCost: "405000",
      weatherConditions: "Nublado, sin viento",
      temperature: "22.8",
      soilHumidity: "58",
      observations: "Aplicación un día antes de lluvia pronosticada para mejor absorción",
      fertilizerType: "Urea 46-0-0",
      fertilizerQuantity: "150"
    };
    
    // Crear trabajo agrícola para Parcela 2
    const responseTrabajo2 = await axios.post(`${API_URL}/api/pasture-works`, trabajo2);
    console.log("✓ Creado trabajo agrícola para Parcela 2:", responseTrabajo2.data.workType);
    
    console.log("\n✅ Creación de parcelas y trabajos completada con éxito");
    
  } catch (error) {
    console.error("❌ Error creando parcelas:", error);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
    }
  }
}

// Ejecutar la función principal
main();