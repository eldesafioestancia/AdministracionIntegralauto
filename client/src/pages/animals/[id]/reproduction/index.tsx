import { useState } from "react";
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
  devicePlacementDate: z.date({
    required_error: "La fecha de colocación del dispositivo es requerida",
  }),
  deviceRemovalDate: z.date({
    required_error: "La fecha de retiro del dispositivo es requerida",
  }),
  inseminationDate: z.date({
    required_error: "La fecha de inseminación es requerida",
  }),
  bullId: z.string().min(1, { message: "La identificación del toro (pajuela) es requerida" }),
  pregnancyCheckDate: z.date().optional().nullable(),
  pregnancyResult: z.string().optional(),
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
      devicePlacementDate: new Date(),
      deviceRemovalDate: new Date(),
      inseminationDate: new Date(),
      bullId: "",
      pregnancyCheckDate: null,
      pregnancyResult: "",
      expectedDeliveryDate: null,
      notes: "",
    },
  });
  
  // Función para calcular la fecha probable de parto (283 días después de la inseminación)
  const calculateExpectedDeliveryDate = (serviceDate: Date | null) => {
    if (!serviceDate) return null;
    return addDays(serviceDate, 283); // Aproximadamente 283 días de gestación
  };
  
  // Cuando cambia el resultado del tacto, actualizar la fecha probable de parto si es preñada
  const handlePregnancyResultChange = (value: string, form: any, serviceDate: Date | null) => {
    form.setValue("pregnancyResult", value);
    
    if (value === "prenada" && serviceDate) {
      const expectedDate = calculateExpectedDeliveryDate(serviceDate);
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
                                }}
                              />
                            </FormControl>
                            <FormMessage />
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
                    </div>
                    
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
                              Dejar en blanco si el tacto aún no se ha realizado
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
                              onValueChange={(value) => 
                                handlePregnancyResultChange(
                                  value, 
                                  artificialInseminationForm, 
                                  artificialInseminationForm.getValues("inseminationDate")
                                )
                              } 
                              defaultValue={field.value}
                              disabled={!artificialInseminationForm.getValues("pregnancyCheckDate")}
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
                    
                    {artificialInseminationForm.watch("pregnancyResult") === "prenada" && (
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