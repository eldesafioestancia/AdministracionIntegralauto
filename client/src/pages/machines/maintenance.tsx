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

// Maintenance form schema
const maintenanceFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  type: z.enum(["oil_change", "filter_change", "general_check"], {
    required_error: "El tipo de mantenimiento es requerido",
  }),
  description: z.string().min(5, { message: "La descripción debe tener al menos 5 caracteres" }),
  responsible: z.string().min(3, { message: "El responsable es requerido" }),
  notes: z.string().optional(),
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

export default function MachineMaintenance() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const numericId = parseInt(id);

  // Get machine details
  const { data: machine, isLoading: machineLoading, error: machineError } = useQuery({
    queryKey: [`/api/machines/${id}`],
  });

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      date: new Date(),
      type: "oil_change",
      description: "",
      responsible: "",
      notes: "",
      motorOil: false,
      motorOilQuantity: "",
      hydraulicOil: false,
      hydraulicOilQuantity: "",
      coolant: false,
      coolantQuantity: "",
      oilFilter: false,
      hydraulicFilter: false,
      fuelFilter: false,
      airFilter: false,
    },
  });

  const motorOilChecked = form.watch("motorOil");
  const hydraulicOilChecked = form.watch("hydraulicOil");
  const coolantChecked = form.watch("coolant");

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
                          <SelectItem value="oil_change">Cambio de aceite</SelectItem>
                          <SelectItem value="filter_change">Cambio de filtros</SelectItem>
                          <SelectItem value="general_check">Revisión general</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Descripción breve del mantenimiento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del responsable" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

                  <div className="space-y-4">
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
