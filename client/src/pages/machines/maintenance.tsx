import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";

// Maintenance form schema
const maintenanceFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  time: z.string(),
  type: z.enum(["pre_start_check", "oil_filter_change", "maintenance_repair"], {
    required_error: "El tipo de mantenimiento es requerido",
  }),
  driver: z.string().optional(),
  notes: z.string().optional(),
  isModified: z.boolean().default(false),
  modifiedAt: z.date().optional(),
  
  // Taller
  workshopName: z.string().optional(),
  workshopAddress: z.string().optional(),
  workshopPhone: z.string().optional(),
  
  // Mantenimiento
  electricalSystem: z.boolean().default(false),
  mechanicalSystem: z.boolean().default(false),
  frontAxle: z.boolean().default(false),
  gearbox: z.boolean().default(false),
  differential: z.boolean().default(false),
  hydraulicSystem: z.boolean().default(false),
  brakes: z.boolean().default(false),
  diagnosis: z.string().optional(),
  
  // Costos
  spareParts: z.string().optional(),
  sparePartsCost: z.string().optional(),
  labor: z.string().optional(),
  laborCost: z.string().optional(),
  totalCost: z.string().optional(),
  
  // Previo al arranque
  gearboxOilLevel: z.boolean().default(false),
  engineOilLevel: z.boolean().default(false),
  fuelLevel: z.boolean().default(false),
  batteryWater: z.boolean().default(false),
  airPressure: z.boolean().default(false),
  airFilterCleaning: z.boolean().default(false),
  oilBathAirFilter: z.boolean().default(false),
  differentialVent: z.boolean().default(false),
  greasing: z.boolean().default(false),
  
  // Después del arranque
  fuelLeaks: z.boolean().default(false),
  engineOilLeaks: z.boolean().default(false),
  gearboxOilLeaks: z.boolean().default(false),
  differentialOilLeaks: z.boolean().default(false),
  hydraulicOilLeaks: z.boolean().default(false),
  oilPressureTemp: z.boolean().default(false),
  
  // Aceite/combustible
  addOil: z.boolean().default(false),
  addOilQuantity: z.string().optional(),
  addFuel: z.boolean().default(false),
  addFuelQuantity: z.string().optional(),
  
  // Turno
  cutoffSwitch: z.boolean().default(false),
  cleaning: z.boolean().default(false),
  generalCheck: z.boolean().default(false),
  
  // Filtros
  oilFilter: z.boolean().default(false),
  hydraulicFilter: z.boolean().default(false),
  fuelFilter: z.boolean().default(false),
  airFilter: z.boolean().default(false),

  // Aceites del depósito - Estos campos son fijos
  motorOil: z.boolean().default(false),
  motorOilQuantity: z.string().optional(),
  hydraulicOil: z.boolean().default(false),
  hydraulicOilQuantity: z.string().optional(),
  transmissionOil: z.boolean().default(false),
  transmissionOilQuantity: z.string().optional(),
  differentialOil: z.boolean().default(false),
  differentialOilQuantity: z.string().optional(),
  coolant: z.boolean().default(false),
  coolantQuantity: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

interface Machine {
  id: number;
  brand: string;
  model: string;
  serialNumber: string;
  hours: number;
  year: number;
  status: string;
  type: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface WarehouseProduct {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export default function MachineMaintenance() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const numericId = parseInt(id);

  // Get machine details
  const { data: machine, isLoading: machineLoading, error: machineError } = useQuery<Machine>({
    queryKey: [`/api/machines/${id}`],
  });
  
  // Get warehouse fluid products for maintenance options
  const { data: warehouseProducts, isLoading: productsLoading } = useQuery<WarehouseProduct[]>({
    queryKey: ["/api/warehouse/products"],
    // Estamos usando datos mock por ahora
    queryFn: async () => {
      // Simular un delay
      await new Promise(resolve => setTimeout(resolve, 200));
      // Retornar los productos en la categoría de fluidos
      const mockProducts: WarehouseProduct[] = [
        {
          id: 1,
          name: "Aceite de motor",
          category: "fluidos",
          quantity: 8,
          unit: "litros",
          unitPrice: 2400,
          totalPrice: 19200,
        },
        {
          id: 2,
          name: "Aceite hidráulico",
          category: "fluidos",
          quantity: 5,
          unit: "litros",
          unitPrice: 2200,
          totalPrice: 11000,
        },
        {
          id: 3,
          name: "Refrigerante",
          category: "fluidos",
          quantity: 3,
          unit: "litros",
          unitPrice: 1800,
          totalPrice: 5400,
        },
        {
          id: 4,
          name: "Aceite de caja",
          category: "fluidos",
          quantity: 4,
          unit: "litros",
          unitPrice: 2600,
          totalPrice: 10400,
        },
        {
          id: 5,
          name: "Aceite de diferencial",
          category: "fluidos",
          quantity: 2,
          unit: "litros",
          unitPrice: 2800,
          totalPrice: 5600,
        }
      ];
      return mockProducts;
    }
  });

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      date: new Date(),
      time: format(new Date(), "HH:mm"),
      type: "pre_start_check",
      driver: "",
      notes: "",
      isModified: false,
      
      // Taller
      workshopName: "",
      workshopAddress: "",
      workshopPhone: "",
      
      // Mantenimiento
      electricalSystem: false,
      mechanicalSystem: false,
      frontAxle: false,
      gearbox: false,
      differential: false,
      hydraulicSystem: false,
      brakes: false,
      diagnosis: "",
      
      // Costos
      spareParts: "",
      sparePartsCost: "",
      labor: "",
      laborCost: "",
      totalCost: "",
      
      // Previo
      gearboxOilLevel: false,
      engineOilLevel: false,
      fuelLevel: false,
      batteryWater: false,
      airPressure: false,
      airFilterCleaning: false,
      oilBathAirFilter: false,
      differentialVent: false,
      greasing: false,
      
      // Después
      fuelLeaks: false,
      engineOilLeaks: false,
      gearboxOilLeaks: false,
      differentialOilLeaks: false,
      hydraulicOilLeaks: false,
      oilPressureTemp: false,
      
      // Aceite
      addOil: false,
      addOilQuantity: "",
      addFuel: false,
      addFuelQuantity: "",
      
      // Turno
      cutoffSwitch: false,
      cleaning: false,
      generalCheck: false,
      
      // Filtros
      oilFilter: false,
      hydraulicFilter: false,
      fuelFilter: false,
      airFilter: false,

      // Aceites - Depósito
      motorOil: false,
      motorOilQuantity: "",
      hydraulicOil: false,
      hydraulicOilQuantity: "",
      transmissionOil: false,
      transmissionOilQuantity: "",
      differentialOil: false,
      differentialOilQuantity: "",
      coolant: false,
      coolantQuantity: "",
    },
  });

  const motorOilChecked = form.watch("motorOil");
  const hydraulicOilChecked = form.watch("hydraulicOil");
  const transmissionOilChecked = form.watch("transmissionOil");
  const differentialOilChecked = form.watch("differentialOil");
  const coolantChecked = form.watch("coolant");
  const addOilChecked = form.watch("addOil");
  const addFuelChecked = form.watch("addFuel");
  const maintenanceType = form.watch("type");

  async function onSubmit(values: MaintenanceFormValues) {
    try {
      await apiRequest("POST", "/api/maintenance", {
        ...values,
        machineId: numericId
      });

      // Invalidate maintenance query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/maintenance?machineId=${id}`] });

      toast({
        title: "Mantenimiento registrado",
        description: "El registro de mantenimiento ha sido creado exitosamente",
      });

      // Navigate back to machine details
      navigate(`/machines/${id}`);

    } catch (error) {
      console.error("Error creating maintenance record:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro de mantenimiento",
        variant: "destructive",
      });
    }
  }

  if (machineLoading) {
    return <div className="py-10 text-center">Cargando información de la unidad...</div>;
  }

  if (machineError || !machine) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Error al cargar la unidad productiva</div>
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
          <h1 className="text-2xl font-header font-bold text-neutral-500">Registrar Mantenimiento</h1>
          <p className="text-neutral-400">
            {machine.brand} {machine.model} - {machine.hours} horas
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/machines/${id}`)}>
          <i className="ri-arrow-left-line mr-1"></i> Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del mantenimiento</CardTitle>
          <CardDescription>Complete la información del mantenimiento realizado</CardDescription>
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

              {/* Sección para Control previo puesta en marcha */}
              {maintenanceType === "pre_start_check" && (
                <div className="space-y-6">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Previo al arranque</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
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
                              <FormLabel>Combustible</FormLabel>
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
                              <FormLabel>Limpiar filtro de aire</FormLabel>
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
                              <FormLabel>Filtro aire baño aceite</FormLabel>
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
                              <FormLabel>Engrasar</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Después del arranque</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
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
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Agregar aceite/combustible</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div>
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

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Terminado el turno</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
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
              )}

              {/* Sección para Mantenimiento y Reparación */}
              {maintenanceType === "maintenance_repair" && (
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
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnóstico y trabajo realizado</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descripción del diagnóstico y trabajo realizado"
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Costos */}
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-neutral-500 mb-4">Costos</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="spareParts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción de repuestos</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Listado de repuestos utilizados"
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sparePartsCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo de repuestos</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Costo total en pesos"
                                  {...field}
                                  type="number"
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
                          name="labor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción de mano de obra</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Detalle de mano de obra"
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="laborCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo de mano de obra</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Costo total en pesos"
                                  {...field}
                                  type="number"
                                />
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
                            <FormLabel>Costo total</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Costo total en pesos"
                                {...field}
                                type="number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sección para Cambio de aceite y filtros */}
              {maintenanceType === "oil_filter_change" && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-neutral-500 mb-4">Tareas realizadas</h3>
                  
                  {productsLoading ? (
                    <div className="py-4 text-center">Cargando productos del depósito...</div>
                  ) : (
                    <div className="space-y-6">
                      {/* Sección de Fluidos */}
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500 mb-3">Fluidos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                          {/* Aceite de motor */}
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
                                        {warehouseProducts && warehouseProducts.find(p => p.name === "Aceite de motor") && (
                                          warehouseProducts.find(p => p.name === "Aceite de motor")!.quantity > 0 ? (
                                            <span className="text-xs text-green-600">
                                              (Disponible: {warehouseProducts.find(p => p.name === "Aceite de motor")!.quantity} litros)
                                            </span>
                                          ) : (
                                            <span className="text-xs text-red-600">
                                              (Sin stock)
                                            </span>
                                          )
                                        )}
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>

                          {/* Aceite hidráulico */}
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
                                        {warehouseProducts && warehouseProducts.find(p => p.name === "Aceite hidráulico") && (
                                          warehouseProducts.find(p => p.name === "Aceite hidráulico")!.quantity > 0 ? (
                                            <span className="text-xs text-green-600">
                                              (Disponible: {warehouseProducts.find(p => p.name === "Aceite hidráulico")!.quantity} litros)
                                            </span>
                                          ) : (
                                            <span className="text-xs text-red-600">
                                              (Sin stock)
                                            </span>
                                          )
                                        )}
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>

                          {/* Aceite de transmisión */}
                          <div>
                            <div className="flex items-start space-x-2">
                              <FormField
                                control={form.control}
                                name="transmissionOil"
                                render={({ field }) => (
                                  <FormItem className="flex items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1">
                                      <FormLabel>Aceite de caja</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                            {transmissionOilChecked && (
                              <div className="ml-6 mt-2">
                                <FormField
                                  control={form.control}
                                  name="transmissionOilQuantity"
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
                                        {warehouseProducts && warehouseProducts.find(p => p.name === "Aceite de caja") && (
                                          warehouseProducts.find(p => p.name === "Aceite de caja")!.quantity > 0 ? (
                                            <span className="text-xs text-green-600">
                                              (Disponible: {warehouseProducts.find(p => p.name === "Aceite de caja")!.quantity} litros)
                                            </span>
                                          ) : (
                                            <span className="text-xs text-red-600">
                                              (Sin stock)
                                            </span>
                                          )
                                        )}
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>

                          {/* Aceite de diferencial */}
                          <div>
                            <div className="flex items-start space-x-2">
                              <FormField
                                control={form.control}
                                name="differentialOil"
                                render={({ field }) => (
                                  <FormItem className="flex items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1">
                                      <FormLabel>Aceite diferencial</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                            {differentialOilChecked && (
                              <div className="ml-6 mt-2">
                                <FormField
                                  control={form.control}
                                  name="differentialOilQuantity"
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
                                        {warehouseProducts && warehouseProducts.find(p => p.name === "Aceite de diferencial") && (
                                          warehouseProducts.find(p => p.name === "Aceite de diferencial")!.quantity > 0 ? (
                                            <span className="text-xs text-green-600">
                                              (Disponible: {warehouseProducts.find(p => p.name === "Aceite de diferencial")!.quantity} litros)
                                            </span>
                                          ) : (
                                            <span className="text-xs text-red-600">
                                              (Sin stock)
                                            </span>
                                          )
                                        )}
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>

                          {/* Refrigerante */}
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
                                        {warehouseProducts && warehouseProducts.find(p => p.name === "Refrigerante") && (
                                          warehouseProducts.find(p => p.name === "Refrigerante")!.quantity > 0 ? (
                                            <span className="text-xs text-green-600">
                                              (Disponible: {warehouseProducts.find(p => p.name === "Refrigerante")!.quantity} litros)
                                            </span>
                                          ) : (
                                            <span className="text-xs text-red-600">
                                              (Sin stock)
                                            </span>
                                          )
                                        )}
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

                      {/* Sección de Filtros */}
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500 mb-3">Filtros</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
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
                    </div>
                  )}
                </div>
              )}

              {/* Notas adicionales - sólo para ciertos tipos */}
              {maintenanceType !== "maintenance_repair" && (
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Información adicional, observaciones, etc."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Registre cualquier observación relevante sobre el mantenimiento.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/machines/${id}`)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <i className="ri-save-line mr-1"></i> Guardar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}