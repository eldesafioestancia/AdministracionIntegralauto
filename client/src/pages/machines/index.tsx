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
  purchaseDate: z.date({
    required_error: "La fecha de compra es requerida",
  }),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  purchasePrice: z.string().optional(),
  paymentMethod: z.string().optional(),
  warrantyStart: z.date().optional().nullable(),
  warrantyEnd: z.date().optional().nullable(),
  documentation: z.string().optional(),
  photo: z.string().optional(),
});

type MachineFormValues = z.infer<typeof machineFormSchema>;

export default function MachinesIndex() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      serialNumber: "",
      year: new Date().getFullYear(),
      hours: "0",
      power: "",
      fuelType: "",
      licensePlate: "",
      purchaseDate: new Date(),
      supplier: "",
      invoiceNumber: "",
      purchasePrice: "",
      paymentMethod: "",
      warrantyStart: null,
      warrantyEnd: null,
      documentation: "",
      photo: "",
    },
  });

  async function onSubmit(values: MachineFormValues) {
    try {
      setIsSubmitting(true);
      
      // Si hay un archivo de foto, súbelo primero
      let photoUrl = values.photo;
      if (photoFile) {
        photoUrl = await uploadFile(photoFile, "machines");
      }
      
      // Enviar los datos con la URL de la foto
      await apiRequest("POST", "/api/machines", {
        ...values,
        photo: photoUrl
      });
      
      // Invalidate machines query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      
      toast({
        title: "Unidad creada",
        description: "La unidad productiva ha sido creada exitosamente",
      });
      
      setSheetOpen(false);
      setPhotoFile(null);
      form.reset();
      
    } catch (error) {
      console.error("Error creating machine:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la unidad productiva",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const getMachineTypeLabel = (type: string) => {
    switch (type) {
      case "tractor": return "Tractor";
      case "topadora": return "Topadora";
      case "camion": return "Camión";
      case "vehiculo": return "Vehículo";
      case "accesorio": return "Accesorio";
      default: return type;
    }
  };

  const getMachineTypeIcon = (type: string) => {
    switch (type) {
      case "tractor": return "ri-steering-2-fill"; // Icono de tractor
      case "topadora": return "ri-loader-line"; // Icono de topadora
      case "camion": return "ri-truck-fill"; // Icono de camión
      case "vehiculo": return "ri-car-fill"; // Icono de vehículo
      case "accesorio": return "ri-tools-fill"; // Icono de accesorio/herramienta
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
      case "vehiculo":
        return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80";
      case "accesorio":
        return "https://images.unsplash.com/photo-1617703191607-f5e3ca7f34dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80";
      default:
        return "https://images.unsplash.com/photo-1605654145610-2f65428be306?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80";
    }
  };

  // Filter machines
  const filteredMachines = Array.isArray(machines) ? machines.filter((machine: any) => {
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
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nueva unidad
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Agregar nueva unidad productiva</SheetTitle>
              <SheetDescription>
                Complete los datos de la nueva máquina
              </SheetDescription>
            </SheetHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                          <SelectItem value="vehiculo">Vehículo</SelectItem>
                          <SelectItem value="accesorio">Accesorio</SelectItem>
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
                
                {/* Datos de identificación */}
                <h3 className="font-semibold text-base text-neutral-500 mt-4">Datos de identificación</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de serie</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="SN-12345678" />
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
                        <FormLabel>Año de fabricación</FormLabel>
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas/Kms</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="power"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potencia (HP/kW)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="150 HP" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Combustible</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Diesel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patente/matrícula</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABC-123" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Datos de adquisición */}
                <h3 className="font-semibold text-base text-neutral-500 mt-4">Datos de adquisición</h3>
                
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
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor/Vendedor</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Concesionario S.A." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de factura</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="A-0001-00000123" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio de compra</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="25000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de pago</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Crédito" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="warrantyStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inicio garantía</FormLabel>
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
                    name="warrantyEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fin garantía</FormLabel>
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
                  name="documentation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documentación (URL)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://ejemplo.com/documento.pdf" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fotografía</FormLabel>
                      <FormControl>
                        <div className="mt-2">
                          <ImageUpload
                            value={field.value}
                            onChange={(file) => {
                              setPhotoFile(file);
                              // Si hay un archivo, guardamos un valor temporal para validación
                              // La URL real se asignará después de la carga
                              field.onChange(file ? "uploading" : "");
                            }}
                            label="Fotografía de la unidad"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <SheetFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSheetOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
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
            <SelectItem value="vehiculo">Vehículos</SelectItem>
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
            <Button
              onClick={() => setSheetOpen(true)}
            >
              <i className="ri-add-line mr-1"></i> Nueva unidad
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMachines.map((machine: any) => (
            <Card key={machine.id} className="p-0 overflow-hidden">
              <div className="flex items-center">
                <div className="w-16 h-16 flex-shrink-0 bg-neutral-100 flex items-center justify-center">
                  <i className={`${getMachineTypeIcon(machine.type)} text-2xl text-neutral-500`}></i>
                </div>
                
                <Link href={`/machines/${machine.id}`} className="flex-1 px-4 py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <h3 className="font-medium text-neutral-800">{machine.brand} {machine.model}</h3>
                      <Badge 
                        className={`ml-2 px-2 py-0 h-5 ${
                          machine.type === "tractor" ? "bg-red-100 text-red-800 hover:bg-red-200" :
                          machine.type === "camion" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                          machine.type === "topadora" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                          machine.type === "vehiculo" ? "bg-amber-100 text-amber-800 hover:bg-amber-200" :
                          machine.type === "accesorio" ? "bg-purple-100 text-purple-800 hover:bg-purple-200" :
                          ""
                        }`}
                      >
                        {getMachineTypeLabel(machine.type)}
                      </Badge>
                    </div>
                    <div className="text-sm text-neutral-500 flex items-center space-x-3">
                      <span className="flex items-center">
                        <i className="ri-calendar-line mr-1"></i> {machine.year}
                      </span>
                      <span className="flex items-center">
                        <i className="ri-time-line mr-1"></i> {machine.hours} hs
                      </span>
                    </div>
                  </div>
                </Link>
                
                <div className="flex items-center space-x-1 pr-3">
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9" title="Editar">
                    <Link href={`/machines/${machine.id}/edit`}>
                      <i className="ri-edit-line text-lg"></i>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9" title="Registrar mantenimiento">
                    <Link href={`/machines/${machine.id}/maintenance`}>
                      <i className="ri-tools-line text-lg"></i>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9" title="Trabajos">
                    <Link href={`/machines/${machine.id}/work`}>
                      <i className="ri-tools-line text-blue-500 text-lg"></i>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9" title="Registrar movimiento financiero">
                    <Link href={`/finances?openForm=true&type=expense&category=maquinarias&description=Gasto - ${machine.brand} ${machine.model}&machineId=${machine.id}`}>
                      <i className="ri-money-dollar-circle-line text-green-500 text-lg"></i>
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