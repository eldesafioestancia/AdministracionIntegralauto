import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

// Esquema para el formulario de trabajo agrícola
const workFormSchema = z.object({
  machineId: z.number(),
  pastureId: z.number().nullable(),
  workType: z.string().min(1, { message: "Seleccione un tipo de trabajo" }),
  description: z.string().min(1, { message: "Ingrese una descripción" }),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  areaWorked: z.string().nullable().optional(),
  distance: z.string().nullable().optional(),
  workTime: z.string().nullable().optional(),
  fuelUsed: z.string().nullable().optional(),
  costPerUnit: z.string().nullable().optional(),
  unitType: z.string().nullable().optional(),
  operationalCost: z.string().nullable().optional(),
  suppliesCost: z.string().nullable().optional(),
  totalCost: z.string().nullable().optional(),
  revenueAmount: z.string().nullable().optional(),
  weatherCondition: z.string().nullable().optional(),
  temperature: z.string().nullable().optional(),
  soilHumidity: z.string().nullable().optional(),
  seedType: z.string().nullable().optional(),
  kgPerHa: z.string().nullable().optional(),
  agrochemicalType: z.string().nullable().optional(),
  litersPerHa: z.string().nullable().optional(),
  fertilizerType: z.string().nullable().optional(),
  amountPerHa: z.string().nullable().optional(),
  threadRolls: z.string().nullable().optional(),
  rollsPerHa: z.string().nullable().optional(),
  observations: z.string().nullable().optional(),
});

type WorkFormValues = z.infer<typeof workFormSchema>;

export default function EditMachineWork() {
  const { id, workId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const machineId = parseInt(id);
  const workIdNum = parseInt(workId);
  
  // Consultar información de la máquina
  const { data: machine, isLoading: isLoadingMachine } = useQuery({
    queryKey: [`/api/machines/${machineId}`],
  });
  
  // Consultar las parcelas para mostrar en el formulario
  const { data: pastures, isLoading: isLoadingPastures } = useQuery({
    queryKey: ["/api/pastures"],
  });
  
  // Consultar los trabajos para obtener el trabajo específico
  const { data: allWorks, isLoading: isLoadingWorks } = useQuery({
    queryKey: ["/api/pasture-works"],
  });
  
  // Filtrar para obtener el trabajo específico
  const currentWork = allWorks && Array.isArray(allWorks) 
    ? allWorks.find(work => work.id === workIdNum)
    : null;
  
  // Tipos de trabajo disponibles según el tipo de máquina
  const defaultWorkTypes = [
    "Siembra", "Cosecha", "Fumigación", "Fertilización", "Rastra", "Disco", 
    "Enrollado", "Nivelación", "Limpieza", "Otro"
  ];
  
  const bulldozerWorkTypes = [
    "Topado", "Rolado", "Escardificado", "Movimiento de tierra"
  ];
  
  const truckWorkTypes = [
    "Traslado de animales", "Traslado de rollos", "Traslado de cargas", 
    "Traslado de áridos", "Traslado de fardos"
  ];
  
  const vehicleWorkTypes = [
    "Supervisión", "Logística", "Transporte de personal"
  ];
  
  // Obtener los tipos de trabajo según el tipo de máquina
  const getWorkTypesByMachineType = (machineType) => {
    switch (machineType) {
      case "topadora": return bulldozerWorkTypes;
      case "camion": return truckWorkTypes;
      case "vehiculo": return vehicleWorkTypes;
      case "tractor":
      default: return defaultWorkTypes;
    }
  };
  
  // Inicializar el formulario con valores por defecto
  const workForm = useForm<WorkFormValues>({
    resolver: zodResolver(workFormSchema),
    defaultValues: {
      machineId: machineId,
      pastureId: null,
      workType: "",
      description: "",
      startDate: new Date(),
      endDate: null,
      areaWorked: "",
      distance: "",
      workTime: "",
      fuelUsed: "",
      costPerUnit: "",
      unitType: "",
      operationalCost: "",
      suppliesCost: "",
      totalCost: "",
      revenueAmount: "",
      weatherCondition: "",
      temperature: "",
      soilHumidity: "",
      seedType: "",
      kgPerHa: "",
      agrochemicalType: "",
      litersPerHa: "",
      fertilizerType: "",
      amountPerHa: "",
      threadRolls: "",
      rollsPerHa: "",
      observations: "",
    },
  });
  
  // Cargar los datos del trabajo cuando estén disponibles
  useEffect(() => {
    if (currentWork) {
      workForm.reset({
        machineId: machineId,
        pastureId: currentWork.pastureId || null,
        workType: currentWork.workType || "",
        description: currentWork.description || "",
        startDate: currentWork.startDate ? new Date(currentWork.startDate) : new Date(),
        endDate: currentWork.endDate ? new Date(currentWork.endDate) : null,
        areaWorked: currentWork.areaWorked?.toString() || "",
        distance: currentWork.distance?.toString() || "",
        workTime: currentWork.workingHours?.toString() || "",
        fuelUsed: currentWork.fuelUsed?.toString() || "",
        costPerUnit: currentWork.costPerUnit?.toString() || "",
        unitType: machine?.type === "vehiculo" || machine?.type === "camion" ? "km" : "ha",
        operationalCost: currentWork.operativeCost?.toString() || "",
        suppliesCost: currentWork.suppliesCost?.toString() || "",
        totalCost: currentWork.totalCost?.toString() || "",
        revenueAmount: "",
        weatherCondition: currentWork.weatherConditions || "",
        temperature: currentWork.temperature?.toString() || "",
        soilHumidity: currentWork.soilHumidity?.toString() || "",
        seedType: currentWork.seedType || "",
        kgPerHa: currentWork.seedQuantity?.toString() || "",
        agrochemicalType: currentWork.chemicalType || "",
        litersPerHa: currentWork.chemicalQuantity?.toString() || "",
        fertilizerType: currentWork.fertilizerType || "",
        amountPerHa: currentWork.fertilizerQuantity?.toString() || "",
        threadRolls: currentWork.threadRollsUsed?.toString() || "",
        rollsPerHa: currentWork.baleCount?.toString() || "",
        observations: currentWork.observations || "",
      });
    }
  }, [currentWork, machineId, workForm, machine]);
  
  // Manejar envío del formulario
  const onSubmit = async (values: WorkFormValues) => {
    try {
      // Calcular costo total si no existe
      if (!values.totalCost && values.operationalCost && values.suppliesCost) {
        const opCost = parseFloat(values.operationalCost);
        const supCost = parseFloat(values.suppliesCost);
        if (!isNaN(opCost) && !isNaN(supCost)) {
          values.totalCost = (opCost + supCost).toString();
        }
      }
      
      // Mapear los campos al formato esperado por la API
      const workData = {
        id: workIdNum,
        pastureId: values.pastureId,
        machineId: values.machineId,
        workType: values.workType,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate,
        areaWorked: values.areaWorked,
        distance: values.distance,
        workingHours: values.workTime,
        fuelUsed: values.fuelUsed,
        operativeCost: values.operationalCost,
        suppliesCost: values.suppliesCost,
        costPerUnit: values.costPerUnit,
        totalCost: values.totalCost,
        weatherConditions: values.weatherCondition,
        temperature: values.temperature,
        soilHumidity: values.soilHumidity,
        observations: values.observations,
        seedType: values.seedType,
        seedQuantity: values.kgPerHa,
        harvestQuantity: null,
        chemicalType: values.agrochemicalType,
        chemicalQuantity: values.litersPerHa,
        fertilizerType: values.fertilizerType,
        fertilizerQuantity: values.amountPerHa,
        baleCount: values.rollsPerHa,
        threadRollsUsed: values.threadRolls
      };
      
      // Llamar a la API para actualizar el trabajo
      await apiRequest("PUT", `/api/pasture-works/${workIdNum}`, workData);
      
      // Invalidar consultas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["/api/pasture-works"] });
      
      toast({
        title: "Trabajo actualizado",
        description: "El trabajo ha sido actualizado exitosamente",
      });
      
      // Redirigir a la página de detalles de la máquina
      navigate(`/machines/${machineId}`);
      
    } catch (error) {
      console.error("Error al actualizar el trabajo:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el trabajo",
        variant: "destructive",
      });
    }
  };
  
  // Carga de la página
  if (isLoadingMachine || isLoadingWorks || isLoadingPastures) {
    return <div className="text-center py-10">Cargando información...</div>;
  }
  
  if (!machine) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Máquina no encontrada</div>
        <Button
          variant="outline"
          onClick={() => navigate("/machines")}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }
  
  if (!currentWork) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Trabajo no encontrado</div>
        <Button
          variant="outline"
          onClick={() => navigate(`/machines/${machineId}`)}
        >
          Volver a la máquina
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-600 flex items-center">
            <i className={`ri-tools-line mr-2 ${
              machine.type === 'tractor' ? 'text-red-500' : 
              machine.type === 'topadora' ? 'text-green-500' : 
              machine.type === 'camion' ? 'text-blue-500' : 
              'text-amber-500'
            }`}></i>
            Editar Trabajo
          </h1>
          <p className="text-neutral-400 text-sm">
            {machine.brand} {machine.model} - {format(new Date(currentWork.startDate), "dd 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Button variant="outline" asChild>
            <a href={`/machines/${machineId}`}>
              <i className="ri-arrow-left-line mr-1"></i> Cancelar
            </a>
          </Button>
        </div>
      </div>
      
      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalles del Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...workForm}>
            <form onSubmit={workForm.handleSubmit(onSubmit)} className="space-y-6">
              {/* Sección de información básica */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={workForm.control}
                    name="workType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de trabajo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione el tipo de trabajo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getWorkTypesByMachineType(machine.type).map((workType) => (
                              <SelectItem key={workType} value={workType}>
                                {workType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Parcela - solo mostrar para tractores y topadoras */}
                  {(machine.type === 'tractor' || machine.type === 'topadora') && (
                    <FormField
                      control={workForm.control}
                      name="pastureId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parcela</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value === "0" ? null : parseInt(value))}
                            value={field.value?.toString() || "0"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar parcela" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Sin parcela</SelectItem>
                              {pastures && Array.isArray(pastures) && pastures.map((pasture) => (
                                <SelectItem key={pasture.id} value={pasture.id.toString()}>
                                  {pasture.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <FormField
                  control={workForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describa el trabajo realizado" 
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={workForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de inicio</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: es })
                                ) : (
                                  <span>Seleccione fecha</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de finalización</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: es })
                                ) : (
                                  <span>Seleccione fecha</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || (workForm.getValues("startDate") && date < workForm.getValues("startDate"))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Sección métricas */}
              <div className="pt-4 border-t border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-500 mb-3">Detalles Operativos</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Mostrar el campo de área trabajada solo para tractores y topadoras */}
                  {(machine.type === 'tractor' || machine.type === 'topadora') && (
                    <FormField
                      control={workForm.control}
                      name="areaWorked"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Superficie trabajada (Ha)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              step="0.01" 
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                field.onChange(e);
                                // Calcular costo total si hay valor de costo por hectárea
                                const area = parseFloat(e.target.value);
                                const costPerUnit = parseFloat(workForm.getValues("costPerUnit")?.toString() || "0");
                                if (!isNaN(area) && !isNaN(costPerUnit) && area > 0 && costPerUnit > 0) {
                                  const calculatedTotal = (area * costPerUnit).toFixed(2);
                                  workForm.setValue("totalCost", calculatedTotal);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* Mostrar el campo de distancia solo para camiones y vehículos */}
                  {(machine.type === 'camion' || machine.type === 'vehiculo') && (
                    <FormField
                      control={workForm.control}
                      name="distance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distancia recorrida (Km)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              step="0.1" 
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                field.onChange(e);
                                // Calcular costo total si hay valor de costo por kilómetro
                                const distance = parseFloat(e.target.value);
                                const costPerUnit = parseFloat(workForm.getValues("costPerUnit")?.toString() || "0");
                                if (!isNaN(distance) && !isNaN(costPerUnit) && distance > 0 && costPerUnit > 0) {
                                  const calculatedTotal = (distance * costPerUnit).toFixed(2);
                                  workForm.setValue("totalCost", calculatedTotal);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={workForm.control}
                    name="workTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas de trabajo</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            step="0.5" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={workForm.control}
                    name="fuelUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Combustible utilizado (litros)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Sección de costos */}
              <div className="pt-4 border-t border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-500 mb-3">Costos e Ingresos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={workForm.control}
                    name="operationalCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo operativo ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            step="100" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workForm.control}
                    name="suppliesCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo de insumos ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            step="100" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={workForm.control}
                    name="costPerUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo por {(machine.type === 'camion' || machine.type === 'vehiculo') ? 'kilómetro' : 'hectárea'} ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            step="10" 
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e);
                              // Calcular costo total si hay área/distancia
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                const areaOrDistance = (machine.type === 'camion' || machine.type === 'vehiculo')
                                  ? parseFloat(workForm.getValues("distance")?.toString() || "0") 
                                  : parseFloat(workForm.getValues("areaWorked")?.toString() || "0");
                                if (areaOrDistance > 0) {
                                  const calculatedTotal = (value * areaOrDistance).toFixed(2);
                                  workForm.setValue("totalCost", calculatedTotal);
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workForm.control}
                    name="totalCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo total ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            step="100" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Suma de costos operativos y de insumos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Sección de condiciones */}
              <div className="pt-4 border-t border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-500 mb-3">Condiciones y Observaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={workForm.control}
                    name="weatherCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condición climática</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="soleado">Soleado</SelectItem>
                            <SelectItem value="nublado">Nublado</SelectItem>
                            <SelectItem value="lluvioso">Lluvioso</SelectItem>
                            <SelectItem value="ventoso">Ventoso</SelectItem>
                            <SelectItem value="tormenta">Tormenta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workForm.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperatura (°C)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="25" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workForm.control}
                    name="soilHumidity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Humedad del suelo (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="50" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <FormField
                    control={workForm.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observaciones adicionales" 
                            className="resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
                <Button variant="outline" type="button" onClick={() => navigate(`/machines/${machineId}`)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}