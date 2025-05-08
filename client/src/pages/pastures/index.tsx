import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

// Esquema para el formulario de pasturas
const pastureFormSchema = z.object({
  name: z.string({
    required_error: "El nombre es requerido",
  }).min(1, {
    message: "El nombre es requerido"
  }),
  area: z.string({
    required_error: "La superficie es requerida",
  }).min(1, {
    message: "La superficie es requerida"
  }),
  location: z.string().optional(),
  soilType: z.string().optional(),
  waterSource: z.string().optional(),
  status: z.string().optional().default("active"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  acquisitionDate: z.date().optional(),
  acquisitionValue: z.string().optional(),
  description: z.string().optional(),
});

// Esquema para el formulario de trabajos agrícolas
const pastureWorkFormSchema = z.object({
  pastureId: z.number({
    required_error: "Debe seleccionar una parcela",
  }),
  workType: z.string({
    required_error: "El tipo de trabajo es requerido",
  }).min(1, {
    message: "El tipo de trabajo es requerido"
  }),
  description: z.string({
    required_error: "La descripción es requerida",
  }).min(1, {
    message: "La descripción es requerida"
  }),
  startDate: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
  endDate: z.date().optional().nullable(),
  machineId: z.number().optional().nullable(),
  areaWorked: z.string().optional().nullable(),
  workingHours: z.string().optional().nullable(),
  fuelUsed: z.string().optional().nullable(),
  operativeCost: z.string().optional().nullable(),
  suppliesCost: z.string().optional().nullable(),
  totalCost: z.string().optional().nullable(),
  weatherConditions: z.string().optional().nullable(),
  temperature: z.string().optional().nullable(),
  soilHumidity: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
});

type PastureFormValues = z.infer<typeof pastureFormSchema>;
type PastureWorkFormValues = z.infer<typeof pastureWorkFormSchema>;

export default function PasturesIndex() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [workSheetOpen, setWorkSheetOpen] = useState(false);
  const [selectedPastureId, setSelectedPastureId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("parcels");
  const { toast } = useToast();

  // Consultar las pasturas
  const { data: pastures, isLoading } = useQuery({
    queryKey: ["/api/pastures"],
  });
  
  // Consultar las máquinas para el formulario de trabajos
  const { data: machines } = useQuery({
    queryKey: ["/api/machines"],
  });
  
  // Consultar los trabajos agrícolas de parcelas
  const { data: pastureWorks } = useQuery({
    queryKey: ["/api/pasture-works"],
  });

  const form = useForm<PastureFormValues>({
    resolver: zodResolver(pastureFormSchema),
    defaultValues: {
      name: "",
      area: "",
      location: "",
      soilType: "",
      waterSource: "",
      status: "active",
      latitude: "",
      longitude: "",
      acquisitionValue: "",
      description: "",
    },
  });

  // Formulario para trabajos agrícolas
  const workForm = useForm<PastureWorkFormValues>({
    resolver: zodResolver(pastureWorkFormSchema),
    defaultValues: {
      pastureId: 0,
      workType: "",
      description: "",
      startDate: new Date(),
      endDate: null,
      machineId: null,
      areaWorked: null,
      workingHours: null,
      fuelUsed: null,
      operativeCost: null,
      suppliesCost: null,
      totalCost: null,
      weatherConditions: null,
      temperature: null,
      soilHumidity: null,
      observations: null,
    },
  });

  // Tipos de suelo
  const soilTypes = [
    { value: "arcilloso", label: "Arcilloso" },
    { value: "arenoso", label: "Arenoso" },
    { value: "limoso", label: "Limoso" },
    { value: "franco", label: "Franco" },
    { value: "humifero", label: "Humífero" },
  ];
  
  // Tipos de trabajo
  const workTypes = [
    { value: "siembra", label: "Siembra" },
    { value: "pulverizacion", label: "Pulverización" },
    { value: "fertilizacion", label: "Fertilización" },
    { value: "cosecha", label: "Cosecha" },
    { value: "labranza", label: "Labranza" },
    { value: "riego", label: "Riego" },
    { value: "mantenimiento", label: "Mantenimiento" },
    { value: "otro", label: "Otro" }
  ];
  
  // Condiciones climáticas
  const weatherConditionTypes = [
    { value: "soleado", label: "Soleado" },
    { value: "nublado", label: "Nublado" },
    { value: "lluvioso", label: "Lluvioso" },
    { value: "ventoso", label: "Ventoso" },
    { value: "tormenta", label: "Tormenta" },
  ];

  // Fuentes de agua
  const waterSources = [
    { value: "disponible", label: "Disponible" },
    { value: "limitada", label: "Limitada" },
    { value: "no_disponible", label: "No Disponible" },
  ];

  // Estados
  const statuses = [
    { value: "active", label: "Activa" },
    { value: "fallow", label: "Barbecho" },
    { value: "preparation", label: "En Preparación" },
    { value: "inactive", label: "Inactiva" },
  ];

  async function onSubmit(values: PastureFormValues) {
    try {
      await apiRequest("POST", "/api/pastures", values);

      // Invalidar consulta de pasturas
      queryClient.invalidateQueries({ queryKey: ["/api/pastures"] });
      
      toast({
        title: "Parcela creada",
        description: "La parcela ha sido creada exitosamente",
      });
      
      setSheetOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating pasture:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la parcela",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Está seguro de eliminar esta parcela?")) return;
    
    try {
      await apiRequest("DELETE", `/api/pastures/${id}`, {});
      
      // Invalidar consulta de pasturas
      queryClient.invalidateQueries({ queryKey: ["/api/pastures"] });
      
      toast({
        title: "Parcela eliminada",
        description: "La parcela ha sido eliminada exitosamente",
      });
      
    } catch (error) {
      console.error("Error deleting pasture:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la parcela",
        variant: "destructive",
      });
    }
  }
  
  // Función para abrir el sheet de trabajo agrícola
  function handleOpenWorkSheet(pastureId: number) {
    setSelectedPastureId(pastureId);
    workForm.setValue("pastureId", pastureId);
    setWorkSheetOpen(true);
  }
  
  // Función para manejar el envío del formulario de trabajo agrícola
  async function handleWorkSubmit(values: PastureWorkFormValues) {
    try {
      // Calculamos el costo total si hay costos de suministros y operativos
      if (values.operativeCost && values.suppliesCost) {
        const operativeCost = parseFloat(values.operativeCost);
        const suppliesCost = parseFloat(values.suppliesCost);
        
        if (!isNaN(operativeCost) && !isNaN(suppliesCost)) {
          values.totalCost = (operativeCost + suppliesCost).toString();
        }
      }
      
      await apiRequest("POST", "/api/pasture-works", values);
      
      // Invalidamos la consulta de trabajos
      queryClient.invalidateQueries({ queryKey: ["/api/pasture-works"] });
      
      toast({
        title: "Trabajo registrado",
        description: "El trabajo agrícola ha sido registrado exitosamente",
      });
      
      setWorkSheetOpen(false);
      workForm.reset({
        pastureId: 0,
        workType: "",
        description: "",
        startDate: new Date(),
        endDate: null,
        machineId: null,
        areaWorked: null,
        workingHours: null,
        fuelUsed: null,
        operativeCost: null,
        suppliesCost: null,
        totalCost: null,
        weatherConditions: null,
        temperature: null,
        soilHumidity: null,
        observations: null,
      });
      
    } catch (error) {
      console.error("Error registering work:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el trabajo agrícola",
        variant: "destructive",
      });
    }
  }
  
  // Función para eliminar un trabajo agrícola
  async function handleDeleteWork(id: number) {
    if (!confirm("¿Está seguro de eliminar este trabajo?")) return;
    
    try {
      await apiRequest("DELETE", `/api/pasture-works/${id}`, {});
      
      // Invalidar consulta de trabajos
      queryClient.invalidateQueries({ queryKey: ["/api/pasture-works"] });
      
      toast({
        title: "Trabajo eliminado",
        description: "El trabajo ha sido eliminado exitosamente",
      });
      
    } catch (error) {
      console.error("Error deleting work:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el trabajo",
        variant: "destructive",
      });
    }
  }

  // Calcular totales
  const pasturesArray = pastures && Array.isArray(pastures) ? pastures : [];
  
  const totalArea = pasturesArray.reduce((acc: number, pasture: any) => {
    return acc + parseFloat(pasture.area || 0);
  }, 0);

  const activePastures = pasturesArray.filter((pasture: any) => 
    pasture.status === "active"
  );

  const getStatusLabel = (status: string) => {
    const statusItem = statuses.find(s => s.value === status);
    return statusItem ? statusItem.label : status;
  };

  const getSoilTypeLabel = (soilType: string) => {
    const soilItem = soilTypes.find(s => s.value === soilType);
    return soilItem ? soilItem.label : soilType;
  };

  const getWaterLabel = (water: string) => {
    const waterItem = waterSources.find(w => w.value === water);
    return waterItem ? waterItem.label : water;
  };

  if (isLoading) {
    return <div className="py-10 text-center">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Gestión de Pasturas</h1>
          <p className="text-neutral-400 text-sm">
            Gestiona parcelas y lotes para cultivos y pasturas
          </p>
        </div>
        
        <div className="mt-2 sm:mt-0">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <i className="ri-add-line mr-1"></i> Nueva Parcela
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto h-full max-h-screen pb-24">
              <SheetHeader>
                <SheetTitle>Nueva Parcela</SheetTitle>
                <SheetDescription>
                  Complete la información de la parcela. Todos los campos marcados con * son obligatorios.
                </SheetDescription>
              </SheetHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 overflow-y-auto">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Lote Norte"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Nombre descriptivo de la parcela.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Superficie (Ha) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="150.5"
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Superficie en hectáreas.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Sector Norte, km 5"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Descripción general de la ubicación
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="soilType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Suelo</FormLabel>
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
                            {soilTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="waterSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponibilidad de Agua</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione disponibilidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {waterSources.map(source => (
                              <SelectItem key={source.value} value={source.value}>
                                {source.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          ¿La parcela cuenta con disponibilidad de agua para riego?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statuses.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitud</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: -34.603722"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Coordenada geográfica
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitud</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: -58.381592"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Coordenada geográfica
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="acquisitionDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Adquisición</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: es })
                                ) : (
                                  <span>dd/mm/aaaa</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acquisitionValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Adquisición</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ej: 100000.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detalles adicionales y observaciones"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-6 pb-8">
                    <Button type="submit" className="w-full">Guardar Parcela</Button>
                  </div>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Superficie Total */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Superficie Total</CardTitle>
            <CardDescription>
              Total de hectáreas disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-semibold text-green-600">
                {totalArea.toFixed(2)} <span className="text-base font-normal text-neutral-500">hectáreas</span>
              </p>
              <p className="text-sm text-neutral-500">
                {pasturesArray.length} parcelas registradas
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Parcelas Activas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Parcelas Activas</CardTitle>
            <CardDescription>
              Parcelas en uso actualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-semibold text-blue-600">
                {activePastures.length} <span className="text-base font-normal text-neutral-500">parcelas</span>
              </p>
              {pasturesArray.length > 0 && (
                <p className="text-sm text-neutral-500">
                  {Math.round((activePastures.length / pasturesArray.length) * 100)}% del total de parcelas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Últimos Trabajos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Últimos Trabajos</CardTitle>
            <CardDescription>
              Actividades agrícolas recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 h-12 flex items-center">
              <p className="text-sm text-neutral-400 italic">
                No hay trabajos recientes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs para Parcelas y Rollos */}
      <Tabs defaultValue="parcels" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="parcels">
            <i className="ri-landscape-line mr-1"></i> Parcelas
          </TabsTrigger>
          <TabsTrigger value="bales">
            <i className="ri-stack-line mr-1"></i> Rollos y Pasturas
          </TabsTrigger>
        </TabsList>
        
        {/* Contenido de Parcelas */}
        <TabsContent value="parcels" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Superficie (Ha)</TableHead>
                  <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo de Suelo</TableHead>
                  <TableHead>Agua</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pasturesArray.length > 0 ? (
                  pasturesArray.map((pasture: any) => (
                    <TableRow key={pasture.id}>
                      <TableCell className="font-medium">{pasture.name}</TableCell>
                      <TableCell>{parseFloat(pasture.area).toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">{pasture.location || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{pasture.soilType ? getSoilTypeLabel(pasture.soilType) : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={pasture.waterSource === 'disponible' ? 'outline' : 'secondary'}>
                          {pasture.waterSource ? getWaterLabel(pasture.waterSource) : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={pasture.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''} variant={pasture.status === 'active' ? 'outline' : 'secondary'}>
                          {getStatusLabel(pasture.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Ver detalles"
                          >
                            <i className="ri-eye-line text-blue-500"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Editar"
                          >
                            <i className="ri-pencil-line text-amber-500"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Trabajos Realizados"
                            onClick={() => handleOpenWorkSheet(pasture.id)}
                          >
                            <i className="ri-tools-fill text-blue-500"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Eliminar"
                            onClick={() => handleDelete(pasture.id)}
                          >
                            <i className="ri-delete-bin-line text-red-500"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-neutral-400">
                      No hay parcelas registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Contenido de Rollos y Pasturas */}
        <TabsContent value="bales" className="mt-4">
          <div className="p-8 text-center border rounded-md">
            <div className="flex flex-col items-center justify-center">
              <div className="bg-neutral-100 p-4 rounded-full mb-4">
                <i className="ri-stack-line text-neutral-400 text-4xl"></i>
              </div>
              <h3 className="text-lg font-medium">Gestión de Rollos y Pasturas</h3>
              <p className="text-neutral-500 mt-2 max-w-md">
                En esta sección podrá gestionar los rollos de pasto, reservas y alimentación para el ganado.
              </p>
              <Button className="mt-4">
                <i className="ri-add-line mr-1"></i> Agregar Registro
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Formulario de Trabajo Agrícola */}
      <Sheet open={workSheetOpen} onOpenChange={setWorkSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto h-full max-h-screen pb-24">
          <SheetHeader>
            <SheetTitle>Nuevo Trabajo Agrícola</SheetTitle>
            <SheetDescription>
              Registre un trabajo o labor realizada en la parcela seleccionada. Los campos marcados con * son obligatorios.
            </SheetDescription>
          </SheetHeader>
          
          <Form {...workForm}>
            <form onSubmit={workForm.handleSubmit(handleWorkSubmit)} className="space-y-4 py-4 overflow-y-auto">
              {/* Tipo de trabajo */}
              <FormField
                control={workForm.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Trabajo *</FormLabel>
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
                        {workTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Descripción */}
              <FormField
                control={workForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalles del trabajo realizado"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={workForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Inicio *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: es })
                              ) : (
                                <span>dd/mm/aaaa</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={workForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Finalización</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: es })
                              ) : (
                                <span>dd/mm/aaaa</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Máquina */}
              <FormField
                control={workForm.control}
                name="machineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máquina Utilizada</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "0" ? null : parseInt(value))} 
                      value={field.value?.toString() || "0"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una máquina" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Ninguna</SelectItem>
                        {machines && Array.isArray(machines) && machines.map((machine: any) => (
                          <SelectItem key={machine.id} value={machine.id.toString()}>
                            {machine.brand} {machine.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Maquinaria utilizada para este trabajo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Área trabajada y horas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={workForm.control}
                  name="areaWorked"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Superficie Trabajada (Ha)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="125.5"
                          step="0.01"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={workForm.control}
                  name="workingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas de Trabajo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="8.5"
                          step="0.5"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Combustible y costos */}
              <FormField
                control={workForm.control}
                name="fuelUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Combustible Utilizado (L)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150"
                        step="0.1"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={workForm.control}
                  name="operativeCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo Operativo ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5000"
                          step="100"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={workForm.control}
                  name="suppliesCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo de Insumos ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15000"
                          step="100"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Condiciones ambientales */}
              <FormField
                control={workForm.control}
                name="weatherConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condiciones Climáticas</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione condición" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weatherConditionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={workForm.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="25"
                          step="0.5"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={workForm.control}
                  name="soilHumidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Humedad del Suelo (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="45"
                          min="0"
                          max="100"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Observaciones */}
              <FormField
                control={workForm.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observaciones adicionales sobre el trabajo"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <SheetFooter className="mt-4">
                <Button type="submit">Registrar Trabajo</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}