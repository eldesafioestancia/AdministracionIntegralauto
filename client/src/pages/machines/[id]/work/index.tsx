import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Esquema para el formulario de registro de trabajo agrícola para máquinas
const machineWorkFormSchema = z.object({
  machineId: z.number({ required_error: "La máquina es requerida" }),
  pastureId: z.number().optional().nullable(),
  workType: z.string({ required_error: "El tipo de trabajo es requerido" }),
  description: z.string().optional(),
  startDate: z.date({ required_error: "La fecha de inicio es requerida" }),
  endDate: z.date().optional().nullable(),
  areaWorked: z.string().optional(),
  distance: z.string().optional(),
  workTime: z.string().optional(),
  fuelUsed: z.string().optional(),
  costPerUnit: z.string().optional(), // Costo por hectárea o kilómetro
  unitType: z.string().optional(), // Tipo de unidad (hectárea o kilómetro)
  operationalCost: z.string().optional(),
  suppliesCost: z.string().optional(),
  totalCost: z.string().optional(),
  revenueAmount: z.string().optional(), // Monto a registrar como ingreso
  weatherCondition: z.string().optional(),
  temperature: z.string().optional(),
  soilHumidity: z.string().optional(),
  seedType: z.string().optional(),
  kgPerHa: z.string().optional(),
  agrochemicalType: z.string().optional(),
  litersPerHa: z.string().optional(),
  fertilizerType: z.string().optional(),
  amountPerHa: z.string().optional(),
  threadRolls: z.string().optional(),
  rollsPerHa: z.string().optional(),
  observations: z.string().optional(),
});

type MachineWorkFormValues = z.infer<typeof machineWorkFormSchema>;

export default function MachineWorkIndex() {
  const { id } = useParams();
  const machineId = parseInt(id);
  const [workSheetOpen, setWorkSheetOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  // Consultar la información de la máquina
  const { data: machine, isLoading: isLoadingMachine } = useQuery({
    queryKey: [`/api/machines/${machineId}`],
  });

  // Consultar los trabajos agrícolas donde se usó esta máquina
  const { data: pastureWorks, isLoading: isLoadingWorks } = useQuery({
    queryKey: ["/api/pasture-works"],
  });

  // Consultar las parcelas para mostrar en el formulario
  const { data: pastures, isLoading: isLoadingPastures } = useQuery({
    queryKey: ["/api/pastures"],
  });

  // Filtrar trabajos por la máquina actual
  const machineWorks = pastureWorks && Array.isArray(pastureWorks) 
    ? pastureWorks.filter((work: any) => work.machineId === machineId)
    : [];
    
  // Estado para la selección del tipo de máquina
  const [selectedMachineType, setSelectedMachineType] = useState<string | null>(machine?.type || null);

  // Tipos de trabajo para diferentes tipos de máquinas
  const defaultWorkTypes = [
    "Siembra", "Cosecha", "Fumigación", "Fertilización", "Rastra", "Disco", "Enrollado", "Nivelación", "Limpieza", "Otro"
  ];
  
  const bulldozerWorkTypes = [
    "Topado", "Rolado", "Escardificado", "Movimiento de tierra"
  ];
  
  const truckWorkTypes = [
    "Traslado de animales", "Traslado de rollos", "Traslado de cargas", "Traslado de áridos", "Traslado de fardos"
  ];
  
  const vehicleWorkTypes = [
    "Supervisión", "Logística", "Transporte de personal"
  ];
  
  // Estado para los tipos de trabajo disponibles
  const [availableWorkTypes, setAvailableWorkTypes] = useState(defaultWorkTypes);

  // Inicializar formulario
  const workForm = useForm<MachineWorkFormValues>({
    resolver: zodResolver(machineWorkFormSchema),
    defaultValues: {
      machineId: machineId,
      pastureId: null,
      workType: "",
      description: "",
      startDate: new Date(),
      endDate: null,
      areaWorked: "",
      distance: "",
      workTime: "",
      fuelUsed: "",
      costPerUnit: "",
      unitType: machine?.type === "vehiculo" || machine?.type === "camion" ? "km" : "ha",
      operationalCost: "",
      suppliesCost: "",
      totalCost: "",
      revenueAmount: "",
      weatherCondition: "",
      temperature: "",
      soilHumidity: "",
      seedType: "",
      kgPerHa: "",
      agrochemicalType: "",
      litersPerHa: "",
      fertilizerType: "",
      amountPerHa: "",
      threadRolls: "",
      rollsPerHa: "",
      observations: "",
    },
  });

  // Calcular el costo total y el monto de ingreso
  useEffect(() => {
    const calculateTotal = () => {
      // Cálculo tradicional: costo operativo + costo de suministros
      const operational = parseFloat(workForm.watch("operationalCost") || "0");
      const supplies = parseFloat(workForm.watch("suppliesCost") || "0");
      const totalExpenses = operational + supplies;
      
      if (!isNaN(totalExpenses)) {
        workForm.setValue("totalCost", totalExpenses.toString());
      }
      
      // Cálculo del ingreso basado en costo por unidad (hectárea o kilómetro)
      const costPerUnit = parseFloat(workForm.watch("costPerUnit") || "0");
      let unitValue = 0;
      
      // Determinamos qué valor usar según el tipo de unidad
      const unitType = workForm.watch("unitType");
      if (unitType === "km") {
        unitValue = parseFloat(workForm.watch("distance") || "0");
      } else { // "ha" por defecto
        unitValue = parseFloat(workForm.watch("areaWorked") || "0");
      }
      
      // Calculamos el ingreso como costo por unidad * cantidad de unidades
      const revenue = costPerUnit * unitValue;
      
      if (!isNaN(revenue) && revenue > 0) {
        workForm.setValue("revenueAmount", revenue.toString());
      } else {
        workForm.setValue("revenueAmount", "");
      }
    };
    
    calculateTotal();
  }, [
    workForm.watch("operationalCost"), 
    workForm.watch("suppliesCost"),
    workForm.watch("costPerUnit"),
    workForm.watch("areaWorked"),
    workForm.watch("distance"),
    workForm.watch("unitType")
  ]);

  // Función para agregar un nuevo registro de trabajo
  async function handleWorkSubmit(values: MachineWorkFormValues) {
    try {
      // Registrar el trabajo agrícola
      const newWork = await apiRequest("POST", "/api/pasture-works", values);
      
      // Actualizar datos de trabajos
      queryClient.invalidateQueries({ queryKey: ["/api/pasture-works"] });
      
      // Si hay un valor de revenueAmount, registrar como ingreso financiero para la máquina
      if (values.revenueAmount && parseFloat(values.revenueAmount) > 0) {
        // Obtener el nombre de la parcela si existe
        let pastureDetails = "No especificada";
        if (values.pastureId) {
          // Si hay una parcela asociada, buscar su nombre
          const pasture = pastures?.find((p: any) => p.id === values.pastureId);
          if (pasture) {
            pastureDetails = pasture.name;
          }
        }
        
        // Determinar qué unidad se está usando
        const unitLabel = values.unitType === 'km' ? 'kilómetros' : 'hectáreas';
        const unitValue = values.unitType === 'km' ? values.distance : values.areaWorked;
        const costPerUnit = values.costPerUnit;
        
        // Crear un registro financiero de ingreso con información detallada
        await apiRequest("POST", "/api/machine-finances", {
          machineId: machineId,
          date: values.startDate,
          type: "income", // Tipo ingreso
          concept: `Trabajo agrícola: ${values.workType} ${pastureDetails ? 'en ' + pastureDetails : ''} (${unitValue} ${unitLabel} a $${costPerUnit}/${values.unitType})`,
          amount: values.revenueAmount
        });
        
        // Invalidar consulta de finanzas para esta máquina
        queryClient.invalidateQueries({ queryKey: [`/api/machine-finances?machineId=${machineId}`] });
        
        toast({
          title: "Trabajo e ingreso registrados",
          description: `El trabajo agrícola ha sido registrado exitosamente con un ingreso de $${parseFloat(values.revenueAmount).toLocaleString('es-AR')}`,
        });
      } else {
        toast({
          title: "Trabajo registrado",
          description: "El trabajo agrícola ha sido registrado exitosamente",
        });
      }
      
      setWorkSheetOpen(false);
      workForm.reset({
        machineId: machineId,
        pastureId: null,
        workType: "",
        description: "",
        startDate: new Date(),
        endDate: null,
        areaWorked: "",
        distance: "",
        workTime: "",
        fuelUsed: "",
        costPerUnit: "",
        unitType: machine?.type === "vehiculo" || machine?.type === "camion" ? "km" : "ha",
        operationalCost: "",
        suppliesCost: "",
        totalCost: "",
        revenueAmount: "",
        weatherCondition: "",
        temperature: "",
        soilHumidity: "",
        seedType: "",
        kgPerHa: "",
        agrochemicalType: "",
        litersPerHa: "",
        fertilizerType: "",
        amountPerHa: "",
        threadRolls: "",
        rollsPerHa: "",
        observations: "",
      });
      
    } catch (error) {
      console.error("Error al registrar trabajo:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el trabajo agrícola",
        variant: "destructive",
      });
    }
  }

  // Función para eliminar un trabajo
  async function handleDeleteWork(id: number) {
    try {
      await apiRequest("DELETE", `/api/pasture-works/${id}`);
      
      // Actualizar datos
      queryClient.invalidateQueries({ queryKey: ["/api/pasture-works"] });
      
      toast({
        title: "Trabajo eliminado",
        description: "El trabajo agrícola ha sido eliminado exitosamente",
      });
      
      setConfirmDialogOpen(false);
      setWorkToDelete(null);
      
    } catch (error) {
      console.error("Error al eliminar trabajo:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el trabajo agrícola",
        variant: "destructive",
      });
    }
  }

  // Función para manejar el cambio de tipo de maquinaria
  const handleMachineTypeChange = (type: string) => {
    setSelectedMachineType(type);
    
    // Actualizamos el tipo de trabajo disponible según el tipo de máquina
    switch (type) {
      case "topadora":
        setAvailableWorkTypes(bulldozerWorkTypes);
        break;
      case "camion":
        setAvailableWorkTypes(truckWorkTypes);
        // Para camiones no se selecciona parcela
        workForm.setValue("pastureId", null);
        break;
      case "vehiculo":
        setAvailableWorkTypes(vehicleWorkTypes);
        // Para vehículos no se selecciona parcela
        workForm.setValue("pastureId", null);
        break;
      case "tractor":
      default:
        setAvailableWorkTypes(defaultWorkTypes);
    }
    
    // Resetear el tipo de trabajo
    workForm.setValue("workType", "");
  };

  // Función para abrir detalles de un trabajo
  function handleOpenDetails(work: any) {
    setSelectedWork(work);
    setDetailsDialogOpen(true);
  }

  // Función para obtener el nombre de una parcela
  const getPastureName = (pastureId: number) => {
    if (!pastures || !Array.isArray(pastures)) return "Desconocida";
    const pasture = pastures.find((p: any) => p.id === pastureId);
    return pasture ? pasture.name : "Desconocida";
  };

  if (isLoadingMachine || isLoadingWorks) {
    return <div className="py-10 text-center">Cargando información...</div>;
  }

  if (!machine) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">No se encontró la máquina</div>
        <Button variant="outline" asChild>
          <Link href="/machines">Volver a Máquinas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center text-neutral-600">
            <i className={`ri-truck-line mr-2 ${machine.type === 'tractor' ? 'text-red-500' : machine.type === 'topadora' ? 'text-green-500' : machine.type === 'camion' ? 'text-blue-500' : 'text-amber-500'}`}></i>
            Trabajos de {machine.brand} {machine.model}
          </h1>
          <p className="text-neutral-400 text-sm">
            Registro de trabajos agrícolas realizados con esta unidad
          </p>
        </div>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Button variant="outline" asChild>
            <Link href="/machines">
              <i className="ri-arrow-left-line mr-1"></i> Volver
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/pastures?workForm=true&preSelectMachine=${machineId}`}>
              <i className="ri-add-line mr-1"></i> Registrar Trabajo Agrícola
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Resumen y Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Detalles de la Unidad</CardTitle>
            <CardDescription>
              Información básica de la máquina
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-500">Tipo:</span>
                <Badge variant="outline" className="font-normal">
                  {machine.type === 'tractor' ? 'Tractor' : machine.type === 'topadora' ? 'Topadora' : machine.type === 'camion' ? 'Camión' : 'Vehículo'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-500">Modelo:</span>
                <span className="text-neutral-600">{machine.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-500">Año:</span>
                <span className="text-neutral-600">{machine.year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-500">Horas/Kms:</span>
                <span className="text-neutral-600">{machine.hours}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Estadísticas de Uso</CardTitle>
            <CardDescription>
              Métricas de utilización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-500">Trabajos realizados:</span>
                <span className="text-3xl font-semibold text-blue-600">{machineWorks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-500">Parcelas trabajadas:</span>
                <span className="text-neutral-600">
                  {new Set(machineWorks.map((work: any) => work.pastureId)).size}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-500">Último trabajo:</span>
                <span className="text-neutral-600">
                  {machineWorks.length > 0 
                    ? format(new Date(machineWorks[machineWorks.length - 1].startDate), 'dd/MM/yyyy', { locale: es }) 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rendimiento</CardTitle>
            <CardDescription>
              Eficiencia y costos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-500">Combustible total:</span>
                <span className="text-neutral-600">
                  {machineWorks.reduce((acc: number, work: any) => acc + (parseFloat(work.fuelUsed) || 0), 0)} Lt
                </span>
              </div>
              {/* Mostrar área trabajada para tractores y topadoras */}
              {(machine.type === 'tractor' || machine.type === 'topadora') && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-500">Área trabajada:</span>
                  <span className="text-neutral-600">
                    {machineWorks.reduce((acc: number, work: any) => acc + (parseFloat(work.areaWorked) || 0), 0)} Ha
                  </span>
                </div>
              )}
              {/* Mostrar distancia recorrida para camiones y vehículos */}
              {(machine.type === 'camion' || machine.type === 'vehiculo') && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-500">Distancia total:</span>
                  <span className="text-neutral-600">
                    {machineWorks.reduce((acc: number, work: any) => acc + (parseFloat(work.distance) || 0), 0)} Km
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-500">Costo operativo:</span>
                <span className="text-neutral-600">
                  ${machineWorks.reduce((acc: number, work: any) => acc + (parseFloat(work.operationalCost) || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabla de Trabajos */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Trabajos</CardTitle>
          <CardDescription>
            Listado de trabajos agrícolas realizados con esta máquina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>{machine.type === 'tractor' || machine.type === 'topadora' ? 'Área' : 'Distancia'}</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machineWorks.length > 0 ? (
                  machineWorks.map((work: any) => (
                    <TableRow 
                      key={work.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOpenDetails(work)}
                    >
                      <TableCell className="font-medium">{work.workType}</TableCell>
                      <TableCell>{format(new Date(work.startDate), 'dd/MM/yyyy', { locale: es })}</TableCell>
                      <TableCell>{getPastureName(work.pastureId)}</TableCell>
                      <TableCell>
                        {machine.type === 'tractor' || machine.type === 'topadora' 
                          ? (work.areaWorked ? `${work.areaWorked} Ha` : '-')
                          : (work.distance ? `${work.distance} Km` : '-')}
                      </TableCell>
                      <TableCell>
                        {work.totalCost ? `$${parseFloat(work.totalCost).toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Eliminar"
                            onClick={() => {
                              setWorkToDelete(work.id);
                              setConfirmDialogOpen(true);
                            }}
                          >
                            <i className="ri-delete-bin-line text-red-500"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-neutral-400">
                      No hay trabajos registrados para esta máquina
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Formulario de Trabajo */}
      <Sheet open={workSheetOpen} onOpenChange={setWorkSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto h-full max-h-screen pb-24">
          <SheetHeader>
            <SheetTitle>Registrar Trabajo Agrícola</SheetTitle>
            <SheetDescription>
              Complete el formulario para registrar un nuevo trabajo con esta máquina
            </SheetDescription>
          </SheetHeader>
          
          <Form {...workForm}>
            <form onSubmit={workForm.handleSubmit(handleWorkSubmit)} className="space-y-4 py-4">
              {/* Tipo de maquinaria - solo UI no es campo de formulario */}
              <div className="space-y-2">
                <Label>Tipo de Maquinaria</Label>
                <Select 
                  onValueChange={(value) => handleMachineTypeChange(value)}
                  value={selectedMachineType || machine.type || ""}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de maquinaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tractor">Tractor</SelectItem>
                    <SelectItem value="topadora">Topadora</SelectItem>
                    <SelectItem value="camion">Camión</SelectItem>
                    <SelectItem value="vehiculo">Vehículo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Tipo de maquinaria predefinido según la unidad seleccionada
                </p>
              </div>
              
              <FormField
                control={workForm.control}
                name="machineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máquina a utilizar</FormLabel>
                    <FormControl>
                      <Input value={`${machine.brand} ${machine.model}`} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Campo de parcela solo para tractores y topadoras */}
              {(machine.type === 'tractor' || machine.type === 'topadora') && (
                <FormField
                  control={workForm.control}
                  name="pastureId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcela</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "0" ? null : parseInt(value))} 
                        value={field.value?.toString() || "0"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una parcela">
                              {field.value ? getPastureName(field.value) : "Seleccione una parcela"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Ninguna</SelectItem>
                          {pastures && Array.isArray(pastures) ? pastures.map((pasture: any) => (
                            <SelectItem key={pasture.id} value={pasture.id.toString()}>
                              {pasture.name}
                            </SelectItem>
                          )) : null}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={workForm.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de trabajo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo de trabajo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableWorkTypes.map((workType) => (
                          <SelectItem key={workType} value={workType}>
                            {workType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={workForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa el trabajo realizado" 
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={workForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de inicio</FormLabel>
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
                  control={workForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de finalización</FormLabel>
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
              
              <div className="grid grid-cols-2 gap-4">
                {/* Mostrar el campo de área trabajada solo para tractores y topadoras */}
                {(machine.type === 'tractor' || machine.type === 'topadora') && (
                  <FormField
                    control={workForm.control}
                    name="areaWorked"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Superficie trabajada (Ha)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            step="0.01" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Mostrar el campo de distancia solo para camiones y vehículos */}
                {(machine.type === 'camion' || machine.type === 'vehiculo') && (
                  <FormField
                    control={workForm.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distancia recorrida (Km)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            step="0.1" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={workForm.control}
                  name="workTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiempo de trabajo (Hs)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
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
              
              <FormField
                control={workForm.control}
                name="fuelUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Combustible utilizado (Lt)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        step="1" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h3 className="text-sm font-medium text-neutral-500 pt-2">Costos</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={workForm.control}
                  name="operationalCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo operativo ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          step="1" 
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
                      <FormLabel>Costo de insumos ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          step="1" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={workForm.control}
                name="totalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo total ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        disabled 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Suma de costos operativos y de insumos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h3 className="text-sm font-medium text-neutral-500 pt-4 mt-2 border-t border-neutral-200">Facturación del Trabajo</h3>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={workForm.control}
                  name="costPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo por {workForm.watch("unitType") === "km" ? "kilómetro" : "hectárea"} ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
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
                  name="unitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de unidad</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Resetear el valor automáticamente cuando cambia la unidad
                          workForm.setValue("revenueAmount", "");
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo de unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ha">Hectárea (ha)</SelectItem>
                          <SelectItem value="km">Kilómetro (km)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={workForm.control}
                name="revenueAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingreso total a cobrar ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        disabled 
                        {...field}
                        value={field.value || ""}
                        className="font-medium bg-amber-50 border-amber-200"
                      />
                    </FormControl>
                    <FormDescription>
                      Monto que se registrará como ingreso en el balance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h3 className="text-sm font-medium text-neutral-500 pt-2">Condiciones</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={workForm.control}
                  name="weatherCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clima</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Clima" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="soleado">Soleado</SelectItem>
                          <SelectItem value="nublado">Nublado</SelectItem>
                          <SelectItem value="lluvioso">Lluvioso</SelectItem>
                          <SelectItem value="ventoso">Ventoso</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={workForm.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura (°C)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20" 
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
                      <FormLabel>Humedad (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Campos condicionales según el tipo de trabajo */}
              {workForm.watch("workType") === "Siembra" && (
                <>
                  <h3 className="text-sm font-medium text-neutral-500 pt-2">Datos de Siembra</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="seedType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de semilla</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Trigo/Maíz/etc." 
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
                      name="kgPerHa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kg/Ha</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              step="0.1" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
              {workForm.watch("workType") === "Cosecha" && (
                <>
                  <h3 className="text-sm font-medium text-neutral-500 pt-2">Datos de Cosecha</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="seedType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de cultivo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Trigo/Maíz/etc." 
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
                      name="kgPerHa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rendimiento (Kg/Ha)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              step="1" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
              {workForm.watch("workType") === "Fumigación" && (
                <>
                  <h3 className="text-sm font-medium text-neutral-500 pt-2">Datos de Fumigación</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="agrochemicalType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de agroquímico</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Herbicida/Insecticida/etc." 
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
                      name="litersPerHa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Litros/Ha</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              step="0.1" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
              {workForm.watch("workType") === "Fertilización" && (
                <>
                  <h3 className="text-sm font-medium text-neutral-500 pt-2">Datos de Fertilización</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="fertilizerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de fertilizante</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Urea/Fosfato/etc." 
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
                      name="amountPerHa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kg/Ha</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              step="0.1" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
              {workForm.watch("workType") === "Enrollado" && (
                <>
                  <h3 className="text-sm font-medium text-neutral-500 pt-2">Datos de Enrollado</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="threadRolls"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rollos de hilo utilizados</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              step="1" 
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
                      name="rollsPerHa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rollos/Ha</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              step="0.1" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
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
      
      {/* Diálogo de detalles del trabajo */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalles del Trabajo</DialogTitle>
            <DialogDescription>
              Información detallada del trabajo agrícola
            </DialogDescription>
          </DialogHeader>
          
          {selectedWork && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Información General</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div>
                      <span className="font-semibold">Tipo de trabajo:</span> {selectedWork.workType}
                    </div>
                    <div>
                      <span className="font-semibold">Parcela:</span> {getPastureName(selectedWork.pastureId)}
                    </div>
                    <div>
                      <span className="font-semibold">Fecha:</span> {format(new Date(selectedWork.startDate), 'dd/MM/yyyy', { locale: es })}
                    </div>
                    {selectedWork.endDate && (
                      <div>
                        <span className="font-semibold">Finalizado:</span> {format(new Date(selectedWork.endDate), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Descripción:</span> {selectedWork.description || 'Sin descripción'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Métricas y Costos</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    {/* Área trabajada solo para tractores y topadoras */}
                    {(machine.type === 'tractor' || machine.type === 'topadora') && (
                      <div>
                        <span className="font-semibold">Área trabajada:</span> {selectedWork.areaWorked ? `${selectedWork.areaWorked} Ha` : 'No especificada'}
                      </div>
                    )}
                    {/* Distancia recorrida solo para camiones y vehículos */}
                    {(machine.type === 'camion' || machine.type === 'vehiculo') && (
                      <div>
                        <span className="font-semibold">Distancia recorrida:</span> {selectedWork.distance ? `${selectedWork.distance} Km` : 'No especificada'}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Tiempo:</span> {selectedWork.workTime ? `${selectedWork.workTime} Hs` : 'No especificado'}
                    </div>
                    <div>
                      <span className="font-semibold">Combustible:</span> {selectedWork.fuelUsed ? `${selectedWork.fuelUsed} Lt` : 'No especificado'}
                    </div>
                    <div>
                      <span className="font-semibold">Costo total:</span> {selectedWork.totalCost ? `$${parseFloat(selectedWork.totalCost).toLocaleString()}` : 'No especificado'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detalles específicos según tipo de trabajo */}
              {selectedWork.workType === "Siembra" && selectedWork.seedType && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Detalles de Siembra</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div>
                      <span className="font-semibold">Tipo de semilla:</span> {selectedWork.seedType}
                    </div>
                    {selectedWork.kgPerHa && (
                      <div>
                        <span className="font-semibold">Kg/Ha:</span> {selectedWork.kgPerHa}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedWork.workType === "Cosecha" && selectedWork.seedType && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Detalles de Cosecha</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div>
                      <span className="font-semibold">Tipo de cultivo:</span> {selectedWork.seedType}
                    </div>
                    {selectedWork.kgPerHa && (
                      <div>
                        <span className="font-semibold">Rendimiento:</span> {selectedWork.kgPerHa} Kg/Ha
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedWork.workType === "Fumigación" && selectedWork.agrochemicalType && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Detalles de Fumigación</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div>
                      <span className="font-semibold">Agroquímico:</span> {selectedWork.agrochemicalType}
                    </div>
                    {selectedWork.litersPerHa && (
                      <div>
                        <span className="font-semibold">Litros/Ha:</span> {selectedWork.litersPerHa}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedWork.workType === "Fertilización" && selectedWork.fertilizerType && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Detalles de Fertilización</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div>
                      <span className="font-semibold">Fertilizante:</span> {selectedWork.fertilizerType}
                    </div>
                    {selectedWork.amountPerHa && (
                      <div>
                        <span className="font-semibold">Kg/Ha:</span> {selectedWork.amountPerHa}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedWork.workType === "Enrollado" && selectedWork.threadRolls && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Detalles de Enrollado</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div>
                      <span className="font-semibold">Rollos de hilo:</span> {selectedWork.threadRolls}
                    </div>
                    {selectedWork.rollsPerHa && (
                      <div>
                        <span className="font-semibold">Rollos/Ha:</span> {selectedWork.rollsPerHa}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Condiciones climáticas */}
              {(selectedWork.weatherCondition || selectedWork.temperature || selectedWork.soilHumidity) && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Condiciones durante el trabajo</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    {selectedWork.weatherCondition && (
                      <div>
                        <span className="font-semibold">Clima:</span> {
                          selectedWork.weatherCondition === 'soleado' ? 'Soleado' :
                          selectedWork.weatherCondition === 'nublado' ? 'Nublado' :
                          selectedWork.weatherCondition === 'lluvioso' ? 'Lluvioso' : 
                          selectedWork.weatherCondition === 'ventoso' ? 'Ventoso' : 
                          selectedWork.weatherCondition
                        }
                      </div>
                    )}
                    {selectedWork.temperature && (
                      <div>
                        <span className="font-semibold">Temperatura:</span> {selectedWork.temperature} °C
                      </div>
                    )}
                    {selectedWork.soilHumidity && (
                      <div>
                        <span className="font-semibold">Humedad:</span> {selectedWork.soilHumidity} %
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Observaciones */}
              {selectedWork.observations && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Observaciones</h3>
                  <div className="bg-muted rounded-lg p-4">
                    <p>{selectedWork.observations}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)} variant="outline">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmación de eliminación */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el registro de trabajo seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => workToDelete && handleDeleteWork(workToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}