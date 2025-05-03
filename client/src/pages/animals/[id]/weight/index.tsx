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
import { Badge } from "@/components/ui/badge";

const weightFormSchema = z.object({
  weight: z.string().min(1, { message: "El peso es requerido" }),
  date: z.date({
    required_error: "La fecha de pesaje es requerida",
  }),
  notes: z.string().optional(),
});

type WeightFormValues = z.infer<typeof weightFormSchema>;

export default function AnimalWeight() {
  const params = useParams();
  const animalId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: animal, isLoading: isLoadingAnimal } = useQuery({
    queryKey: [`/api/animals/${animalId}`],
    enabled: !!animalId,
  });
  
  const form = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      weight: "",
      date: new Date(),
      notes: "",
    },
  });
  
  async function onSubmit(values: WeightFormValues) {
    try {
      // Actualizar el peso actual del animal
      await apiRequest("PUT", `/api/animals/${animalId}`, {
        currentWeight: values.weight,
        lastWeightDate: values.date,
      });
      
      // También podríamos registrar el evento de peso en un historial si fuera necesario
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${animalId}`] });
      
      toast({
        title: "Peso registrado",
        description: "El peso del animal ha sido actualizado exitosamente",
      });
      
      // Navegar a la página de detalle
      navigate(`/animals/${animalId}`);
      
    } catch (error) {
      console.error("Error registering weight:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el peso del animal",
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
          <h1 className="text-2xl font-header font-bold text-neutral-500">Registrar Peso</h1>
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
      
      {/* Weight Form */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de peso</CardTitle>
          <CardDescription>
            Ingrese el peso actual del animal
            {animal.currentWeight && (
              <span className="block mt-1">
                Peso anterior: <strong>{animal.currentWeight} kg</strong>
                {animal.lastWeightDate && (
                  <span> ({format(new Date(animal.lastWeightDate), "dd/MM/yyyy")})</span>
                )}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input placeholder="450" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notas o comentarios sobre la condición del animal" 
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