import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const animalFormSchema = z.object({
  cartagena: z.string().min(1, { message: "El número de caravana es requerido" }),
  cartagenaColor: z.string().min(1, { message: "El color de caravana es requerido" }),
  category: z.string().min(1, { message: "La categoría es requerida" }),
  race: z.string().min(1, { message: "La raza es requerida" }),
  birthDate: z.date({
    required_error: "La fecha de nacimiento es requerida",
  }),
  reproductiveStatus: z.string().optional(),
  reproductiveDetail: z.string().optional(),
  origin: z.string().optional(),
  supplier: z.string().optional(),
  purchaseDate: z.date().optional().nullable(),
  currentWeight: z.string().optional(),
  lastWeightDate: z.date().optional().nullable(),
  bodyCondition: z.string().optional(),
  lastServiceDate: z.date().optional().nullable(),
  lastServiceType: z.string().optional(),
  expectedDeliveryDate: z.date().optional().nullable(),
  motherCartagena: z.string().optional(),
  fatherCartagena: z.string().optional(),
  marks: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  location: z.string().optional(),
  status: z.string().default("active"),
});

type AnimalFormValues = z.infer<typeof animalFormSchema>;

export default function AnimalEdit() {
  const params = useParams();
  const animalId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: animal, isLoading } = useQuery({
    queryKey: [`/api/animals/${animalId}`],
    enabled: !!animalId,
  });

  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      cartagena: "",
      cartagenaColor: "blanco",
      category: "vaca",
      race: "angus",
      birthDate: new Date(),
      reproductiveStatus: "vacia",
      origin: "nacido_establecimiento",
      supplier: "",
      purchaseDate: null,
      currentWeight: "",
      lastWeightDate: null,
      bodyCondition: "3",
      lastServiceDate: null,
      lastServiceType: "",
      expectedDeliveryDate: null,
      motherCartagena: "",
      fatherCartagena: "",
      marks: "",
      description: "",
      color: "",
      location: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (animal) {
      const formValues = {
        ...animal,
        // Convertir las fechas string a objetos Date
        birthDate: animal.birthDate ? new Date(animal.birthDate) : new Date(),
        purchaseDate: animal.purchaseDate ? new Date(animal.purchaseDate) : null,
        lastWeightDate: animal.lastWeightDate ? new Date(animal.lastWeightDate) : null,
        lastServiceDate: animal.lastServiceDate ? new Date(animal.lastServiceDate) : null,
        expectedDeliveryDate: animal.expectedDeliveryDate ? new Date(animal.expectedDeliveryDate) : null,
      };
      form.reset(formValues);
    }
  }, [animal, form]);

  async function onSubmit(values: AnimalFormValues) {
    try {
      await apiRequest("PUT", `/api/animals/${animalId}`, values);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${animalId}`] });
      
      toast({
        title: "Animal actualizado",
        description: "Los datos del animal han sido actualizados exitosamente",
      });
      
      // Navegar a la página de detalle
      navigate(`/animals/${animalId}`);
      
    } catch (error) {
      console.error("Error updating animal:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el animal",
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

  if (isLoading) {
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
          <h1 className="text-2xl font-header font-bold text-neutral-500">Editar Animal</h1>
          <p className="text-neutral-400 text-sm">Caravana #{animal.cartagena} - {getCategoryLabel(animal.category)}</p>
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
      
      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del animal</CardTitle>
          <CardDescription>Edite los datos del animal</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Identificación */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-base text-neutral-500">Identificación</h3>
                  
                  <FormField
                    control={form.control}
                    name="cartagena"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº de Caravana</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cartagenaColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color de caravana</FormLabel>
                        <div className="grid grid-cols-5 gap-2">
                          {["rojo", "amarillo", "azul", "verde", "violeta", "naranja", "rosa", "blanco", "negro"].map((color) => (
                            <div 
                              key={color}
                              className={`
                                w-full aspect-square rounded-md cursor-pointer border-2 
                                ${field.value === color ? "border-primary ring-2 ring-primary ring-opacity-50" : "border-neutral-200"}
                              `}
                              style={{ 
                                backgroundColor: 
                                  color === "blanco" ? "#ffffff" : 
                                  color === "amarillo" ? "#FFD700" :
                                  color === "rojo" ? "#FF0000" :
                                  color === "verde" ? "#008000" :
                                  color === "azul" ? "#0000FF" :
                                  color === "violeta" ? "#8A2BE2" :
                                  color === "naranja" ? "#FFA500" :
                                  color === "rosa" ? "#FFC0CB" :
                                  color === "negro" ? "#000000" : "#ffffff",
                                color: ["blanco", "amarillo", "rosa", "naranja"].includes(color) ? "#333" : "#fff"
                              }}
                              onClick={() => field.onChange(color)}
                            >
                              <div className="w-full h-full flex items-center justify-center">
                                {field.value === color && <i className="ri-check-line text-lg" />}
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="vaca">Vaca</SelectItem>
                              <SelectItem value="vaquillona">Vaquillona</SelectItem>
                              <SelectItem value="toro">Toro</SelectItem>
                              <SelectItem value="novillo">Novillo</SelectItem>
                              <SelectItem value="ternero">Ternero</SelectItem>
                              <SelectItem value="ternera">Ternera</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="race"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raza</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una raza" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aberdeen">Aberdeen</SelectItem>
                              <SelectItem value="angus">Angus</SelectItem>
                              <SelectItem value="averdin_colorado">Averdin Colorado</SelectItem>
                              <SelectItem value="averdin_negro">Averdin Negro</SelectItem>
                              <SelectItem value="criollo">Criollo</SelectItem>
                              <SelectItem value="limousin">Limousin</SelectItem>
                              <SelectItem value="braford">Braford</SelectItem>
                              <SelectItem value="hereford">Hereford</SelectItem>
                              <SelectItem value="brangus">Brangus</SelectItem>
                              <SelectItem value="brahman">Brahman</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación actual</FormLabel>
                        <FormControl>
                          <Input placeholder="Potrero, corral, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de nacimiento</FormLabel>
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
                
                {/* Datos Productivos */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-base text-neutral-500">Estado reproductivo</h3>
                  
                  <FormField
                    control={form.control}
                    name="reproductiveStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado reproductivo</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Estados para hembras */}
                            {["vaca", "vaquillona", "ternera"].includes(form.watch("category")) && (
                              <>
                                <SelectItem value="vacia">Vacía</SelectItem>
                                <SelectItem value="servicio">A punto de entrar en servicio</SelectItem>
                                <SelectItem value="prenada">Preñada</SelectItem>
                                <SelectItem value="parida">Parida</SelectItem>
                              </>
                            )}
                            
                            {/* Estados para machos */}
                            {form.watch("category") === "toro" && (
                              <>
                                <SelectItem value="en_servicio">En servicio</SelectItem>
                                <SelectItem value="no_en_servicio">No en servicio</SelectItem>
                              </>
                            )}
                            
                            {/* Estado para otros */}
                            {["novillo", "ternero"].includes(form.watch("category")) && (
                              <SelectItem value="no_aplica">No aplica</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bodyCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condición corporal (1 a 5)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value || "3"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione condición" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 - Muy delgado</SelectItem>
                            <SelectItem value="1.5">1.5</SelectItem>
                            <SelectItem value="2">2 - Delgado</SelectItem>
                            <SelectItem value="2.5">2.5</SelectItem>
                            <SelectItem value="3">3 - Normal</SelectItem>
                            <SelectItem value="3.5">3.5</SelectItem>
                            <SelectItem value="4">4 - Gordo</SelectItem>
                            <SelectItem value="4.5">4.5</SelectItem>
                            <SelectItem value="5">5 - Muy gordo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <h3 className="font-semibold text-base text-neutral-500 mt-6">Filiación</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fatherCartagena"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº Caravana Padre</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="motherCartagena"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº Caravana Madre</FormLabel>
                          <FormControl>
                            <Input placeholder="456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="marks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Señales / Marcas particulares</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Corte de oreja, mancha blanca, etc." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/animals/${animalId}`)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar cambios</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}