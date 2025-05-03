import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const veterinaryFormSchema = z.object({
  date: z.date({
    required_error: "La fecha del evento es requerida",
  }),
  type: z.string().min(1, { message: "El tipo de evento es requerido" }),
  description: z.string().min(1, { message: "La descripción es requerida" }),
  treatment: z.string().optional(),
  result: z.string().optional(),
  medication: z.string().optional(),
  dose: z.string().optional(),
  cost: z.string().optional(),
  notes: z.string().optional(),
});

type VeterinaryFormValues = z.infer<typeof veterinaryFormSchema>;

export default function AnimalVeterinary() {
  const params = useParams();
  const animalId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: animal, isLoading: isLoadingAnimal } = useQuery({
    queryKey: [`/api/animals/${animalId}`],
    enabled: !!animalId,
  });
  
  const form = useForm<VeterinaryFormValues>({
    resolver: zodResolver(veterinaryFormSchema),
    defaultValues: {
      date: new Date(),
      type: "",
      description: "",
      treatment: "",
      result: "",
      medication: "",
      dose: "",
      cost: "",
      notes: "",
    },
  });
  
  async function onSubmit(values: VeterinaryFormValues) {
    try {
      // Registrar el evento veterinario
      await apiRequest("POST", `/api/animal-veterinary`, {
        animalId: Number(animalId),
        ...values,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${animalId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/animal-veterinary`] });
      
      toast({
        title: "Evento veterinario registrado",
        description: "Los datos del evento han sido registrados exitosamente",
      });
      
      // Navegar a la página de detalle
      navigate(`/animals/${animalId}`);
      
    } catch (error) {
      console.error("Error registering veterinary event:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el evento veterinario",
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
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Registro Veterinario</h1>
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
      
      {/* Veterinary Event Form */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar evento veterinario</CardTitle>
          <CardDescription>
            Ingrese los detalles del evento veterinario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      <FormLabel>Tipo de evento</FormLabel>
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
                          <SelectItem value="vacunacion">Vacunación</SelectItem>
                          <SelectItem value="desparasitacion">Desparasitación</SelectItem>
                          <SelectItem value="curacion">Curación</SelectItem>
                          <SelectItem value="cirugia">Cirugía</SelectItem>
                          <SelectItem value="revision">Revisión periódica</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa el evento veterinario" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="treatment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tratamiento</FormLabel>
                      <FormControl>
                        <Input placeholder="Tratamiento aplicado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resultado</FormLabel>
                      <FormControl>
                        <Input placeholder="Resultado del tratamiento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="medication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Medicamento administrado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosis</FormLabel>
                      <FormControl>
                        <Input placeholder="Dosis administrada" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo</FormLabel>
                      <FormControl>
                        <Input placeholder="Costo del tratamiento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notas o comentarios adicionales" 
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
        </CardContent>
      </Card>
    </div>
  );
}