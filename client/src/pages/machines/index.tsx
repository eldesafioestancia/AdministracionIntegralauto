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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  type: z.enum(["tractor", "topadora", "camion"], { 
    required_error: "El tipo de unidad es requerido",
  }),
  brand: z.string().min(1, { message: "La marca es requerida" }),
  model: z.string().min(1, { message: "El modelo es requerido" }),
  year: z.number().int().min(1900, { message: "Año inválido" }).max(new Date().getFullYear(), { message: "Año inválido" }),
  hours: z.string().min(1, { message: "Las horas son requeridas" }),
  purchaseDate: z.date({
    required_error: "La fecha de compra es requerida",
  }),
});

type MachineFormValues = z.infer<typeof machineFormSchema>;

export default function MachinesIndex() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: machines, isLoading, error } = useQuery({
    queryKey: ["/api/machines"],
  });

  const form = useForm<MachineFormValues>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      type: "tractor",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      hours: "0",
      purchaseDate: new Date(),
    },
  });

  async function onSubmit(values: MachineFormValues) {
    try {
      await apiRequest("POST", "/api/machines", values);
      
      // Invalidate machines query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      
      toast({
        title: "Unidad creada",
        description: "La unidad productiva ha sido creada exitosamente",
      });
      
      setDialogOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating machine:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la unidad productiva",
        variant: "destructive",
      });
    }
  }

  const getMachineTypeLabel = (type: string) => {
    switch (type) {
      case "tractor": return "Tractor";
      case "topadora": return "Topadora";
      case "camion": return "Camión";
      default: return type;
    }
  };

  const getMachineTypeIcon = (type: string) => {
    switch (type) {
      case "tractor": return "ri-truck-line";
      case "topadora": return "ri-loader-line";
      case "camion": return "ri-truck-fill";
      default: return "ri-truck-line";
    }
  };

  const getMachineImage = (type: string) => {
    switch (type) {
      case "tractor":
        return "https://images.unsplash.com/photo-1593613128698-1a5de600051a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80";
      case "topadora":
        return "https://images.unsplash.com/photo-1613046561926-371d5403d504?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80";
      case "camion":
        return "https://images.unsplash.com/photo-1626078427472-7811789ed2dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80";
      default:
        return "https://images.unsplash.com/photo-1605654145610-2f65428be306?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80";
    }
  };

  // Filter machines
  const filteredMachines = machines ? machines.filter(machine => {
    const matchesSearch = 
      machine.brand.toLowerCase().includes(search.toLowerCase()) ||
      machine.model.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === "all" || 
      machine.type === filter;
    
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
          <h1 className="text-2xl font-header font-bold text-neutral-500">Maquinarias</h1>
          <p className="text-neutral-400 text-sm">Gestiona tus camiones, tractores, topadoras y accesorios</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nueva unidad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar nueva unidad productiva</DialogTitle>
              <DialogDescription>
                Complete los datos de la nueva máquina
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="John Deere" {...field} />
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
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="6130M" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2020" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
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
                        <FormLabel>Horas de trabajo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por marca o modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="camion">Camiones</SelectItem>
            <SelectItem value="tractor">Tractores</SelectItem>
            <SelectItem value="topadora">Topadoras</SelectItem>
            <SelectItem value="accesorio">Accesorios</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Machines List */}
      {filteredMachines.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <i className="ri-truck-line text-4xl text-neutral-300 mb-2"></i>
          <h3 className="text-lg font-medium text-neutral-500 mb-1">No se encontraron unidades</h3>
          <p className="text-neutral-400 mb-4">
            {search || filter !== "all" 
              ? "Intente con otros filtros de búsqueda" 
              : "Registre una nueva unidad productiva para comenzar"}
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
            <DialogTrigger asChild>
              <Button>
                <i className="ri-add-line mr-1"></i> Nueva unidad
              </Button>
            </DialogTrigger>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachines.map((machine) => (
            <Link key={machine.id} href={`/machines/${machine.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                <div className="aspect-w-16 aspect-h-9 bg-neutral-100">
                  <img
                    src={getMachineImage(machine.type)}
                    alt={`${machine.brand} ${machine.model}`}
                    className="object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      {machine.brand} {machine.model}
                    </CardTitle>
                    <Badge>{getMachineTypeLabel(machine.type)}</Badge>
                  </div>
                  <CardDescription>
                    Año: {machine.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-neutral-500">
                      <i className="ri-time-line mr-1"></i>
                      <span>{machine.hours} horas de trabajo</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 mt-auto">
                  <div className="w-full flex justify-between text-sm text-neutral-400">
                    <span>Adquirido: {format(new Date(machine.purchaseDate), "dd/MM/yyyy")}</span>
                    <Button variant="ghost" size="sm" className="px-2">
                      <i className="ri-arrow-right-line"></i>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
