import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Esquema para Monta Natural
const naturalServiceFormSchema = z.object({
  type: z.literal("natural"),
  bullEntryDate: z.date({
    required_error: "La fecha de ingreso del toro es requerida",
  }),
  bullExitDate: z.date({
    required_error: "La fecha de retiro del toro es requerida",
  }).optional().nullable(),
  bullId: z.string().min(1, { message: "La identificación del toro es requerida" }),
  pregnancyCheckDate: z.date().optional().nullable(),
  pregnancyResult: z.string().optional(),
  expectedDeliveryDate: z.date().optional().nullable(),
  notes: z.string().optional(),
});

// Esquema para Inseminación Artificial
const artificialInseminationFormSchema = z.object({
  type: z.literal("artificial"),
  bullExitDate: z.date({
    required_error: "La fecha de retiro de toros es requerida",
  }),
  pregnancyCheckDate: z.date().optional().nullable(),
  pregnancyResult: z.string().optional(),
  devicePlacementDate: z.date().optional().nullable(),
  deviceRemovalDate: z.date().optional().nullable(),
  inseminationDate: z.date().optional().nullable(),
  bullId: z.string().min(1, { message: "La identificación del toro (pajuela) es requerida" }),
  expectedDeliveryDate: z.date().optional().nullable(),
  notes: z.string().optional(),
});

// Combinamos ambos esquemas
const reproductiveEventSchema = z.discriminatedUnion("type", [
  naturalServiceFormSchema,
  artificialInseminationFormSchema,
]);

type NaturalServiceFormValues = z.infer<typeof naturalServiceFormSchema>;
type ArtificialInseminationFormValues = z.infer<typeof artificialInseminationFormSchema>;

export default function AnimalReproduction() {
  const params = useParams();
  const animalId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("natural");
  
  const { data: animal, isLoading: isLoadingAnimal } = useQuery({
    queryKey: [`/api/animals/${animalId}`],
    enabled: !!animalId,
  });
  
  const { data: bulls, isLoading: isLoadingBulls } = useQuery({
    queryKey: ["/api/animals"],
    select: (data) => data.filter((animal: any) => animal.category === "toro"),
  });
  
  // Formulario para Monta Natural
  const naturalServiceForm = useForm<NaturalServiceFormValues>({
    resolver: zodResolver(naturalServiceFormSchema),
    defaultValues: {
      type: "natural",
      bullEntryDate: new Date(),
      bullExitDate: null,
      bullId: "",
      pregnancyCheckDate: null,
      pregnancyResult: "",
      expectedDeliveryDate: null,
      notes: "",
    },
  });
  
  // Formulario para Inseminación Artificial
  const artificialInseminationForm = useForm<ArtificialInseminationFormValues>({
    resolver: zodResolver(artificialInseminationFormSchema),
    defaultValues: {
      type: "artificial",
      bullExitDate: new Date(),
      pregnancyCheckDate: addDays(new Date(), 45), // 45 días después para el tacto
      pregnancyResult: "",
      devicePlacementDate: null,
      deviceRemovalDate: null,
      inseminationDate: null,
      bullId: "",
      expectedDeliveryDate: null,
      notes: "",
    },
  });
  
  // Al cambiar la fecha de retiro de toros, actualizamos automáticamente la fecha de tacto
  useEffect(() => {
    const subscription = artificialInseminationForm.watch((value, { name }) => {
      if (name === "bullExitDate" && value.bullExitDate) {
        // Actualizar fecha de tacto a 45 días después del retiro de toros
        const checkDate = addDays(new Date(value.bullExitDate), 45);
        artificialInseminationForm.setValue("pregnancyCheckDate", checkDate);
      }
      
      if (name === "pregnancyResult" && value.pregnancyResult === "vacia" && value.pregnancyCheckDate) {
        // Si el resultado del tacto es "vacía", configurar las fechas de inseminación
        // La fecha de colocación del dispositivo es la misma que la fecha del tacto
        const checkDate = new Date(value.pregnancyCheckDate);
        const deviceDate = checkDate; // Misma fecha que el tacto
        const removalDate = addDays(deviceDate, 7); // 7 días después para retiro del dispositivo
        const insemDate = addDays(removalDate, 2); // 2 días después para la inseminación
        
        // Programar automáticamente tacto para 40 días después de la inseminación
        const nextCheckDate = addDays(insemDate, 40);
        
        artificialInseminationForm.setValue("devicePlacementDate", deviceDate);
        artificialInseminationForm.setValue("deviceRemovalDate", removalDate);
        artificialInseminationForm.setValue("inseminationDate", insemDate);
        artificialInseminationForm.setValue("pregnancyCheckDate", nextCheckDate);
        
        // No calculamos la fecha de parto aún, se hará después del tacto
      }
    });
    
    return () => subscription.unsubscribe();
  }, [artificialInseminationForm]);
  
  // Función para calcular la fecha probable de parto según el tipo de servicio y resultado del tacto
  const calculateExpectedDeliveryDate = (serviceDate: Date | null, isPrenada: boolean) => {
    if (!serviceDate) return null;
    
    if (isPrenada) {
      // Si está preñada, el parto es 280 días después de la inseminación
      return addDays(serviceDate, 280);
    } else {
      // Si está vacía, el parto se calcula para 305 días después de la inseminación
      return addDays(serviceDate, 305);
    }
  };
  
  // Cuando cambia el resultado del tacto, actualizar la fecha probable de parto
  const handlePregnancyResultChange = (value: string, form: any, serviceDate: Date | null) => {
    form.setValue("pregnancyResult", value);
    
    if (serviceDate) {
      const isPrenada = value === "prenada";
      const expectedDate = calculateExpectedDeliveryDate(serviceDate, isPrenada);
      form.setValue("expectedDeliveryDate", expectedDate);
    } else {
      form.setValue("expectedDeliveryDate", null);
    }
  };
  
  async function onSubmitNaturalService(values: NaturalServiceFormValues) {
    await submitReproductiveEvent(values);
  }
  
  async function onSubmitArtificialInsemination(values: ArtificialInseminationFormValues) {
    await submitReproductiveEvent(values);
  }
  
  // Función común para enviar el evento reproductivo
  async function submitReproductiveEvent(values: any) {
    try {
      // Registrar el evento reproductivo
      await apiRequest("POST", `/api/animals/${animalId}/reproduction`, values);
      
      // Actualizar el estado reproductivo del animal
      const reproductiveStatus = values.pregnancyResult || "servicio";
      const updates: any = {
        reproductiveStatus,
        lastServiceDate: values.type === "natural" ? values.bullEntryDate : values.inseminationDate,
        lastServiceType: values.type === "natural" ? "monta_natural" : "inseminacion_artificial",
      };
      
      // Si está preñada, también actualizar la fecha probable de parto
      if (reproductiveStatus === "prenada" && values.expectedDeliveryDate) {
        updates.expectedDeliveryDate = values.expectedDeliveryDate;
      }
      
      await apiRequest("PUT", `/api/animals/${animalId}`, updates);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${animalId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${animalId}/reproduction`] });
      
      toast({
        title: "Evento reproductivo registrado",
        description: "Los datos del evento han sido registrados exitosamente",
      });
      
      // Navegar a la página de detalle
      navigate(`/animals/${animalId}`);
      
    } catch (error) {
      console.error("Error registering reproductive event:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el evento reproductivo",
        variant: "destructive",
      });
    }
  }
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "vaca": return "Vaca";
      case "vaquillona": return "Vaquillona";
      case "toro": return "Toro";
      case "novillo": return "Novillo";
      case "ternero": return "Ternero";
      case "ternera": return "Ternera";
      default: return category;
    }
  };
  
  // Verificar si es una categoría que permite eventos reproductivos
  const isReproductiveCategory = (category: string) => {
    return ["vaca", "vaquillona"].includes(category);
  };
  
  if (isLoadingAnimal) {
    return <div className="py-10 text-center">Cargando datos del animal...</div>;
  }
  
  if (!animal) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Animal no encontrado</div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/animals")}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }
  
  // Si no es una categoría que permite eventos reproductivos
  if (!isReproductiveCategory(animal.category)) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">
          Este tipo de animal no permite registrar eventos reproductivos
        </div>
        <p className="text-neutral-500 mb-4">
          Solo se pueden registrar eventos reproductivos para vacas y vaquillonas.
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/animals/${animalId}`)}
        >
          Volver al animal
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Actividad Reproductiva</h1>
          <p className="text-neutral-400 text-sm">
            <span className="mr-2">Caravana #{animal.cartagena}</span>
            <Badge>{getCategoryLabel(animal.category)}</Badge>
          </p>
        </div>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/animals/${animalId}`)}
          >
            Cancelar
          </Button>
        </div>
      </div>
      
      {/* Reproductive Event Form */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar evento reproductivo</CardTitle>
          <CardDescription>
            Seleccione el tipo de evento a registrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="natural">Monta Natural</TabsTrigger>
              <TabsTrigger value="artificial">Inseminación Artificial</TabsTrigger>
            </TabsList>
            
            {/* Formulario para Monta Natural */}
            <TabsContent value="natural">
              <div className="pt-6">
                <Form {...naturalServiceForm}>
                  <form onSubmit={naturalServiceForm.handleSubmit(onSubmitNaturalService)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={naturalServiceForm.control}
                        name="bullEntryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha Ingreso Toro</FormLabel>
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
                        control={naturalServiceForm.control}
                        name="bullExitDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha Retiro Toro</FormLabel>
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
                            <FormDescription>
                              Dejar en blanco si el toro aún está en servicio
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={naturalServiceForm.control}
                      name="bullId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Identificación del Toro</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un toro" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingBulls ? (
                                <SelectItem value="loading">Cargando toros...</SelectItem>
                              ) : bulls && bulls.length > 0 ? (
                                bulls.map((bull: any) => (
                                  <SelectItem key={bull.id} value={bull.id.toString()}>
                                    #{bull.cartagena} - {bull.race}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none">No hay toros registrados</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={naturalServiceForm.control}
                        name="pregnancyCheckDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Tacto</FormLabel>
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
                            <FormDescription>
                              Dejar en blanco si el tacto aún no se ha realizado
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={naturalServiceForm.control}
                        name="pregnancyResult"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resultado del Tacto</FormLabel>
                            <Select 
                              onValueChange={(value) => 
                                handlePregnancyResultChange(
                                  value, 
                                  naturalServiceForm, 
                                  naturalServiceForm.getValues("bullEntryDate")
                                )
                              } 
                              defaultValue={field.value}
                              disabled={!naturalServiceForm.getValues("pregnancyCheckDate")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un resultado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="prenada">Preñada</SelectItem>
                                <SelectItem value="vacia">Vacía</SelectItem>
                                <SelectItem value="duda">En duda</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {naturalServiceForm.watch("pregnancyResult") === "prenada" && (
                      <FormField
                        control={naturalServiceForm.control}
                        name="expectedDeliveryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha Probable de Parto</FormLabel>
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
                            <FormDescription>
                              Calculada automáticamente, pero puede ser modificada
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={naturalServiceForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Notas o comentarios relevantes" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4 flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate(`/animals/${animalId}`)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Guardar</Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
            
            {/* Formulario para Inseminación Artificial */}
            <TabsContent value="artificial">
              <div className="pt-6">
                <Form {...artificialInseminationForm}>
                  <form onSubmit={artificialInseminationForm.handleSubmit(onSubmitArtificialInsemination)} className="space-y-6">
                    {/* Etapa 1: Fecha de retiro de toros */}
                    <div className="p-4 border border-primary/20 rounded-lg mb-4">
                      <h3 className="text-base font-semibold mb-4">Etapa 1: Retiro de Toros</h3>
                      <FormField
                        control={artificialInseminationForm.control}
                        name="bullExitDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha Retiro de Toros</FormLabel>
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
                            <FormDescription>
                              Al cambiar esta fecha, se actualizará automáticamente la fecha de tacto (45 días después)
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Etapa 2: Tacto */}
                    <div className="p-4 border border-primary/20 rounded-lg mb-4">
                      <h3 className="text-base font-semibold mb-4">
                        Etapa 2: Tacto {artificialInseminationForm.watch("inseminationDate") 
                          ? "(40 días después de la inseminación)" 
                          : "(45 días después del retiro de toros)"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={artificialInseminationForm.control}
                          name="pregnancyCheckDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Tacto</FormLabel>
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
                              <FormDescription>
                                {artificialInseminationForm.watch("inseminationDate") 
                                  ? "Calculada automáticamente (40 días después de la inseminación)" 
                                  : "Calculada automáticamente (45 días después del retiro de toros)"}
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={artificialInseminationForm.control}
                          name="pregnancyResult"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resultado del Tacto</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  // Usamos la fecha de inseminación si está disponible, si no usamos la fecha de retiro de toros
                                  const inseminationDate = artificialInseminationForm.getValues("inseminationDate");
                                  const bullExitDate = artificialInseminationForm.getValues("bullExitDate");
                                  const serviceDate = inseminationDate || bullExitDate;
                                  
                                  handlePregnancyResultChange(
                                    value, 
                                    artificialInseminationForm, 
                                    serviceDate
                                  )
                                }} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un resultado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="prenada">Preñada</SelectItem>
                                  <SelectItem value="vacia">Vacía</SelectItem>
                                  <SelectItem value="duda">Dudosa</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                              <FormDescription>
                                Si está vacía, se habilitarán las opciones de inseminación
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Etapa 3: Inseminación (Solo si el tacto dio vacía) */}
                    {artificialInseminationForm.watch("pregnancyResult") === "vacia" && (
                      <div className="p-4 border border-primary/20 rounded-lg mb-4">
                        <h3 className="text-base font-semibold mb-4">Etapa 3: Inseminación Artificial</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <FormField
                            control={artificialInseminationForm.control}
                            name="devicePlacementDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fecha Colocación Dispositivo</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date"
                                    {...field}
                                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                    onChange={(e) => {
                                      const date = e.target.value ? new Date(e.target.value) : null;
                                      field.onChange(date);
                                      
                                      // Actualizar fechas dependientes
                                      if (date) {
                                        const removalDate = addDays(date, 7);
                                        const insemDate = addDays(removalDate, 2);
                                        artificialInseminationForm.setValue("deviceRemovalDate", removalDate);
                                        artificialInseminationForm.setValue("inseminationDate", insemDate);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>
                                  La colocación del dispositivo se realiza el mismo día del tacto
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={artificialInseminationForm.control}
                            name="deviceRemovalDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fecha Retiro Dispositivo</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date"
                                    {...field}
                                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                    readOnly
                                  />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>
                                  Calculada automáticamente (7 días después de colocación)
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={artificialInseminationForm.control}
                            name="inseminationDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fecha Inseminación</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date"
                                    {...field}
                                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                    readOnly
                                  />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>
                                  Calculada automáticamente (2 días después del retiro)
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="mt-4">
                          <FormField
                            control={artificialInseminationForm.control}
                            name="bullId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Identificación del Toro (Pajuela)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Código o nombre del toro donante" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="mt-4">
                          <FormField
                            control={artificialInseminationForm.control}
                            name="expectedDeliveryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fecha Probable de Parto</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date"
                                    {...field}
                                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                    readOnly
                                  />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>
                                  Calculada automáticamente (280 días después de la inseminación)
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Si el tacto dio preñada, mostrar fecha probable de parto */}
                    {artificialInseminationForm.watch("pregnancyResult") === "prenada" && (
                      <div className="p-4 border border-primary/20 rounded-lg mb-4">
                        <h3 className="text-base font-semibold mb-4">Resultado: Preñada</h3>
                        <FormField
                          control={artificialInseminationForm.control}
                          name="expectedDeliveryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha Probable de Parto</FormLabel>
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
                              <FormDescription>
                                Calculada automáticamente, pero puede ser modificada
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    <FormField
                      control={artificialInseminationForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Notas o comentarios relevantes" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4 flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate(`/animals/${animalId}`)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Guardar</Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}