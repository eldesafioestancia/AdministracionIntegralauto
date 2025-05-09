import axios from 'axios';

// Función para crear trabajos agrícolas de ejemplo
async function createSamplePastureWorks() {
  const API_URL = 'http://localhost:5000';
  
  try {
    console.log('Creando trabajos agrícolas de ejemplo...');
    
    // Trabajo 1: Siembra de maíz en Lote Norte
    const trabajo1 = {
      pastureId: 1, // ID del Lote Norte
      workType: "siembra",
      description: "Siembra de maíz híbrido",
      startDate: "2025-04-15",
      endDate: "2025-04-18",
      machineId: 1, // John Deere 5090E
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
      seedQuantity: "25.2" // kg/ha
    };
    
    // Trabajo 2: Fertilización en Campo Sur
    const trabajo2 = {
      pastureId: 2, // ID del Campo Sur
      workType: "fertilizacion",
      description: "Aplicación de fertilizante para pastura",
      startDate: "2025-04-28",
      endDate: "2025-04-29",
      machineId: 3, // New Holland T7.315
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
      fertilizerQuantity: "150" // kg/ha
    };
    
    // Crear los trabajos agrícolas
    const response1 = await axios.post(`${API_URL}/api/pasture-works`, trabajo1);
    console.log('Trabajo agrícola 1 creado:', response1.data);
    
    const response2 = await axios.post(`${API_URL}/api/pasture-works`, trabajo2);
    console.log('Trabajo agrícola 2 creado:', response2.data);
    
    console.log('Trabajos agrícolas de ejemplo creados exitosamente');
  } catch (error) {
    console.error('Error al crear trabajos agrícolas de ejemplo:', error);
  }
}

// Ejecutar la función
createSamplePastureWorks();