import { storage } from "./server/storage";

// Categorías posibles para los animales
const categories = ["vaca", "vaquillona", "toro", "novillo", "ternero", "ternera"];

// Estados reproductivos y sus categorías aplicables
const reproductiveStates = {
  vaca: ["vacia", "servicio", "prenada", "parida"],
  vaquillona: ["vacia", "servicio", "prenada", "parida"],
  toro: ["en_servicio", "no_en_servicio"],
  novillo: ["no_aplica"],
  ternero: ["no_aplica"],
  ternera: ["no_aplica"]
};

// Colores de caravana
const cartagenaColors = ["rojo", "amarillo", "azul", "verde", "violeta", "naranja", "rosa", "blanco", "negro"];

// Condiciones corporales
const bodyConditions = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];

// Función para obtener un elemento aleatorio de un array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Función para generar una fecha aleatoria entre dos fechas
function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Función principal para actualizar los animales con datos aleatorios
async function updateAnimalsWithRandomData() {
  try {
    console.log("Comenzando actualización de datos de animales...");
    
    // Obtener todos los animales
    const animals = await storage.getAnimals();
    
    for (const animal of animals) {
      // Asignar categoría aleatoria
      const category = getRandomItem(categories);
      
      // Asignar estado reproductivo aleatorio según la categoría
      const reproductiveStatus = getRandomItem(reproductiveStates[category as keyof typeof reproductiveStates]);
      
      // Asignar color de caravana aleatorio
      const cartagenaColor = getRandomItem(cartagenaColors);
      
      // Asignar condición corporal aleatoria
      const bodyCondition = getRandomItem(bodyConditions);
      
      // Asignar ubicación aleatoria
      const locations = ["Potrero Norte", "Potrero Sur", "Corral 1", "Corral 2", "Campo nuevo", "Lote 5", "Potrero Central"];
      const location = getRandomItem(locations);
      
      // Asignar peso aleatorio
      const currentWeight = (Math.floor(Math.random() * 500) + 200).toString(); // Entre 200 y 700 kg
      
      // Fecha de última pesada (entre 1 y 90 días atrás)
      const now = new Date();
      const lastWeightDate = getRandomDate(new Date(now.setDate(now.getDate() - 90)), new Date());
      
      // Para animales preñados, fecha estimada de parto (entre 30 y 270 días en el futuro)
      let expectedDeliveryDate = null;
      if (reproductiveStatus === "prenada") {
        const today = new Date();
        expectedDeliveryDate = getRandomDate(
          new Date(today.setDate(today.getDate() + 30)), 
          new Date(today.setDate(today.getDate() + 240))
        );
      }

      // Actualizar el animal
      await storage.updateAnimal(animal.id, {
        category,
        reproductiveStatus,
        cartagenaColor,
        bodyCondition,
        location,
        currentWeight,
        lastWeightDate,
        expectedDeliveryDate,
        // Añadir padres aleatorios para algunos animales (50% de probabilidad)
        fatherCartagena: Math.random() > 0.5 ? `T${Math.floor(Math.random() * 100)}` : "",
        motherCartagena: Math.random() > 0.5 ? `V${Math.floor(Math.random() * 500)}` : "",
      });
      
      console.log(`Animal #${animal.id} (Caravana: ${animal.cartagena}) actualizado: ${category}, ${reproductiveStatus}`);
    }
    
    console.log("Actualización de datos de animales completada con éxito.");
    
  } catch (error) {
    console.error("Error al actualizar datos de animales:", error);
  }
}

// Ejecutar la función de actualización
updateAnimalsWithRandomData().catch(console.error);