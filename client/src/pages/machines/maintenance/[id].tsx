import React, { useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { z } from "zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Maintenance form schema
const maintenanceFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  time: z.string(),
  type: z.enum(["pre_start_check", "oil_filter_change", "maintenance_repair"], {
    required_error: "El tipo de mantenimiento es requerido",
  }),
  driver: z.string().optional(), // Chofer
  notes: z.string().optional(),
  isModified: z.boolean().default(true),
  modifiedAt: z.date().optional(),
  
  // Información del taller para mantenimiento y reparación
  workshopName: z.string().optional(), // Nombre del taller
  workshopAddress: z.string().optional(), // Dirección del taller
  workshopPhone: z.string().optional(), // Teléfono del taller
  
  // Campos para mantenimiento y reparación
  electricalSystem: z.boolean().default(false), // Eléctrico
  mechanicalSystem: z.boolean().default(false), // Mecánico
  frontAxle: z.boolean().default(false), // Tren delantero
  gearbox: z.boolean().default(false), // Caja
  differential: z.boolean().default(false), // Diferencial
  hydraulicSystem: z.boolean().default(false), // Hidráulico
  brakes: z.boolean().default(false), // Frenos
  diagnosis: z.string().optional(), // Diagnóstico
  
  // Costos de mantenimiento y reparación
  spareParts: z.string().optional(), // Descripción de repuestos
  sparePartsCost: z.string().optional(), // Costo total de repuestos en pesos
  labor: z.string().optional(), // Descripción de mano de obra
  laborCost: z.string().optional(), // Costo total de mano de obra en pesos
  totalCost: z.string().optional(), // Costo total
  
  // Previo al arranque
  gearboxOilLevel: z.boolean().default(false), // Chequear nivel aceite de caja
  engineOilLevel: z.boolean().default(false), // Chequear nivel aceite de motor
  fuelLevel: z.boolean().default(false), // Combustible
  batteryWater: z.boolean().default(false), // Agua de batería
  airPressure: z.boolean().default(false), // Presión de aire
  airFilterCleaning: z.boolean().default(false), // Limpiar filtro de aire
  oilBathAirFilter: z.boolean().default(false), // Limpiar filtro de aire baño aceite
  differentialVent: z.boolean().default(false), // Limpiar venteo de diferencial
  greasing: z.boolean().default(false), // Engrasar
  
  // Después del arranque
  fuelLeaks: z.boolean().default(false), // Posibles pérdidas de combustible
  engineOilLeaks: z.boolean().default(false), // Posibles pérdidas de aceite: Motor
  gearboxOilLeaks: z.boolean().default(false), // Posibles pérdidas de aceite: Caja
  differentialOilLeaks: z.boolean().default(false), // Posibles pérdidas de aceite: Diferencial
  hydraulicOilLeaks: z.boolean().default(false), // Posibles pérdidas de aceite: Hidráulico
  oilPressureTemp: z.boolean().default(false), // Presión de aceite y temperatura
  
  // Agregar aceite/combustible
  addOil: z.boolean().default(false), // Agregar aceite
  addOilQuantity: z.string().optional(), // Cantidad de aceite agregado
  addFuel: z.boolean().default(false), // Agregar combustible
  addFuelQuantity: z.string().optional(), // Cantidad de combustible agregado
  
  // Terminado el turno
  cutoffSwitch: z.boolean().default(false), // Llave de corte
  cleaning: z.boolean().default(false), // Limpiar
  generalCheck: z.boolean().default(false), // Chequeo general y reporte de fallas
  
  // Campos originales para cambio de aceite y filtros
  motorOil: z.boolean().default(false),
  motorOilQuantity: z.string().optional(),
  hydraulicOil: z.boolean().default(false),
  hydraulicOilQuantity: z.string().optional(),
  coolant: z.boolean().default(false),
  coolantQuantity: z.string().optional(),
  oilFilter: z.boolean().default(false),
  hydraulicFilter: z.boolean().default(false),
  fuelFilter: z.boolean().default(false),
  airFilter: z.boolean().default(false),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

export default function EditMaintenance() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const numericId = parseInt(id);

  // Get maintenance details
  const { data: maintenance, isLoading: maintenanceLoading, error: maintenanceError } = useQuery({
    queryKey: [`/api/maintenance/${id}`],
  });

  // Get machine details if maintenance is loaded
  const { data: machine, isLoading: machineLoading, error: machineError } = useQuery({
    queryKey: maintenance ? [`/api/machines/${maintenance.machineId}`] : null,
    enabled: !!maintenance,
  });

  // Initialize form after data is loaded
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {},
  });

  // Update form values when maintenance data is loaded
  useEffect(() => {
    if (maintenance) {
      // Set form default values from loaded maintenance
      form.reset({
        ...maintenance,
        // Convert any dates if needed
        date: maintenance.date ? new Date(maintenance.date) : new Date(),
        modifiedAt: new Date(), // Set current date as modified date
      });
    }
  }, [maintenance, form]);

  const motorOilChecked = form.watch("motorOil");
  const hydraulicOilChecked = form.watch("hydraulicOil");
  const coolantChecked = form.watch("coolant");
  const addOilChecked = form.watch("addOil");
  const addFuelChecked = form.watch("addFuel");

  async function onSubmit(values: MaintenanceFormValues) {
    try {
      await apiRequest("PUT", `/api/maintenance/${id}`, {
        ...values,
        machineId: maintenance.machineId
      });

      // Invalidate maintenance queries to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/maintenance/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/maintenance?machineId=${maintenance.machineId}`] });

      toast({
        title: "Mantenimiento actualizado",
        description: "El registro de mantenimiento ha sido actualizado exitosamente",
      });

      // Navigate back to machine details
      navigate(`/machines/${maintenance.machineId}`);

    } catch (error) {
      console.error("Error updating maintenance record:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro de mantenimiento",
        variant: "destructive",
      });
    }
  }

  if (maintenanceLoading || (maintenance && machineLoading)) {
    return <div className="py-10 text-center">Cargando información...</div>;
  }

  if (maintenanceError || !maintenance || (maintenance && machineError)) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Error al cargar la información</div>
        <Button
          variant="outline"
          onClick={() => navigate("/machines")}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Editar Mantenimiento</h1>
          <p className="text-neutral-400">
            {machine?.brand} {machine?.model} - {machine?.hours} horas
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/machines/${maintenance.machineId}`)}>
          <i className="ri-arrow-left-line mr-1"></i> Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del mantenimiento</CardTitle>
          <CardDescription>Actualice la información del mantenimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          placeholder="HH:MM"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de mantenimiento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pre_start_check">Control previo puesta en marcha</SelectItem>
                          <SelectItem value="oil_filter_change">Cambio de aceite y filtros</SelectItem>
                          <SelectItem value="maintenance_repair">Mantenimiento y reparación</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chofer/Conductor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del chofer o conductor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("type") === "maintenance_repair" && (
                <div className="space-y-6">
                  {/* Información del taller */}
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Información del Taller</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="workshopName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del taller</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre del taller" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="workshopPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="Número de teléfono" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="col-span-1 md:col-span-2">
                        <FormField
                          control={form.control}
                          name="workshopAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dirección</FormLabel>
                              <FormControl>
                                <Input placeholder="Dirección del taller" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sistemas afectados */}
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Sistemas revisados/reparados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                      <FormField
                        control={form.control}
                        name="electricalSystem"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Eléctrico</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mechanicalSystem"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Mecánico</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="frontAxle"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Tren delantero</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gearbox"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Caja</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="differential"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Diferencial</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hydraulicSystem"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Hidráulico</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="brakes"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Frenos</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Diagnóstico */}
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Diagnóstico</h3>
                    <FormField
                      control={form.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Describa el diagnóstico realizado"
                              className="min-h-[100px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Costos */}
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Costos</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                          <FormField
                            control={form.control}
                            name="spareParts"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Repuestos</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Detalle de repuestos utilizados"
                                    className="min-h-[80px] resize-y"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="sparePartsCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo repuestos ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                          <FormField
                            control={form.control}
                            name="labor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mano de obra</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Detalle de la mano de obra realizada"
                                    className="min-h-[80px] resize-y"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="laborCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo mano de obra ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="totalCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Costo total ($)</FormLabel>
                            <FormControl>
                              <Input placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.watch("type") === "pre_start_check" ? (
                <div className="space-y-6">
                  {/* Sección de inspección previa al arranque */}
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Controles previos al arranque</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <FormField
                        control={form.control}
                        name="gearboxOilLevel"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Nivel de aceite de caja</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="engineOilLevel"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Nivel de aceite de motor</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fuelLevel"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Nivel de combustible</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="batteryWater"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Agua de batería</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="airPressure"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Presión de aire</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="airFilterCleaning"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Limpieza filtro de aire</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="oilBathAirFilter"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Filtro de aire baño de aceite</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="differentialVent"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Venteo de diferencial</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="greasing"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Engrase general</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Sección de verificación después del arranque */}
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Controles después del arranque</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <FormField
                        control={form.control}
                        name="fuelLeaks"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Pérdidas de combustible</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="engineOilLeaks"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Pérdidas de aceite: Motor</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gearboxOilLeaks"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Pérdidas de aceite: Caja</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="differentialOilLeaks"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Pérdidas de aceite: Diferencial</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hydraulicOilLeaks"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Pérdidas de aceite: Hidráulico</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="oilPressureTemp"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Presión de aceite y temperatura</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <div className="flex items-start space-x-2">
                          <FormField
                            control={form.control}
                            name="addOil"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1">
                                  <FormLabel>Agregar aceite</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        {addOilChecked && (
                          <div className="ml-6 mt-2">
                            <FormField
                              control={form.control}
                              name="addOilQuantity"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        placeholder="0"
                                        className="w-20"
                                      />
                                    </FormControl>
                                    <span className="text-sm text-neutral-500">litros</span>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-start space-x-2">
                          <FormField
                            control={form.control}
                            name="addFuel"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1">
                                  <FormLabel>Agregar combustible</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        {addFuelChecked && (
                          <div className="ml-6 mt-2">
                            <FormField
                              control={form.control}
                              name="addFuelQuantity"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        placeholder="0"
                                        className="w-20"
                                      />
                                    </FormControl>
                                    <span className="text-sm text-neutral-500">litros</span>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Sección de terminado el turno */}
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Terminado el turno</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <FormField
                        control={form.control}
                        name="cutoffSwitch"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Llave de corte</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cleaning"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Limpiar</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="generalCheck"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Chequeo general y reporte de fallas</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              
              ) : form.watch("type") === "oil_filter_change" ? (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-neutral-500 mb-4">Notas de mantenimiento</h3>
                  <div className="text-sm text-neutral-400 italic py-4">
                    Registre cualquier observación relevante sobre el cambio de aceite y filtros en la sección de notas adicionales.
                  </div>
                </div>
              ) : (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-neutral-500 mb-4">Tareas realizadas</h3>
  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <div className="flex items-start space-x-2">
                        <FormField
                          control={form.control}
                          name="motorOil"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel>Aceite motor</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      {motorOilChecked && (
                        <div className="ml-6 mt-2">
                          <FormField
                            control={form.control}
                            name="motorOilQuantity"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center space-x-2">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="0"
                                      className="w-20"
                                    />
                                  </FormControl>
                                  <span className="text-sm text-neutral-500">litros</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
  
                    <div>
                      <div className="flex items-start space-x-2">
                        <FormField
                          control={form.control}
                          name="hydraulicOil"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel>Aceite hidráulico</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      {hydraulicOilChecked && (
                        <div className="ml-6 mt-2">
                          <FormField
                            control={form.control}
                            name="hydraulicOilQuantity"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center space-x-2">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="0"
                                      className="w-20"
                                    />
                                  </FormControl>
                                  <span className="text-sm text-neutral-500">litros</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
  
                    <div>
                      <div className="flex items-start space-x-2">
                        <FormField
                          control={form.control}
                          name="coolant"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel>Refrigerante</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      {coolantChecked && (
                        <div className="ml-6 mt-2">
                          <FormField
                            control={form.control}
                            name="coolantQuantity"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center space-x-2">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="0"
                                      className="w-20"
                                    />
                                  </FormControl>
                                  <span className="text-sm text-neutral-500">litros</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
  
                    <FormField
                      control={form.control}
                      name="oilFilter"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel>Filtro de aceite</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
  
                    <FormField
                      control={form.control}
                      name="hydraulicFilter"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel>Filtro hidráulico</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
  
                    <FormField
                      control={form.control}
                      name="fuelFilter"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel>Filtro de combustible</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
  
                    <FormField
                      control={form.control}
                      name="airFilter"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel>Filtro de aire</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones, detalles o información adicional..."
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-6 pt-4 border-t flex justify-between">
                <div className="text-sm text-neutral-500 flex flex-col">
                  <span>Fecha de creación: {format(new Date(maintenance.createdAt), "dd/MM/yyyy HH:mm")}</span>
                  {maintenance.isModified && maintenance.modifiedAt && (
                    <span>Última modificación: {format(new Date(maintenance.modifiedAt), "dd/MM/yyyy HH:mm")}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/machines/${maintenance.machineId}`)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar cambios</Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}