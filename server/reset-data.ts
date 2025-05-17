import { storage } from "./storage";

/**
 * Función para eliminar todos los datos de la aplicación
 * Permite reiniciar el sistema llevando a cero todos los registros
 */
export async function resetAllData() {
  try {
    // Obtener todos los datos para eliminarlos uno por uno
    const machines = await storage.getMachines();
    const maintenances = await storage.getMaintenances();
    const machineFinances = await storage.getMachineFinances();
    const animals = await storage.getAnimals();
    const animalVets = await storage.getAnimalVeterinary();
    const animalFinances = await storage.getAnimalFinances();
    const animalWeights = await storage.getAnimalWeights();
    const pastures = await storage.getPastures();
    const pastureWorks = await storage.getPastureWorks();
    const pastureFinances = await storage.getPastureFinances();
    const investments = await storage.getInvestments();
    const capital = await storage.getCapital();
    
    // Eliminar trabajos agrícolas
    for (const work of pastureWorks) {
      await storage.deletePastureWork(work.id);
    }
    console.log("[Reset] Todos los trabajos agrícolas eliminados");
    
    // Eliminar registros de mantenimiento
    for (const maintenance of maintenances) {
      await storage.deleteMaintenance(maintenance.id);
    }
    console.log("[Reset] Todos los registros de mantenimiento eliminados");
    
    // Eliminar registros financieros de maquinaria
    for (const finance of machineFinances) {
      await storage.deleteMachineFinance(finance.id);
    }
    console.log("[Reset] Todos los registros financieros de maquinaria eliminados");
    
    // Eliminar registros financieros de animales
    for (const finance of animalFinances) {
      await storage.deleteAnimalFinance(finance.id);
    }
    console.log("[Reset] Todos los registros financieros de animales eliminados");
    
    // Eliminar registros de pesos de animales
    for (const weight of animalWeights) {
      await storage.deleteAnimalWeight(weight.id);
    }
    console.log("[Reset] Todos los registros de pesos de animales eliminados");
    
    // Eliminar registros veterinarios
    for (const vet of animalVets) {
      await storage.deleteAnimalVeterinary(vet.id);
    }
    console.log("[Reset] Todos los registros veterinarios eliminados");
    
    // Eliminar registros financieros de parcelas
    for (const finance of pastureFinances) {
      await storage.deletePastureFinance(finance.id);
    }
    console.log("[Reset] Todos los registros financieros de parcelas eliminados");
    
    // Eliminar registros de inversiones
    for (const inv of investments) {
      await storage.deleteInvestment(inv.id);
    }
    console.log("[Reset] Todas las inversiones eliminadas");
    
    // Eliminar registros de capital
    for (const cap of capital) {
      await storage.deleteCapital(cap.id);
    }
    console.log("[Reset] Todos los registros de capital eliminados");
    
    // Eliminar parcelas
    for (const pasture of pastures) {
      await storage.deletePasture(pasture.id);
    }
    console.log("[Reset] Todas las parcelas eliminadas");
    
    // Eliminar animales
    for (const animal of animals) {
      await storage.deleteAnimal(animal.id);
    }
    console.log("[Reset] Todos los animales eliminados");
    
    // Eliminar maquinaria
    for (const machine of machines) {
      await storage.deleteMachine(machine.id);
    }
    console.log("[Reset] Toda la maquinaria eliminada");
    
    return { success: true, message: "Todos los datos de la aplicación han sido eliminados correctamente" };
  } catch (error) {
    console.error("[Reset] Error al eliminar datos:", error);
    return { success: false, message: "Error al eliminar los datos de la aplicación" };
  }
}