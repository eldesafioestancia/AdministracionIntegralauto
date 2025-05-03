import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";

// Animal form schema
const animalFormSchema = z.object({
  // Información básica
  cartagena: z.string().min(1, { message: "El número de caravana es requerido" }),
  cartagenaColor: z.string().min(1, { message: "El color de caravana es requerido" }),
  category: z.string().min(1, { message: "La categoría es requerida" }),
  race: z.string().min(1, { message: "La raza es requerida" }),
  birthDate: z.date({
    required_error: "La fecha de nacimiento es requerida",
  }),
  
  // Estado reproductivo
  reproductiveStatus: z.string().optional(),
  reproductiveDetail: z.string().optional(),
  
  // Origen
  origin: z.string().optional(),
  supplier: z.string().optional(),
  purchaseDate: z.date().optional().nullable(),
  
  // Datos productivos
  currentWeight: z.string().optional(),
  lastWeightDate: z.date().optional().nullable(),
  bodyCondition: z.string().optional(),
  
  // Reproduccíon
  lastServiceDate: z.date().optional().nullable(),
  lastServiceType: z.string().optional(),
  expectedDeliveryDate: z.date().optional().nullable(),
  
  // Genealogía
  motherCartagena: z.string().optional(),
  fatherCartagena: z.string().optional(),
  
  // Otros
  marks: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  status: z.string().default("active"),
});

type AnimalFormValues = z.infer<typeof animalFormSchema>;

export default function AnimalsIndex() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: animals, isLoading, error } = useQuery({
    queryKey: ["/api/animals"],
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
      status: "active",
    },
  });

  async function onSubmit(values: AnimalFormValues) {
    try {
      await apiRequest("POST", "/api/animals", values);
      
      // Invalidate animals query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      
      toast({
        title: "Animal creado",
        description: "El animal ha sido creado exitosamente",
      });
      
      setSheetOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating animal:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el animal",
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

  const getRaceLabel = (race: string) => {
    switch (race) {
      case "aberdeen": return "Aberdeen";
      case "angus": return "Angus";
      case "averdin_colorado": return "Averdin Colorado";
      case "averdin_negro": return "Averdin Negro";
      case "criollo": return "Criollo";
      case "limousin": return "Limousin";
      case "braford": return "Braford";
      case "hereford": return "Hereford";
      case "brangus": return "Brangus";
      case "brahman": return "Brahman";
      default: return race;
    }
  };

  const getReproductiveStatusLabel = (status: string) => {
    switch (status) {
      case "prenada": return "Preñada";
      case "vacia": return "Vacía";
      case "servicio": return "A punto de entrar en servicio";
      case "parida": return "Parida";
      case "en_servicio": return "En servicio";
      case "no_en_servicio": return "No en servicio";
      case "no_aplica": return "No aplica";
      default: return status;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vaca": return "ri-cow-line";
      case "vaquillona": return "ri-cow-line";
      case "toro": return "ri-rhinoceros-line";
      case "novillo": return "ri-bear-smile-line";
      case "ternero":
      case "ternera":
        return "ri-gamepad-line";
      default: return "ri-cow-line";
    }
  };

  // Filter animals
  const filteredAnimals = animals ? animals.filter((animal: any) => {
    const matchesSearch = 
      animal.cartagena?.toLowerCase().includes(search.toLowerCase()) ||
      animal.race?.toLowerCase().includes(search.toLowerCase()) ||
      animal.category?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === "all" || 
      animal.category === filter;
    
    return matchesSearch && matchesFilter;
  }) : [];

  if (isLoading) {
    return <div className="py-10 text-center">Cargando animales...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Error al cargar los animales</div>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/animals"] })}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Animales</h1>
          <p className="text-neutral-400 text-sm">Gestiona el rodeo de tu establecimiento</p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nuevo animal
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Agregar nuevo animal</SheetTitle>
              <SheetDescription>
                Complete los datos del nuevo animal
              </SheetDescription>
            </SheetHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                
                <div className="grid grid-cols-2 gap-4">
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
                  
                  <FormField
                    control={form.control}
                    name="reproductiveStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado reproductivo</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset related fields when changing reproductive status
                            if (value !== "prenada") {
                              form.setValue("expectedDeliveryDate", null);
                            }
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Opciones para vaca/vaquillona */}
                            {(form.watch("category") === "vaca" || form.watch("category") === "vaquillona") && (
                              <>
                                <SelectItem value="vacia">Vacía</SelectItem>
                                <SelectItem value="servicio">A punto de entrar en servicio</SelectItem>
                                <SelectItem value="prenada">Preñada</SelectItem>
                                <SelectItem value="parida">Parida</SelectItem>
                              </>
                            )}
                            
                            {/* Opciones para toro */}
                            {form.watch("category") === "toro" && (
                              <>
                                <SelectItem value="en_servicio">En servicio</SelectItem>
                                <SelectItem value="no_en_servicio">No en servicio</SelectItem>
                              </>
                            )}
                            
                            {/* Opciones para otras categorías */}
                            {!["vaca", "vaquillona", "toro"].includes(form.watch("category")) && (
                              <SelectItem value="no_aplica">No aplica</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="origin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origen</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el origen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="nacido_establecimiento">Nacido en el establecimiento</SelectItem>
                          <SelectItem value="comprado">Comprado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("origin") === "comprado" && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proveedor</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del proveedor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de compra</FormLabel>
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
                )}
                
                <h3 className="font-semibold text-base text-neutral-500 mt-4">Filiación</h3>

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
                        <Input placeholder="Corte de oreja, mancha blanca, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <h3 className="font-semibold text-base text-neutral-500 mt-4">Datos Productivos y Corporales</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso actual (kg)</FormLabel>
                        <FormControl>
                          <Input placeholder="450" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastWeightDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Último control de peso</FormLabel>
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
                  name="bodyCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condición corporal (1 a 5)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
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
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lastServiceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha último servicio</FormLabel>
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
                    name="lastServiceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de servicio</FormLabel>
                        <FormControl>
                          <Input placeholder="Inseminación artificial, monta natural, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Campo de fecha probable de parto solo cuando está preñada */}
                {form.watch("reproductiveStatus") === "prenada" && (
                  <FormField
                    control={form.control}
                    name="expectedDeliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha probable de parto</FormLabel>
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
                )}
                
                <SheetFooter className="pt-4">
                  <Button type="submit">Guardar animal</Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></i>
            <Input
              placeholder="Buscar por caravana, raza..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={filter}
            onValueChange={setFilter}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="vaca">Vacas</SelectItem>
              <SelectItem value="vaquillona">Vaquillonas</SelectItem>
              <SelectItem value="toro">Toros</SelectItem>
              <SelectItem value="novillo">Novillos</SelectItem>
              <SelectItem value="ternero">Terneros</SelectItem>
              <SelectItem value="ternera">Terneras</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-neutral-500">
          {filteredAnimals.length} {filteredAnimals.length === 1 ? "animal" : "animales"}
        </div>
      </div>

      {/* Animal List */}
      {filteredAnimals.length === 0 ? (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 mb-4">
            <i className="ri-cattle-line text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-2">
            No se encontraron animales
          </h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-6">
            {search || filter !== "all" 
              ? "Intente con otros filtros de búsqueda" 
              : "Registre un nuevo animal para comenzar"}
          </p>
          {search || filter !== "all" ? (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Limpiar filtros
            </Button>
          ) : (
            <Button
              onClick={() => setSheetOpen(true)}
            >
              <i className="ri-add-line mr-1"></i> Nuevo animal
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnimals.map((animal: any) => (
            <Card key={animal.id} className="p-0 overflow-hidden">
              <div className="flex items-center">
                <div 
                  className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative"
                  style={{
                    backgroundColor: 
                      animal.cartagenaColor === "blanco" ? "#ffffff" : 
                      animal.cartagenaColor === "amarillo" ? "#FFD700" :
                      animal.cartagenaColor === "rojo" ? "#FF0000" :
                      animal.cartagenaColor === "verde" ? "#008000" :
                      animal.cartagenaColor === "azul" ? "#0000FF" :
                      animal.cartagenaColor === "negro" ? "#000000" : "#f5f5f5",
                    color: ["blanco", "amarillo"].includes(animal.cartagenaColor || "") ? "#333" : "#fff"
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{animal.cartagena}</span>
                  </div>
                </div>
                
                <Link href={`/animals/${animal.id}`} className="flex-1 px-4 py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <h3 className="font-medium text-neutral-800">#{animal.cartagena}</h3>
                      <Badge className="ml-2 px-2 py-0 h-5">{getCategoryLabel(animal.category)}</Badge>
                    </div>
                    <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-3">
                      {/* Peso */}
                      {animal.currentWeight && (
                        <span className="flex items-center">
                          <i className="ri-scales-line mr-1"></i> {animal.currentWeight} kg
                        </span>
                      )}
                      
                      {/* Ubicación */}
                      {animal.location && (
                        <span className="flex items-center">
                          <i className="ri-map-pin-line mr-1"></i> {animal.location}
                        </span>
                      )}
                      
                      {/* Estado reproductivo */}
                      {animal.reproductiveStatus && animal.reproductiveStatus !== "no_aplica" && (
                        <span className="flex items-center">
                          {animal.reproductiveStatus === "prenada" ? (
                            <i className="ri-heart-fill mr-1 text-red-500"></i>
                          ) : animal.reproductiveStatus === "parida" ? (
                            <i className="ri-parent-line mr-1"></i>
                          ) : animal.reproductiveStatus === "en_servicio" ? (
                            <i className="ri-heart-add-line mr-1 text-green-500"></i>
                          ) : (
                            <i className="ri-heart-line mr-1"></i>
                          )}
                          {getReproductiveStatusLabel(animal.reproductiveStatus)}
                        </span>
                      )}
                      
                      {/* Fecha de parto aproximada */}
                      {animal.reproductiveStatus === "prenada" && animal.expectedDeliveryDate && (
                        <span className="flex items-center text-red-600">
                          <i className="ri-calendar-event-line mr-1"></i>
                          Parto: {format(new Date(animal.expectedDeliveryDate), "dd/MM/yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                
                <div className="flex items-center space-x-1 pr-3">
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9" title="Editar">
                    <Link href={`/animals/${animal.id}/edit`}>
                      <i className="ri-edit-line text-lg"></i>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9" title="Evento veterinario">
                    <Link href={`/animals/${animal.id}/veterinary`}>
                      <i className="ri-stethoscope-line text-lg"></i>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9" title="Evento reproductivo">
                    <Link href={`/animals/${animal.id}/reproduction`}>
                      <i className="ri-heart-pulse-line text-lg"></i>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9" title="Registrar peso">
                    <Link href={`/animals/${animal.id}/weight`}>
                      <i className="ri-scales-line text-lg"></i>
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}