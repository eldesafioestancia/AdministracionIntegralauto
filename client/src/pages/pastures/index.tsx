import React, { useState, useEffect } from 'react';
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
import { ImageUpload } from "@/components/ui/image-upload";
import { uploadFile } from "@/lib/fileUpload";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  photo: z.string().optional(),
});

// Esquema para el formulario de trabajos agrícolas
const pastureWorkFormSchema = z.object({
  pastureId: z.number({
    required_error: "Debe seleccionar una parcela",
  }),
  machineType: z.string().optional().nullable(),
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
  distance: z.string().optional().nullable(),
  workingHours: z.string().optional().nullable(),
  fuelUsed: z.string().optional().nullable(),
  operativeCost: z.string().optional().nullable(),
  suppliesCost: z.string().optional().nullable(),
  costPerUnit: z.string().optional().nullable(),
  totalCost: z.string().optional().nullable(),
  weatherConditions: z.string().optional().nullable(),
  temperature: z.string().optional().nullable(),
  soilHumidity: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  
  // Campos específicos para diferentes tipos de trabajo
  seedType: z.string().optional().nullable(),
  seedQuantity: z.string().optional().nullable(),
  harvestQuantity: z.string().optional().nullable(),
  chemicalType: z.string().optional().nullable(),
  chemicalQuantity: z.string().optional().nullable(),
  fertilizerType: z.string().optional().nullable(),
  fertilizerQuantity: z.string().optional().nullable(),
  baleCount: z.string().optional().nullable(),
  threadRollsUsed: z.string().optional().nullable(),
});

type PastureFormValues = z.infer<typeof pastureFormSchema>;
type PastureWorkFormValues = z.infer<typeof pastureWorkFormSchema>;

// Funciones auxiliares para la visualización de etiquetas
const getSoilTypeLabel = (soilType: string): string => {
  const soilTypeMap: Record<string, string> = {
    'arcilloso': 'Arcilloso',
    'arenoso': 'Arenoso',
    'franco': 'Franco',
    'limoso': 'Limoso',
    'humifero': 'Humífero',
    'calizo': 'Calizo',
    'otro': 'Otro'
  };
  return soilTypeMap[soilType] || soilType;
};

const getWaterLabel = (waterSource: string): string => {
  const waterMap: Record<string, string> = {
    'pozo': 'Pozo',
    'laguna': 'Laguna natural',
    'rio': 'Río/arroyo',
    'tajamar': 'Tajamar',
    'otro': 'Otro',
    'ninguno': 'Sin fuente de agua'
  };
  return waterMap[waterSource] || waterSource;
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'activo': 'Activo',
    'barbecho': 'En barbecho',
    'descanso': 'En descanso',
    'arrendado': 'Arrendado',
    'inactivo': 'Inactivo'
  };
  return statusMap[status] || status;
};

// Tipos de trabajo por defecto (tractores)
const defaultWorkTypes = [
  { value: "siembra", label: "Siembra" },
  { value: "cosecha", label: "Cosecha" },
  { value: "fumigacion", label: "Fumigación" },
  { value: "fertilizacion", label: "Fertilización" },
  { value: "rastra", label: "Rastra" },
  { value: "arado", label: "Arado" },
  { value: "cincel", label: "Cincel" },
  { value: "corte", label: "Corte" },
  { value: "rastrillado", label: "Rastrillado" },
  { value: "enrollado", label: "Enrollado" }
];

// Tipos de trabajo para topadoras
const bulldozerWorkTypes = [
  { value: "topado", label: "Topado" },
  { value: "rolado", label: "Rolado" },
  { value: "escardificado", label: "Escardificado" },
  { value: "movimiento_tierra", label: "Movimiento de tierra" }
];

// Tipos de trabajo para otros tipos de máquinas
const truckWorkTypes = [
  { value: "traslado_animales", label: "Traslado de animales" },
  { value: "traslado_rollos", label: "Traslado de rollos" },
  { value: "traslado_cargas", label: "Traslado de cargas" },
  { value: "traslado_aridos", label: "Traslado de áridos" },
  { value: "traslado_fardos", label: "Traslado de fardos" }
];

const vehicleWorkTypes = [
  { value: "supervision", label: "Supervisión" },
  { value: "logistica", label: "Logística" },
  { value: "transporte_personal", label: "Transporte de personal" }
];

const accessoryWorkTypes = [
  { value: "implemento", label: "Implemento de tractor" },
  { value: "complemento", label: "Complemento de trabajo" }
];

export default function PasturesIndex() {
  // Comprobar si hay parámetros en la URL para abrir formulario de trabajo
  const queryParams = new URLSearchParams(window.location.search);
  const shouldOpenWorkForm = queryParams.get('workForm') === 'true';
  const preSelectedMachineId = queryParams.get('preSelectMachine') 
    ? parseInt(queryParams.get('preSelectMachine') || '0') 
    : null;
  
  const [sheetOpen, setSheetOpen] = useState(false);
  const [workSheetOpen, setWorkSheetOpen] = useState(shouldOpenWorkForm);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPastureId, setSelectedPastureId] = useState<number | null>(null);
  const [selectedPasture, setSelectedPasture] = useState<any>(null);
  const [selectedPastures, setSelectedPastures] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("parcels");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [workPhotoFile, setWorkPhotoFile] = useState<File | null>(null);
  const [workPhotoPreview, setWorkPhotoPreview] = useState<string>("");
  const [selectedMachineType, setSelectedMachineType] = useState<string | null>(null);
  const [filteredMachines, setFilteredMachines] = useState<any[]>([]);
  const [availableWorkTypes, setAvailableWorkTypes] = useState(defaultWorkTypes);
  const [showDistanceField, setShowDistanceField] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Consultar las pasturas
  const { data: pastures, isLoading } = useQuery({
    queryKey: ["/api/pastures"],
  });
  
  // Consultar las máquinas para el formulario de trabajos
  const { data: machines } = useQuery({
    queryKey: ["/api/machines"]
  });
  
  // Efecto para inicializar las máquinas filtradas
  useEffect(() => {
    if (machines && Array.isArray(machines)) {
      setFilteredMachines(machines);
      
      // Si hay una máquina preseleccionada, configurar automáticamente
      if (preSelectedMachineId) {
        const selectedMachine = machines.find(m => m.id === preSelectedMachineId);
        if (selectedMachine) {
          // Establecer el tipo de maquinaria
          setSelectedMachineType(selectedMachine.type);
          
          // Establecer los tipos de trabajo disponibles según el tipo de máquina
          switch (selectedMachine.type) {
            case "topadora":
              setAvailableWorkTypes(bulldozerWorkTypes);
              break;
            case "camion":
              setAvailableWorkTypes(truckWorkTypes);
              break;
            case "vehiculo":
              setAvailableWorkTypes(vehicleWorkTypes);
              break;
            case "tractor":
            default:
              setAvailableWorkTypes(defaultWorkTypes);
          }
          
          // Después de filtrar por tipo, establecer el ID de la máquina
          setTimeout(() => {
            workForm.setValue("machineId", preSelectedMachineId);
          }, 0);
        }
      }
    }
  }, [machines, preSelectedMachineId]);
  
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
      costPerUnit: null,
      totalCost: null,
      weatherConditions: null,
      temperature: null,
      soilHumidity: null,
      observations: null,
      photo: null,
      seedType: null,
      seedQuantity: null,
      harvestQuantity: null,
      chemicalType: null,
      chemicalQuantity: null,
      fertilizerType: null,
      fertilizerQuantity: null,
      baleCount: null,
      threadRollsUsed: null,
    },
  });
  
  // Observador para detectar cambios en el tipo de trabajo
  const selectedWorkType = workForm.watch("workType");

  // Tipos de suelo
  const soilTypes = [
    { value: "arcilloso", label: "Arcilloso" },
    { value: "arenoso", label: "Arenoso" },
    { value: "limoso", label: "Limoso" },
    { value: "franco", label: "Franco" },
    { value: "humifero", label: "Humífero" },
  ];
  
  // Tipos de maquinaria
  const machineTypes = [
    { value: "tractor", label: "Tractor" },
    { value: "topadora", label: "Topadora" },
    { value: "camion", label: "Camión" },
    { value: "vehiculo", label: "Vehículo" },
    { value: "accesorio", label: "Accesorio" }
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
  
  const handleWorkPhotoChange = (file: File | null) => {
    setWorkPhotoFile(file);
    
    // Generar vista previa si hay un archivo
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWorkPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setWorkPhotoPreview("");
    }
  };
  
  // Función para manejar el cambio de tipo de maquinaria
  const handleMachineTypeChange = (type: string) => {
    setSelectedMachineType(type);
    
    // Resetear la máquina seleccionada
    workForm.setValue("machineId", null);
    
    // Resetear el tipo de trabajo seleccionado
    workForm.setValue("workType", "");
    
    // Resetear campos específicos
    workForm.setValue("areaWorked", "");
    workForm.setValue("distance", "");
    
    // Filtrar máquinas por el tipo seleccionado
    if (machines && Array.isArray(machines) && machines.length > 0) {
      const filtered = machines.filter((machine: {type: string}) => machine.type === type);
      setFilteredMachines(filtered);
    }
    
    // Actualizar los tipos de trabajo disponibles según el tipo de máquina
    switch (type) {
      case "topadora":
        setAvailableWorkTypes(bulldozerWorkTypes);
        setShowDistanceField(false);
        break;
      case "camion":
        setAvailableWorkTypes(truckWorkTypes);
        setShowDistanceField(true);
        // Para camiones no se selecciona parcela
        workForm.setValue("pastureId", 0); // Usar 0 como valor predeterminado en lugar de null
        break;
      case "vehiculo":
        setAvailableWorkTypes(vehicleWorkTypes);
        setShowDistanceField(true);
        // Para vehículos no se selecciona parcela
        workForm.setValue("pastureId", 0); // Usar 0 como valor predeterminado en lugar de null
        break;
      case "accesorio":
        setAvailableWorkTypes(accessoryWorkTypes);
        setShowDistanceField(false);
        break;
      case "tractor":
      default:
        setAvailableWorkTypes(defaultWorkTypes);
        setShowDistanceField(false);
    }
  };

  async function onSubmit(values: PastureFormValues) {
    try {
      setIsSubmitting(true);
      
      // Upload photo if available
      if (photoFile) {
        try {
          const photoPath = await uploadFile(photoFile, "pastures");
          values.photo = photoPath;
        } catch (uploadError) {
          console.error("Error uploading photo:", uploadError);
          toast({
            title: "Error en la carga de imagen",
            description: "No se pudo cargar la foto, pero se continuará con el proceso",
            variant: "destructive",
          });
        }
      }
      
      // Determinar si es creación o actualización
      if (editingId) {
        // Actualización - PUT request
        await apiRequest("PUT", `/api/pastures/${editingId}`, values);
        
        toast({
          title: "Parcela actualizada",
          description: "La parcela ha sido actualizada exitosamente",
        });
      } else {
        // Creación - POST request
        await apiRequest("POST", "/api/pastures", values);
        
        toast({
          title: "Parcela creada",
          description: "La parcela ha sido creada exitosamente",
        });
      }

      // Invalidar consulta de pasturas
      queryClient.invalidateQueries({ queryKey: ["/api/pastures"] });
      
      // Limpiar el formulario y estados
      setSheetOpen(false);
      setPhotoFile(null);
      setPhotoPreview("");
      setEditingId(null);
      form.reset();
      
    } catch (error) {
      console.error("Error with pasture operation:", error);
      toast({
        title: "Error",
        description: editingId 
          ? "No se pudo actualizar la parcela" 
          : "No se pudo crear la parcela",
        variant: "destructive",
      });
    }
  }

  // Función para editar una parcela
  function handleEditPasture(id: number) {
    if (!pastures || !Array.isArray(pastures)) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las parcelas",
        variant: "destructive",
      });
      return;
    }
    
    // Buscar la parcela por ID
    const pasture = pastures.find((p) => p.id === id);
    if (!pasture) {
      toast({
        title: "Error",
        description: "No se encontró la parcela",
        variant: "destructive",
      });
      return;
    }
    
    // Guardar el ID de la parcela que estamos editando
    setEditingId(id);
    
    // Establecer los valores en el formulario
    form.reset({
      ...pasture,
      // Convertir fechas si existen
      acquisitionDate: pasture.acquisitionDate ? new Date(pasture.acquisitionDate) : undefined,
    });
    
    // Establecer la vista previa de la foto si existe
    if (pasture.photo) {
      setPhotoPreview(pasture.photo);
    } else {
      setPhotoPreview("");
    }
    
    // Abrir el sheet para editar
    setSheetOpen(true);
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
    
    // Resetear los campos de maquinaria
    setSelectedMachineType(null);
    setFilteredMachines(machines && Array.isArray(machines) ? machines : []);
    workForm.setValue("machineId", null);
    
    // Resetear también el tipo de trabajo y asegurar que se muestren los tipos por defecto
    setAvailableWorkTypes(defaultWorkTypes);
    workForm.setValue("workType", "");
    
    // Resetear la visibilidad de campos específicos
    setShowDistanceField(false);
    
    setWorkSheetOpen(true);
  }
  
  // Función para manejar el envío del formulario de trabajo agrícola
  async function handleWorkSubmit(values: PastureWorkFormValues) {
    try {
      // Subir foto si está disponible
      if (workPhotoFile) {
        try {
          const photoPath = await uploadFile(workPhotoFile, "pasture-works");
          values.photo = photoPath;
        } catch (uploadError) {
          console.error("Error uploading photo:", uploadError);
          toast({
            title: "Error en la carga de imagen",
            description: "No se pudo cargar la foto, pero se continuará con el registro del trabajo",
            variant: "destructive",
          });
        }
      }
      
      // Si no hay un costo total ya calculado, lo calculamos basado en los costos operativos y de insumos
      if (!values.totalCost) {
        if (values.operativeCost && values.suppliesCost) {
          const operativeCost = parseFloat(values.operativeCost);
          const suppliesCost = parseFloat(values.suppliesCost);
          
          if (!isNaN(operativeCost) && !isNaN(suppliesCost)) {
            values.totalCost = (operativeCost + suppliesCost).toString();
          }
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
      setWorkPhotoFile(null);
      setWorkPhotoPreview("");
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
  
  // Función para manejar la selección de pasturas (checkbox)
  const handleSelectPasture = (id: number, e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (selectedPastures.includes(id)) {
      setSelectedPastures(selectedPastures.filter(pastureId => pastureId !== id));
    } else {
      setSelectedPastures([...selectedPastures, id]);
    }
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
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          {/* Botón para eliminar seleccionados - solo se muestra si hay elementos seleccionados */}
          {selectedPastures.length > 0 && (
            <Button 
              variant="destructive"
              onClick={async () => {
                if (confirm(`¿Está seguro de eliminar ${selectedPastures.length} parcelas seleccionadas?`)) {
                  try {
                    // Eliminar cada pastura seleccionada
                    for (const pastureId of selectedPastures) {
                      await apiRequest("DELETE", `/api/pastures/${pastureId}`);
                    }
                    
                    // Actualizar la lista de pasturas
                    queryClient.invalidateQueries({ queryKey: ["/api/pastures"] });
                    
                    // Limpiar selección
                    setSelectedPastures([]);
                    
                    toast({
                      title: "Parcelas eliminadas",
                      description: `Se han eliminado ${selectedPastures.length} parcelas correctamente`,
                    });
                  } catch (error) {
                    console.error("Error al eliminar parcelas:", error);
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "No se pudieron eliminar todas las parcelas",
                    });
                  }
                }
              }}
            >
              <i className="ri-delete-bin-line mr-1"></i> 
              Eliminar ({selectedPastures.length})
            </Button>
          )}
          
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
                  
                  {/* Sección de fotografía */}
                  <div className="space-y-2 pt-4">
                    <h3 className="text-lg font-medium">Fotografía</h3>
                    <ImageUpload 
                      onChange={handlePhotoChange} 
                      value={photoPreview}
                      className="w-full max-w-sm mx-auto"
                    />
                  </div>
                  
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
                  <TableHead className="w-10 text-right">
                    <input 
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                      checked={Array.isArray(pastures) && pastures.length > 0 && selectedPastures.length === pastures.length}
                      onChange={(e) => {
                        if (e.target.checked && Array.isArray(pastures)) {
                          // Seleccionar todas las pasturas
                          setSelectedPastures(pastures.map((p: any) => p.id));
                        } else {
                          // Deseleccionar todas
                          setSelectedPastures([]);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pasturesArray.length > 0 ? (
                  pasturesArray.map((pasture: any) => (
                    <TableRow 
                      key={pasture.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedPasture(pasture);
                        setDetailsDialogOpen(true);
                      }}
                    >

                      <TableCell className="font-medium">{pasture.name}</TableCell>
                      <TableCell>{parseFloat(pasture.area).toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">{pasture.location || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{pasture.soilType ? getSoilTypeLabel(pasture.soilType) : '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            pasture.waterSource && 
                            (pasture.waterSource === 'pozo' || 
                             pasture.waterSource === 'laguna' || 
                             pasture.waterSource === 'rio' || 
                             pasture.waterSource === 'tajamar') 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' 
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {pasture.waterSource ? getWaterLabel(pasture.waterSource) : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            pasture.status === 'activo' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
                          }
                        >
                          {getStatusLabel(pasture.status)}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            title="Trabajos Realizados"
                            onClick={() => handleOpenWorkSheet(pasture.id)}
                          >
                            <i className="ri-tools-line text-xl text-blue-500"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-10 w-10"
                            title="Registrar movimiento financiero"
                          >
                            <Link href={`/finances?openForm=true&type=expense&category=pasturas&description=Gasto - Parcela ${pasture.name}`}>
                              <i className="ri-money-dollar-circle-line text-xl text-green-500"></i>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            title="Editar"
                            onClick={() => handleEditPasture(pasture.id)}
                          >
                            <i className="ri-pencil-line text-xl text-amber-500"></i>
                          </Button>
                          <input 
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary ml-2"
                            checked={selectedPastures.includes(pasture.id)}
                            onChange={(e) => {
                              handleSelectPasture(pasture.id, e);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="w-4" onClick={(e) => e.stopPropagation()}>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-neutral-400">
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
              {/* Tipo de maquinaria - no es un campo de formulario real, solo UI */}
              <div className="space-y-2">
                <Label>Tipo de Maquinaria</Label>
                <Select 
                  onValueChange={(value) => handleMachineTypeChange(value)}
                  value={selectedMachineType || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de maquinaria" />
                  </SelectTrigger>
                  <SelectContent>
                    {machineTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Seleccione el tipo de maquinaria a utilizar
                </p>
              </div>
              
              {/* Máquina específica - filtrada por tipo seleccionado */}
              <FormField
                control={workForm.control}
                name="machineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máquina Específica</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "0" ? null : parseInt(value))} 
                      value={field.value?.toString() || "0"}
                      disabled={!selectedMachineType}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedMachineType 
                            ? "Seleccione una máquina" 
                            : "Primero seleccione un tipo de maquinaria"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Ninguna</SelectItem>
                        {filteredMachines && filteredMachines.length > 0 
                          ? filteredMachines.map((machine: any) => (
                            <SelectItem key={machine.id} value={machine.id.toString()}>
                              {machine.brand} {machine.model}
                            </SelectItem>
                          )) 
                          : <SelectItem value="0" disabled>No hay máquinas disponibles</SelectItem>
                        }
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Maquinaria específica a utilizar para el trabajo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                        {availableWorkTypes.map((type: {value: string, label: string}) => (
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
              
              {/* Área trabajada y horas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!showDistanceField ? (
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
                            onChange={(e) => {
                              field.onChange(e);
                              // Actualizar costo total si hay valor de costo por hectárea
                              const area = parseFloat(e.target.value);
                              const costPerUnit = parseFloat(workForm.getValues("costPerUnit")?.toString() || "0");
                              if (!isNaN(area) && !isNaN(costPerUnit) && area > 0 && costPerUnit > 0) {
                                const calculatedTotal = (area * costPerUnit).toFixed(2);
                                workForm.setValue("totalCost", calculatedTotal);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={workForm.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distancia Recorrida (Km)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="75.5"
                            step="0.1"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e);
                              // Actualizar costo total si hay valor de costo por kilómetro
                              const distance = parseFloat(e.target.value);
                              const costPerUnit = parseFloat(workForm.getValues("costPerUnit")?.toString() || "0");
                              if (!isNaN(distance) && !isNaN(costPerUnit) && distance > 0 && costPerUnit > 0) {
                                const calculatedTotal = (distance * costPerUnit).toFixed(2);
                                workForm.setValue("totalCost", calculatedTotal);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
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
              
              {/* Costo por hectárea/kilómetro y costo total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Usando una implementación alternativa para evitar problemas de tipado */}
                <div className="space-y-2">
                  <Label>{showDistanceField ? 'Costo por Kilómetro ($)' : 'Costo por Hectárea ($)'}</Label>
                  <Input
                    type="number"
                    placeholder={showDistanceField ? "500" : "2000"}
                    step="10"
                    value={workForm.watch("costPerUnit") || ""}
                    onChange={(e) => {
                      workForm.setValue("costPerUnit", e.target.value);
                      // Calcular costo total si hay área/distancia
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        const areaOrDistance = showDistanceField 
                          ? parseFloat(workForm.getValues("distance")?.toString() || "0") 
                          : parseFloat(workForm.getValues("areaWorked")?.toString() || "0");
                        if (areaOrDistance > 0) {
                          const calculatedTotal = (value * areaOrDistance).toFixed(2);
                          workForm.setValue("totalCost", calculatedTotal);
                        }
                      }
                    }}
                  />
                  {workForm.formState.errors.costPerUnit && (
                    <p className="text-sm font-medium text-destructive">
                      {workForm.formState.errors.costPerUnit.message}
                    </p>
                  )}
                </div>
                
                {/* Implementación alternativa para evitar problemas de tipado */}
                <div className="space-y-2">
                  <Label>Costo Total ($)</Label>
                  <Input
                    type="number"
                    placeholder="30000"
                    step="100"
                    value={workForm.watch("totalCost") || ""}
                    onChange={(e) => {
                      workForm.setValue("totalCost", e.target.value);
                    }}
                  />
                  {workForm.formState.errors.totalCost && (
                    <p className="text-sm font-medium text-destructive">
                      {workForm.formState.errors.totalCost.message}
                    </p>
                  )}
                </div>
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
              
              {/* Campos específicos basados en el tipo de trabajo */}
              {selectedWorkType === "siembra" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="seedType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Semilla</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Trigo/Cebada/Maíz"
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
                      name="seedQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad (kg/ha)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="120"
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
              
              {selectedWorkType === "cosecha" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="seedType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Semilla</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Trigo/Cebada/Maíz"
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
                      name="harvestQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rendimiento (kg/ha)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="3500"
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
              
              {selectedWorkType === "fumigacion" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="chemicalType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Agroquímico</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Glifosato/2-4D"
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
                      name="chemicalQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad (L/ha)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2.5"
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
              
              {selectedWorkType === "fertilizacion" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="fertilizerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Fertilizante</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Urea/Fosfato"
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
                      name="fertilizerQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad (kg/ha)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="200"
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
              
              {selectedWorkType === "enrollado" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="threadRollsUsed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rollos de Hilo Usados</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2"
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
                      name="baleCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rollos por Hectárea</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="15"
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
              
              {/* Sección de fotografía para el trabajo */}
              <div className="space-y-2 pt-4">
                <h3 className="text-lg font-medium">Fotografía del trabajo</h3>
                <ImageUpload 
                  onChange={handleWorkPhotoChange} 
                  value={workPhotoPreview}
                  className="w-full max-w-sm mx-auto"
                />
              </div>
              
              <SheetFooter className="mt-4">
                <Button type="submit">Registrar Trabajo</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      
      {/* Diálogo de detalles de la parcela */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedPasture?.name || 'Detalle de parcela'}</DialogTitle>
            <DialogDescription>
              Información detallada de la parcela y sus trabajos agrícolas
            </DialogDescription>
          </DialogHeader>
          
          {selectedPasture && (
            <div className="space-y-6">
              {selectedPasture.photo && (
                <div className="max-w-md mx-auto">
                  <img 
                    src={selectedPasture.photo}
                    alt={`Foto de ${selectedPasture.name}`}
                    className="w-full rounded-lg h-56 object-cover"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Datos generales</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div>
                      <span className="font-semibold">Superficie:</span> {parseFloat(selectedPasture.area).toFixed(2)} hectáreas
                    </div>
                    <div>
                      <span className="font-semibold">Ubicación:</span> {selectedPasture.location || 'No especificada'}
                    </div>
                    <div>
                      <span className="font-semibold">Tipo de suelo:</span> {selectedPasture.soilType ? getSoilTypeLabel(selectedPasture.soilType) : 'No especificado'}
                    </div>
                    <div>
                      <span className="font-semibold">Disponibilidad de agua:</span> {selectedPasture.waterSource ? getWaterLabel(selectedPasture.waterSource) : 'No especificada'}
                    </div>
                    <div>
                      <span className="font-semibold">Estado:</span> {getStatusLabel(selectedPasture.status)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Información adicional</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    {selectedPasture.acquisitionDate && (
                      <div>
                        <span className="font-semibold">Fecha de adquisición:</span> {format(new Date(selectedPasture.acquisitionDate), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    )}
                    {selectedPasture.acquisitionValue && (
                      <div>
                        <span className="font-semibold">Valor de adquisición:</span> ${parseFloat(selectedPasture.acquisitionValue).toLocaleString()}
                      </div>
                    )}
                    {selectedPasture.latitude && selectedPasture.longitude && (
                      <div>
                        <span className="font-semibold">Coordenadas:</span> {selectedPasture.latitude}, {selectedPasture.longitude}
                      </div>
                    )}
                    {selectedPasture.description && (
                      <div>
                        <span className="font-semibold">Descripción:</span> {selectedPasture.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Trabajos agrícolas realizados</h3>
                {pastureWorks && Array.isArray(pastureWorks) && pastureWorks.filter((work: any) => work.pastureId === selectedPasture.id).length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Fecha inicio</TableHead>
                          <TableHead>Máquina</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Foto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pastureWorks
                          .filter((work: any) => work.pastureId === selectedPasture.id)
                          .map((work: any) => {
                            // Encontrar los datos de la máquina usada
                            const machine = machines && Array.isArray(machines) 
                              ? machines.find((m: any) => m.id === work.machineId) 
                              : null;
                              
                            return (
                              <TableRow key={work.id}>
                                <TableCell>{work.workType}</TableCell>
                                <TableCell>{format(new Date(work.startDate), 'dd/MM/yyyy', { locale: es })}</TableCell>
                                <TableCell>{machine ? `${machine.brand} ${machine.model}` : 'No asignada'}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{work.description}</TableCell>
                                <TableCell>
                                  {work.photo ? (
                                    <div className="relative w-10 h-10">
                                      <img 
                                        src={`/uploads/${work.photo}`} 
                                        alt="Foto del trabajo"
                                        className="rounded-md object-cover w-full h-full cursor-pointer"
                                        onClick={() => window.open(`/uploads/${work.photo}`, '_blank')}
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">Sin foto</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-4 text-center">
                    No hay trabajos registrados para esta parcela
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setWorkSheetOpen(true);
                setSelectedPastureId(selectedPasture?.id || null);
                workForm.setValue('pastureId', selectedPasture?.id || 0);
              }}
              className="mr-2"
            >
              Registrar trabajo
            </Button>
            <Button onClick={() => setDetailsDialogOpen(false)} variant="outline">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}