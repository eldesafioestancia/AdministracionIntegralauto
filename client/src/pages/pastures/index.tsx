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
  description: z.string().optional(),
  location: z.string().optional(),
  soilType: z.string().optional(),
  waterSource: z.string().optional(),
  status: z.string().optional().default("active"),
});

type PastureFormValues = z.infer<typeof pastureFormSchema>;

export default function PasturesIndex() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("parcels");
  const { toast } = useToast();

  // Consultar las pasturas
  const { data: pastures, isLoading } = useQuery({
    queryKey: ["/api/pastures"],
  });

  const form = useForm<PastureFormValues>({
    resolver: zodResolver(pastureFormSchema),
    defaultValues: {
      name: "",
      area: "",
      description: "",
      location: "",
      soilType: "",
      waterSource: "",
      status: "active",
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
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Registrar nueva parcela</SheetTitle>
                <SheetDescription>
                  Complete los datos de la parcela
                </SheetDescription>
              </SheetHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Lote Norte"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Superficie (Ha)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
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
                            placeholder="Ej: Sector Norte, Camino Rural km 5"
                            {...field}
                          />
                        </FormControl>
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
                        <FormLabel>Agua</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Descripción o detalles adicionales"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <SheetFooter>
                    <Button type="submit">Guardar Parcela</Button>
                  </SheetFooter>
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
    </div>
  );
}