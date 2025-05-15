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
import { ImageUpload } from "@/components/ui/image-upload";
import { uploadFile } from "@/lib/fileUpload";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  photo: z.string().optional(),
});

type AnimalFormValues = z.infer<typeof animalFormSchema>;

export default function AnimalsIndex() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [transferSheetOpen, setTransferSheetOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const [transferLocation, setTransferLocation] = useState("");
  const [newWeight, setNewWeight] = useState<string>("");
  const [registerWeight, setRegisterWeight] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const { toast } = useToast();
  
  interface Animal {
    id: number;
    cartagena: string;
    cartagenaColor: string;
    category: string;
    race: string;
    birthDate: string;
    reproductiveStatus?: string;
    reproductiveDetail?: string;
    origin?: string;
    weight?: number;
    currentWeight?: number;
    purchaseDate?: string;
    purchasePrice?: number;
    location?: string;
    lastServiceDate?: string;
    lastServiceType?: string;
    expectedDeliveryDate?: string;
    motherCartagena?: string;
    fatherCartagena?: string;
    marks?: string;
    description?: string;
    color?: string;
    status: string;
    photo?: string;
  }

  const { data: animals, isLoading, error } = useQuery<Animal[]>({
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
      photo: "",
    },
  });

  async function onSubmit(values: AnimalFormValues) {
    try {
      // Upload photo if available
      if (photoFile) {
        try {
          const photoPath = await uploadFile(photoFile, "animals");
          values.photo = photoPath;
        } catch (uploadError) {
          console.error("Error uploading photo:", uploadError);
          toast({
            title: "Error en la carga de imagen",
            description: "No se pudo cargar la foto, pero se continuará con la creación del animal",
            variant: "destructive",
          });
        }
      }
      
      await apiRequest("POST", "/api/animals", values);
      
      // Invalidate animals query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      
      toast({
        title: "Animal creado",
        description: "El animal ha sido creado exitosamente",
      });
      
      setSheetOpen(false);
      setPhotoFile(null);
      setPhotoPreview("");
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
  
  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    
    // Generar vista previa si hay un archivo
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview("");
    }
  };

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
  
  const openTransferSheet = (animal: any) => {
    setSelectedAnimal(animal);
    setTransferLocation(animal.location || "");
    setNewWeight("");
    setRegisterWeight(false);
    setTransferSheetOpen(true);
  };
  
  const handleTransfer = async () => {
    if (!selectedAnimal) return;
    
    try {
      // Actualizar ubicación del animal
      const updateData: any = {
        location: transferLocation
      };
      
      // Si se registró un peso, actualizarlo también
      if (registerWeight && newWeight) {
        updateData.currentWeight = newWeight;
        updateData.lastWeightDate = new Date();
      }
      
      await apiRequest("PUT", `/api/animals/${selectedAnimal.id}`, updateData);
      
      // Invalidate animals query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      
      // Add a veterinary event for the transfer (y posiblemente el pesaje)
      let description = `Traslado a: ${transferLocation}`;
      if (registerWeight && newWeight) {
        description += ` - Peso registrado: ${newWeight} kg`;
      }
      
      await apiRequest("POST", "/api/animal-veterinary", {
        animalId: selectedAnimal.id,
        date: new Date(),
        type: registerWeight ? "transfer_weight" : "transfer",
        description: description
      });
      
      // Si se registró peso, agregar un evento de peso específico
      if (registerWeight && newWeight) {
        await apiRequest("POST", "/api/animal-veterinary", {
          animalId: selectedAnimal.id,
          date: new Date(),
          type: "weight",
          description: `Peso registrado: ${newWeight} kg`
        });
      }
      
      // Mensaje toast con la información relevante
      let successMessage = `El animal ha sido trasladado a ${transferLocation}`;
      if (registerWeight && newWeight) {
        successMessage += ` y se registró un peso de ${newWeight} kg`;
      }
      
      toast({
        title: "Operación exitosa",
        description: successMessage,
      });
      
      setTransferSheetOpen(false);
    } catch (error) {
      console.error("Error en operación:", error);
      toast({
        title: "Error",
        description: "No se pudo completar la operación",
        variant: "destructive",
      });
    }
  };
  
  // Función para manejar la selección de un animal
  const handleSelectAnimal = (id: number) => {
    setSelectedAnimals(prev => {
      if (prev.includes(id)) {
        // Si ya está seleccionado, lo quitamos
        return prev.filter(animalId => animalId !== id);
      } else {
        // Si no está seleccionado, lo agregamos
        return [...prev, id];
      }
    });
  };
  
  // Función para eliminar los animales seleccionados
  const handleDeleteSelected = async () => {
    if (selectedAnimals.length === 0) return;
    
    try {
      for (const id of selectedAnimals) {
        await apiRequest("DELETE", `/api/animals/${id}`);
      }
      
      toast({
        title: "Animales eliminados",
        description: `Se eliminaron ${selectedAnimals.length} animales exitosamente`,
      });
      
      // Limpiar selección y actualizar lista
      setSelectedAnimals([]);
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      
    } catch (error) {
      console.error("Error deleting animals:", error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar algunos animales",
        variant: "destructive",
      });
    }
  };

  // Filter animals
  const filteredAnimals = animals ? animals.filter((animal) => {
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
          <h1 className="text-2xl font-header font-bold text-neutral-500">Gestión de Animales</h1>
          <p className="text-neutral-400 text-sm">Gestiona el rodeo de tu establecimiento</p>
        </div>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          {/* Botón para eliminar seleccionados - solo se muestra si hay elementos seleccionados */}
          {selectedAnimals.length > 0 && (
            <Button 
              variant="destructive"
              onClick={handleDeleteSelected}
            >
              <i className="ri-delete-bin-line mr-1"></i> 
              Eliminar ({selectedAnimals.length})
            </Button>
          )}
          
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <i className="ri-add-line mr-1"></i> Nuevo Animal
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto h-full max-h-screen pb-24">
              <SheetHeader>
                <SheetTitle>Nuevo Animal</SheetTitle>
                <SheetDescription>
                  Complete la información del animal. Todos los campos marcados con * son obligatorios.
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
                                <SelectValue placeholder="Seleccionar" />
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
                                <SelectValue placeholder="Seleccionar" />
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
                  
                  <div className="flex flex-col">
                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto</FormLabel>
                          <FormControl>
                            <ImageUpload 
                              onChange={handlePhotoChange} 
                              value={photoPreview}
                            />
                          </FormControl>
                          {/* La vista previa ya está incluida en el componente ImageUpload */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <SheetFooter>
                    <Button type="submit">Guardar animal</Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
          <Input
            placeholder="Buscar por caravana, raza..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="vaca">Vacas</SelectItem>
            <SelectItem value="vaquillona">Vaquillonas</SelectItem>
            <SelectItem value="toro">Toros</SelectItem>
            <SelectItem value="novillo">Novillos</SelectItem>
            <SelectItem value="ternero">Terneros</SelectItem>
            <SelectItem value="ternera">Terneras</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Animal list */}
      {filteredAnimals.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-neutral-400">No se encontraron animales</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  {/* Header checkbox placeholder - podría implementarse seleccionar todos */}
                </TableHead>
                <TableHead>Caravana</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Raza</TableHead>
                <TableHead className="hidden md:table-cell">Estado</TableHead>
                <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnimals.map((animal) => (
                <TableRow 
                  key={animal.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    window.location.href = `/animals/${animal.id}`;
                  }}
                >
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      title={selectedAnimals.includes(animal.id) ? "Deseleccionar" : "Seleccionar"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAnimal(animal.id);
                      }}
                    >
                      <i className={`${selectedAnimals.includes(animal.id) ? "ri-checkbox-fill text-primary" : "ri-checkbox-blank-line text-gray-400"}`}></i>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <i className={`${getCategoryIcon(animal.category)} mr-2`}></i>
                      <div className="font-medium">{animal.cartagena}</div>
                      <Badge 
                        className="ml-2"
                        style={{ 
                          backgroundColor: animal.cartagenaColor === "blanco" ? "#ffffff" : 
                            animal.cartagenaColor === "amarillo" ? "#FFD700" :
                            animal.cartagenaColor === "rojo" ? "#FF0000" :
                            animal.cartagenaColor === "verde" ? "#008000" :
                            animal.cartagenaColor === "azul" ? "#0000FF" :
                            animal.cartagenaColor === "violeta" ? "#8A2BE2" :
                            animal.cartagenaColor === "naranja" ? "#FFA500" :
                            animal.cartagenaColor === "rosa" ? "#FFC0CB" :
                            animal.cartagenaColor === "negro" ? "#000000" : "#ffffff",
                          color: ["blanco", "amarillo", "rosa", "naranja"].includes(animal.cartagenaColor || "") ? "#333" : "#fff"
                        }}
                      >
                        &nbsp;
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryLabel(animal.category)}</TableCell>
                  <TableCell>{getRaceLabel(animal.race)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {animal.reproductiveStatus ? getReproductiveStatusLabel(animal.reproductiveStatus) : "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {animal.location ? animal.location.replace(/_/g, ' ') : "-"}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      {/* Veterinaria (1º) */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        asChild 
                        className="h-8 w-8" 
                        title="Evento veterinario"
                      >
                        <Link href={`/animals/${animal.id}/veterinary`}>
                          <i className="ri-stethoscope-line text-green-600"></i>
                        </Link>
                      </Button>
                      
                      {/* Ventas (2º) */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        asChild 
                        className="h-8 w-8" 
                        title="Registrar venta"
                      >
                        <Link href={`/finances?openForm=true&type=income&category=animales&description=Venta - Animal #${animal.cartagena}`}>
                          <i className="ri-shopping-cart-line"></i>
                        </Link>
                      </Button>
                      
                      {/* Movimientos (3º) */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        title="Trasladar animal"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTransferSheet(animal);
                        }}
                      >
                        <i className="ri-arrow-left-right-line text-blue-500"></i>
                      </Button>
                      
                      {/* Editar (4º) */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        asChild 
                        className="h-8 w-8" 
                        title="Editar"
                      >
                        <Link href={`/animals/${animal.id}/edit`}>
                          <i className="ri-edit-line text-amber-500"></i>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Transfer Sheet */}
      <Sheet open={transferSheetOpen} onOpenChange={setTransferSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Trasladar y/o pesar animal</SheetTitle>
            <SheetDescription>
              Defina la nueva ubicación del animal y/o registre su peso actual
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Animal</h3>
              <p>Caravana <strong>{selectedAnimal?.cartagena}</strong></p>
              <p>Ubicación actual: <strong>{selectedAnimal?.location || "No especificada"}</strong></p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Nueva ubicación</h3>
              <Select value={transferLocation} onValueChange={setTransferLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campo_general">Campo general</SelectItem>
                  <SelectItem value="potrero_norte">Potrero norte</SelectItem>
                  <SelectItem value="potrero_sur">Potrero sur</SelectItem>
                  <SelectItem value="campo_engorde">Campo de engorde</SelectItem>
                  <SelectItem value="corral_destete">Corral de destete</SelectItem>
                </SelectContent>
              </Select>
              
              {transferLocation && selectedAnimal?.location === transferLocation && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                  <i className="ri-information-line mr-1"></i>
                  El animal ya se encuentra en esta ubicación
                </div>
              )}
              
              {transferLocation && selectedAnimal?.category === "ternero" && transferLocation === "corral_destete" && (
                <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">
                  <i className="ri-alert-line mr-1"></i>
                  Considere registrar un evento de destete al mover un ternero al corral de destete
                </div>
              )}
            </div>
            
            {/* Sección de pesaje */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="registerWeight" 
                  checked={registerWeight}
                  onCheckedChange={(checked) => setRegisterWeight(checked === true)}
                />
                <label
                  htmlFor="registerWeight"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Registrar peso actual
                </label>
              </div>
              
              {registerWeight && (
                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Peso en kg"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="w-36"
                    />
                    <span className="text-sm text-neutral-500">kg</span>
                  </div>
                  {selectedAnimal?.currentWeight && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Último peso registrado: {selectedAnimal.currentWeight} kg
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-sm text-neutral-500">
              Este cambio quedará registrado en el historial del animal
            </div>
          </div>
          
          <SheetFooter>
            <Button 
              onClick={handleTransfer} 
              disabled={(transferLocation === selectedAnimal?.location && !registerWeight) || (!transferLocation)}
            >
              {registerWeight && transferLocation === selectedAnimal?.location 
                ? "Registrar peso" 
                : registerWeight 
                  ? "Trasladar y registrar peso" 
                  : "Trasladar animal"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}