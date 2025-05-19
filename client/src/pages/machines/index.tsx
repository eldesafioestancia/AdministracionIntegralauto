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
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";

// Machine form schema
const machineFormSchema = z.object({
  // Datos de identificación
  type: z.enum(["tractor", "topadora", "camion", "vehiculo", "accesorio"], { 
    required_error: "El tipo de unidad es requerido",
  }),
  brand: z.string().min(1, { message: "La marca es requerida" }),
  model: z.string().min(1, { message: "El modelo es requerido" }),
  serialNumber: z.string().optional(),
  year: z.number().int().min(1900, { message: "Año inválido" }).max(new Date().getFullYear(), { message: "Año inválido" }),
  hours: z.string().min(1, { message: "Las horas/kilómetros son requeridos" }),
  power: z.string().optional(),
  fuelType: z.string().optional(),
  licensePlate: z.string().optional(),
  
  // Datos de adquisición
  purchaseDate: z.date().optional(),
  purchasePrice: z.coerce.number().optional(),
  legalOwner: z.string().optional(),
  
  // Datos de ubicación y estado
  location: z.string().optional(),
  status: z.enum(["activo", "en_reparacion", "fuera_de_servicio"], {
    required_error: "El estado es requerido",
  }),
  statusDetail: z.string().optional(),
  
  // Otros datos
  description: z.string().optional(),
});

type MachineFormValues = z.infer<typeof machineFormSchema>;

export default function MachinesIndex() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedMachines, setSelectedMachines] = useState<number[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Consulta para obtener la lista de maquinarias
  const { data: machines, isLoading, error } = useQuery({ 
    queryKey: ["/api/machines"], 
    retry: 1, 
  });
  
  // Configuración del formulario
  const form = useForm<MachineFormValues>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      type: "tractor",
      brand: "",
      model: "",
      serialNumber: "",
      year: new Date().getFullYear(),
      hours: "",
      power: "",
      fuelType: "",
      licensePlate: "",
      purchaseDate: undefined,
      purchasePrice: undefined,
      legalOwner: "",
      location: "",
      status: "activo",
      statusDetail: "",
      description: "",
    },
  });
  
  // Función para enviar el formulario
  async function onSubmit(values: MachineFormValues) {
    try {
      setIsSubmitting(true);
      
      // Si hay una imagen, primero la subimos
      let photoUrl = null;
      if (file) {
        try {
          photoUrl = await uploadFile(file, "machines");
        } catch (error) {
          console.error("Error al subir imagen:", error);
        }
      }
      
      // Enviamos todos los datos al backend
      const response = await apiRequest("/api/machines", "POST", {
        ...values,
        photo: photoUrl,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      
      toast({
        description: "Máquina creada correctamente",
      });
      
      // Limpiamos formulario y cerramos
      form.reset();
      setFile(null);
      setPreviewUrl("");
      setSheetOpen(false);
    } catch (error) {
      console.error("Error al crear la máquina:", error);
      toast({
        variant: "destructive",
        description: "Error al crear la máquina",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Manejo de la imagen
  const handleFileChange = (uploadedFile: File | null) => {
    setFile(uploadedFile);
    
    if (uploadedFile) {
      // Mostramos preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          setPreviewUrl(e.target.result);
        }
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      setPreviewUrl("");
    }
  };
  
  // Función para editar una máquina
  const handleEdit = (id: number) => {
    // Redirigir a página de edición
    window.location.href = `/machines/${id}/edit`;
  };
  
  // Función para seleccionar/deseleccionar una máquina
  const handleSelectMachine = (id: number) => {
    if (selectedMachines.includes(id)) {
      setSelectedMachines(selectedMachines.filter(machineId => machineId !== id));
    } else {
      setSelectedMachines([...selectedMachines, id]);
    }
  };
  
  // Función para eliminar las máquinas seleccionadas
  const handleDeleteSelected = async () => {
    if (!confirm(`¿Está seguro de eliminar ${selectedMachines.length} ${selectedMachines.length === 1 ? 'máquina' : 'máquinas'}?`)) {
      return;
    }
    
    try {
      // Crear un array de promesas para eliminar todas las máquinas seleccionadas
      const deletePromises = selectedMachines.map(id => 
        fetch(`/api/machines/${id}`, {
          method: "DELETE",
          credentials: "include"
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Error al eliminar máquina ID ${id}: ${response.statusText}`);
          }
          return response;
        })
      );
      
      // Ejecutar todas las promesas
      await Promise.all(deletePromises);
      
      toast({
        description: `${selectedMachines.length} ${selectedMachines.length === 1 ? 'máquina eliminada' : 'máquinas eliminadas'} correctamente`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      setSelectedMachines([]);
    } catch (error) {
      console.error("Error al eliminar máquinas:", error);
      toast({
        variant: "destructive",
        description: "Error al eliminar máquinas. Por favor, intente nuevamente."
      });
    }
  };
  
  // Helper para obtener etiqueta del tipo de máquina
  const getMachineTypeLabel = (type: string): string => {
    switch (type) {
      case "tractor": return "Tractor";
      case "topadora": return "Topadora";
      case "camion": return "Camión";
      case "vehiculo": return "Vehículo";
      case "accesorio": return "Accesorio";
      default: return type;
    }
  };
  
  // Helper para obtener icono según el tipo de máquina
  const getMachineTypeIcon = (type: string): string => {
    switch (type) {
      case "tractor": return "ri-tractor-line";
      case "topadora": return "ri-loader-line";
      case "camion": return "ri-truck-line";
      case "vehiculo": return "ri-car-line";
      case "accesorio": return "ri-tools-line";
      default: return "ri-tractor-line";
    }
  };
  
  // Helper para obtener etiqueta del estado
  const getMachineStatusLabel = (status: string): string => {
    switch (status) {
      case "activo": return "Activo";
      case "en_reparacion": return "En reparación";
      case "fuera_de_servicio": return "Fuera de servicio";
      default: return status;
    }
  };
  
  // Filtrado de máquinas según búsqueda y filtro
  const filteredMachines = machines && Array.isArray(machines) ? machines.filter((machine: any) => {
    // Filtro por búsqueda (marca, modelo, descripción)
    const searchLower = search.toLowerCase();
    const matchesSearch = search === "" || 
      (machine.brand && machine.brand.toLowerCase().includes(searchLower)) ||
      (machine.model && machine.model.toLowerCase().includes(searchLower)) ||
      (machine.description && machine.description.toLowerCase().includes(searchLower));
    
    // Filtro por tipo de máquina
    const matchesFilter = filter === "all" || machine.type === filter;
    
    return matchesSearch && matchesFilter;
  }) : [];

  if (isLoading) {
    return <div className="py-10 text-center">Cargando unidades productivas...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Error al cargar las unidades productivas</div>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/machines"] })}
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
          <h1 className="text-2xl font-header font-bold text-neutral-500">Gestión de Maquinarias</h1>
          <p className="text-neutral-400 text-sm">Gestiona tus camiones, tractores, topadoras y accesorios</p>
        </div>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          {/* Botón para eliminar seleccionados - solo se muestra si hay elementos seleccionados */}
          {selectedMachines.length > 0 && (
            <Button 
              variant="destructive"
              onClick={handleDeleteSelected}
            >
              <i className="ri-delete-bin-line mr-1"></i> 
              Eliminar ({selectedMachines.length})
            </Button>
          )}
          
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <i className="ri-add-line mr-1"></i> Nueva Máquina
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto h-full max-h-screen pb-24">
              <SheetHeader>
                <SheetTitle>Nueva Máquina</SheetTitle>
                <SheetDescription>
                  Complete la información de la máquina. Todos los campos marcados con * son obligatorios.
                </SheetDescription>
              </SheetHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
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
                            <SelectItem value="tractor">Tractor</SelectItem>
                            <SelectItem value="topadora">Topadora</SelectItem>
                            <SelectItem value="camion">Camión</SelectItem>
                            <SelectItem value="vehiculo">Vehículo</SelectItem>
                            <SelectItem value="accesorio">Accesorio</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año de fabricación *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas/Kilómetros *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <ImageUpload 
                      onChange={handleFileChange}
                      value={previewUrl}
                      label="Imagen"
                    />
                  </div>
                  
                  <SheetFooter className="pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Guardando...' : 'Guardar máquina'}
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Maquinarias</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          {/* Búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              placeholder="Buscar maquinaria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            
            <Select
              value={filter}
              onValueChange={setFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="tractor">Tractores</SelectItem>
                <SelectItem value="topadora">Topadoras</SelectItem>
                <SelectItem value="camion">Camiones</SelectItem>
                <SelectItem value="vehiculo">Vehículos</SelectItem>
                <SelectItem value="accesorio">Accesorios</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Lista de máquinas en formato tabla */}
          {filteredMachines.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border">
              <i className="ri-truck-line text-5xl text-neutral-300"></i>
              <p className="mt-4 text-neutral-500">No hay unidades productivas que coincidan con tu búsqueda</p>
              <Button variant="outline" onClick={() => {setSearch(""); setFilter("all")}} className="mt-2">
                Mostrar todas
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead className="hidden md:table-cell">Año</TableHead>
                    <TableHead className="hidden md:table-cell">Horas/Km</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                    <TableHead className="w-10 text-right">
                      <input 
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary"
                        checked={filteredMachines.length > 0 && selectedMachines.length === filteredMachines.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Seleccionar todos
                            setSelectedMachines(filteredMachines.map((m: any) => m.id));
                          } else {
                            // Deseleccionar todos
                            setSelectedMachines([]);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMachines.map((machine: any) => (
                    <TableRow 
                      key={machine.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        // Navegación a detalles de la máquina
                        window.location.href = `/machines/${machine.id}`;
                      }}
                    >
                      <TableCell>
                        {machine.photo ? (
                          <img 
                            src={machine.photo} 
                            alt={`${machine.brand} ${machine.model}`} 
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <i className={`${getMachineTypeIcon(machine.type)} text-muted-foreground`}></i>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={machine.type === 'accesorio' ? 'outline' : 'default'}
                          className={`${
                            machine.type === 'tractor' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200' :
                            machine.type === 'topadora' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200' :
                            machine.type === 'camion' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200' :
                            machine.type === 'vehiculo' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {getMachineTypeLabel(machine.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{machine.brand} {machine.model}</TableCell>
                      <TableCell className="hidden md:table-cell">{machine.year}</TableCell>
                      <TableCell className="hidden md:table-cell">{machine.hours} hs</TableCell>
                      <TableCell>{machine.location || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            machine.status === 'activo' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
                          }
                        >
                          {getMachineStatusLabel(machine.status)}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          {/* Mantenimiento (1º) */}
                          <Button variant="ghost" size="icon" className="h-10 w-10" title="Registrar mantenimiento">
                            <Link href={`/machines/${machine.id}/maintenance`}>
                              <i className="ri-settings-line text-xl text-orange-500"></i>
                            </Link>
                          </Button>
                          
                          {/* Trabajos (2º) */}
                          <Button variant="ghost" size="icon" className="h-10 w-10" title="Trabajos">
                            <Link href={`/machines/${machine.id}/work`}>
                              <i className="ri-tools-line text-xl text-blue-500"></i>
                            </Link>
                          </Button>
                          
                          {/* Editar (3º) */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10" 
                            title="Editar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(machine.id);
                            }}
                          >
                            <i className="ri-edit-line text-xl text-amber-500"></i>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                          checked={selectedMachines.includes(machine.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectMachine(machine.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          <div className="p-8 text-center border rounded-md">
            <div className="flex flex-col items-center justify-center">
              <div className="bg-neutral-100 p-4 rounded-full mb-4">
                <i className="ri-bar-chart-line text-neutral-400 text-4xl"></i>
              </div>
              <h3 className="font-medium text-lg mb-1">Estadísticas de maquinarias</h3>
              <p className="text-neutral-500 max-w-md">
                En desarrollo: Esta sección mostrará estadísticas detalladas sobre uso, costos y mantenimiento de la maquinaria.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}