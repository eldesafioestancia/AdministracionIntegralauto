import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import * as z from "zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Esquema de validación
const weightFormSchema = z.object({
  date: z.string().nonempty("La fecha es requerida"),
  weight: z
    .string()
    .nonempty("El peso es requerido")
    .refine(
      (value) => {
        const numberValue = parseFloat(value);
        return !isNaN(numberValue) && numberValue > 0;
      },
      { message: "Debe ser un número positivo" }
    ),
  notes: z.string().optional(),
});

type WeightFormValues = z.infer<typeof weightFormSchema>;

export default function AnimalWeight() {
  const { id } = useParams<{ id: string }>();
  const animalId = Number(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener datos del animal
  const { data: animal, isLoading: animalLoading } = useQuery({
    queryKey: [`/api/animals/${id}`],
  });

  // Configurar el formulario
  const defaultValues: WeightFormValues = {
    date: format(new Date(), "yyyy-MM-dd"),
    weight: "",
    notes: "",
  };

  const form = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues,
  });

  async function onSubmit(values: WeightFormValues) {
    setIsSubmitting(true);
    try {
      // Preparar el objeto a enviar
      const weightData = {
        animalId: animalId,
        date: values.date,
        weight: values.weight,
        notes: values.notes || null,
      };

      // Enviar los datos al servidor
      await apiRequest("POST", "/api/animal-weights", weightData);

      // Crear registro financiero automático (opcional)
      if (animal) {
        // Actualizar el estado de peso del animal
        await apiRequest("PUT", `/api/animals/${id}`, {
          currentWeight: values.weight,
          lastWeightDate: new Date(),
        });
      }

      // Actualizar caché de consultas para reflejar cambios
      queryClient.invalidateQueries({ queryKey: [`/api/animal-weights?animalId=${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${id}`] });

      toast({
        title: "Peso registrado",
        description: "El registro de peso ha sido guardado exitosamente",
      });

      // Volver a la página de detalle del animal
      navigate(`/animals/${id}`);
    } catch (error) {
      console.error("Error al registrar peso:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el registro de peso",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (animalLoading) {
    return <div className="py-10 text-center">Cargando información del animal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Registrar peso</h1>
          <p className="text-muted-foreground">
            Animal: {animal?.cartagena} ({animal?.category})
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/animals/${id}`)}>
          <i className="ri-arrow-left-line mr-1"></i> Volver
        </Button>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro de peso</CardTitle>
              <CardDescription>Ingrese los datos del control de peso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha del control</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Ej: 350.5"
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones sobre el control de peso"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/animals/${id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar registro"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}