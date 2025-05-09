import axios from 'axios';

// Función para crear parcelas de ejemplo
async function createSamplePastures() {
  const API_URL = 'http://localhost:5000';
  
  try {
    console.log('Creando parcelas de ejemplo...');
    
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
    
    // Crear las parcelas
    const response1 = await axios.post(`${API_URL}/api/pastures`, parcela1);
    console.log('Parcela 1 creada:', response1.data);
    
    const response2 = await axios.post(`${API_URL}/api/pastures`, parcela2);
    console.log('Parcela 2 creada:', response2.data);
    
    console.log('Parcelas de ejemplo creadas exitosamente');
  } catch (error) {
    console.error('Error al crear parcelas de ejemplo:', error);
  }
}

// Ejecutar la función
createSamplePastures();