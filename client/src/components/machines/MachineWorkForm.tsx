import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Esquema para validación del formulario
const workFormSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  workType: z.string().min(1, "El tipo de trabajo es requerido"),
  startDate: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
  endDate: z.date().optional().nullable(),
  workArea: z.string().optional().nullable(),
  workTime: z.string().optional().nullable(),
  fuelUsed: z.string().optional().nullable(),
  operationalCost: z.string().optional().nullable(),
  suppliesCost: z.string().optional().nullable(),
  totalCost: z.string().optional().nullable(),
  weatherConditions: z.string().optional().nullable(),
  temperature: z.string().optional().nullable(),
  soilHumidity: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  
  // Campos específicos según tipo de trabajo
  seedType: z.string().optional().nullable(),
  seedPerHectare: z.string().optional().nullable(),
  agrochemicalType: z.string().optional().nullable(),
  agrochemicalPerHectare: z.string().optional().nullable(),
  fertilizerType: z.string().optional().nullable(),
  fertilizerPerHectare: z.string().optional().nullable(),
  threadRollsUsed: z.string().optional().nullable(),
});

type WorkFormValues = z.infer<typeof workFormSchema>;

interface MachineWorkFormProps {
  machineId: number;
  onSuccess?: () => void;
}

export default function MachineWorkForm({ machineId, onSuccess }: MachineWorkFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Obtener información de la máquina
  const { data: machine } = useQuery({
    queryKey: [`/api/machines/${machineId}`],
  });

  // Lista de tipos de trabajo
  const workTypes = [
    { value: "siembra", label: "Siembra" },
    { value: "cosecha", label: "Cosecha" },
    { value: "fumigacion", label: "Fumigación" },
    { value: "fertilizacion", label: "Fertilización" },
    { value: "rastra", label: "Rastra" },
    { value: "arado", label: "Arado" },
    { value: "cincel", label: "Cincel" },
    { value: "corte", label: "Corte" },
    { value: "rastrillado", label: "Rastrillado" },
    { value: "enrollado", label: "Enrollado" },
  ];

  // Formulario
  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workFormSchema),
    defaultValues: {
      description: "",
      workType: "",
      startDate: new Date(),
      endDate: null,
      workArea: "",
      workTime: "",
      fuelUsed: "",
      operationalCost: "",
      suppliesCost: "",
      totalCost: "",
      weatherConditions: "",
      temperature: "",
      soilHumidity: "",
      observations: "",
      seedType: "",
      seedPerHectare: "",
      agrochemicalType: "",
      agrochemicalPerHectare: "",
      fertilizerType: "",
      fertilizerPerHectare: "",
      threadRollsUsed: "",
    },
  });

  // Calcular costo total
  useEffect(() => {
    const operationalCost = parseFloat(form.watch("operationalCost") || "0");
    const suppliesCost = parseFloat(form.watch("suppliesCost") || "0");
    
    if (!isNaN(operationalCost) || !isNaN(suppliesCost)) {
      const total = (operationalCost || 0) + (suppliesCost || 0);
      form.setValue("totalCost", total.toString());
    }
  }, [form.watch("operationalCost"), form.watch("suppliesCost")]);

  // Enviar formulario
  async function onSubmit(values: WorkFormValues) {
    setIsSubmitting(true);
    
    try {
      // Obtenemos los trabajos de parcela asociados a la máquina para comprobar si ya existe
      const response = await apiRequest("GET", `/api/pasture-works?machineId=${machineId}`);
      const existingWorks = response as any[];
      let pastureWorkId = null;
      
      // Si existe algún trabajo de parcela relacionado, usamos su ID
      if (existingWorks && existingWorks.length > 0) {
        // Buscamos un trabajo que coincida con el mismo tipo y fecha aproximada
        const matchingWork = existingWorks.find((w: any) => 
          w.workType === values.workType && 
          new Date(w.startDate).toDateString() === new Date(values.startDate).toDateString()
        );
        
        if (matchingWork) {
          pastureWorkId = matchingWork.id;
        }
      }
      
      // Crear el registro de trabajo
      await apiRequest("POST", "/api/machine-works", {
        ...values,
        machineId,
        pastureWorkId
      });
      
      toast({
        title: "Trabajo registrado",
        description: "El trabajo ha sido registrado exitosamente",
      });
      
      // Resetear el formulario
      form.reset({
        description: "",
        workType: "",
        startDate: new Date(),
        endDate: null,
        workArea: "",
        workTime: "",
        fuelUsed: "",
        operationalCost: "",
        suppliesCost: "",
        totalCost: "",
        weatherConditions: "",
        temperature: "",
        soilHumidity: "",
        observations: "",
        seedType: "",
        seedPerHectare: "",
        agrochemicalType: "",
        agrochemicalPerHectare: "",
        fertilizerType: "",
        fertilizerPerHectare: "",
        threadRollsUsed: "",
      });
      
      // Llamar al callback de éxito
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al registrar trabajo:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el trabajo",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  }

  // Obtener campos específicos según el tipo de trabajo
  const selectedWorkType = form.watch("workType");
  
  const renderSpecificFields = () => {
    switch (selectedWorkType) {
      case "siembra":
        return (
          <>
            <FormField
              control={form.control}
              name="seedType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de semilla</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Trigo" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seedPerHectare"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kg por hectárea</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 120" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case "fumigacion":
        return (
          <>
            <FormField
              control={form.control}
              name="agrochemicalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de agroquímico</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Glifosato" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agrochemicalPerHectare"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Litros por hectárea</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 3.5" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case "fertilizacion":
        return (
          <>
            <FormField
              control={form.control}
              name="fertilizerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de fertilizante</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Urea" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fertilizerPerHectare"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kg por hectárea</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 150" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case "enrollado":
        return (
          <FormField
            control={form.control}
            name="threadRollsUsed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rollos de hilo utilizados</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 2" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <FormField
            control={form.control}
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
                    {workTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de inicio</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de finalización</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
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

        {/* Campos específicos según tipo de trabajo */}
        {selectedWorkType && (
          <div className="border-t border-neutral-200 pt-4 mt-4">
            <h3 className="text-sm font-medium mb-3">Información específica</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderSpecificFields()}
            </div>
          </div>
        )}

        {/* Detalles del trabajo */}
        <div className="border-t border-neutral-200 pt-4 mt-4">
          <h3 className="text-sm font-medium mb-3">Detalles del trabajo</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="workArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área trabajada (ha)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 10.5" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempo (horas)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 8.5" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fuelUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Combustible (L)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 120" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <FormField
              control={form.control}
              name="weatherConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condiciones climáticas</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Soleado" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperatura (°C)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 25" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="soilHumidity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Humedad del suelo (%)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 40" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Costos */}
        <div className="border-t border-neutral-200 pt-4 mt-4">
          <h3 className="text-sm font-medium mb-3">Costos</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="operationalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo operativo ($)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 5000" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suppliesCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo de insumos ($)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 3000" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo total ($)</FormLabel>
                  <FormControl>
                    <Input placeholder="Calculado automáticamente" {...field} value={field.value || ""} readOnly />
                  </FormControl>
                  <FormDescription>
                    Calculado automáticamente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Observaciones */}
        <div className="border-t border-neutral-200 pt-4 mt-4">
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales sobre el trabajo realizado"
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar trabajo"}
        </Button>
      </form>
    </Form>
  );
}