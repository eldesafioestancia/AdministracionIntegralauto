import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Definición de cultivos comunes para Argentina
const COMMON_CROPS = [
  { id: "maize", name: "Maíz", icon: "🌽", months: [9, 10, 11, 12] }, // Sep-Dic
  { id: "wheat", name: "Trigo", icon: "🌾", months: [5, 6, 7, 8] }, // May-Ago
  { id: "soybean", name: "Soja", icon: "🫘", months: [10, 11, 12] }, // Oct-Dic
  { id: "sunflower", name: "Girasol", icon: "🌻", months: [9, 10, 11] }, // Sep-Nov
  { id: "barley", name: "Cebada", icon: "🌿", months: [5, 6, 7, 8] }, // May-Ago
  { id: "alfalfa", name: "Alfalfa", icon: "🍀", months: [3, 4, 8, 9] }, // Mar-Abr, Ago-Sep
  { id: "sorghum", name: "Sorgo", icon: "🌱", months: [10, 11, 12, 1] }, // Oct-Ene
];

// Condiciones climáticas ideales para cada cultivo
const CROP_IDEAL_CONDITIONS = {
  maize: {
    temp: { min: 15, optimal: 25, max: 35 },
    humidity: { min: 50, optimal: 70, max: 85 },
    rainfall: { min: 500, optimal: 700, max: 1200 }, // mm por temporada
    description: "Requiere temperaturas cálidas y alta humedad. Sensible a heladas y sequías prolongadas."
  },
  wheat: {
    temp: { min: 3, optimal: 18, max: 25 },
    humidity: { min: 45, optimal: 60, max: 80 },
    rainfall: { min: 300, optimal: 500, max: 800 },
    description: "Cultivo de estación fría. Tolera temperaturas bajas pero es susceptible a exceso de lluvia en maduración."
  },
  soybean: {
    temp: { min: 15, optimal: 22, max: 30 },
    humidity: { min: 50, optimal: 70, max: 85 },
    rainfall: { min: 450, optimal: 600, max: 900 },
    description: "Requiere buena disponibilidad de agua. Sensible a sequías durante la floración y llenado de granos."
  },
  sunflower: {
    temp: { min: 13, optimal: 23, max: 32 },
    humidity: { min: 40, optimal: 60, max: 80 },
    rainfall: { min: 300, optimal: 500, max: 700 },
    description: "Tolera sequía moderada pero requiere buena disponibilidad de agua durante floración y llenado."
  },
  barley: {
    temp: { min: 5, optimal: 15, max: 25 },
    humidity: { min: 45, optimal: 60, max: 80 },
    rainfall: { min: 250, optimal: 450, max: 650 },
    description: "Similar al trigo pero más tolerante a la sequía. Sensible a exceso de lluvia en maduración."
  },
  alfalfa: {
    temp: { min: 10, optimal: 20, max: 30 },
    humidity: { min: 50, optimal: 65, max: 80 },
    rainfall: { min: 400, optimal: 600, max: 900 },
    description: "Cultivo perenne que requiere buena disponibilidad de agua. Tolera períodos cortos de sequía."
  },
  sorghum: {
    temp: { min: 18, optimal: 27, max: 35 },
    humidity: { min: 45, optimal: 65, max: 80 },
    rainfall: { min: 300, optimal: 550, max: 800 },
    description: "Muy tolerante a la sequía y altas temperaturas. Ideal para zonas con precipitaciones limitadas."
  }
};

// Fenología básica de cultivos (días aproximados para cada etapa)
const CROP_PHENOLOGY = {
  maize: [
    { stage: "Emergencia", days: 7, critical: false },
    { stage: "Desarrollo vegetativo", days: 30, critical: false },
    { stage: "Floración", days: 15, critical: true },
    { stage: "Llenado de granos", days: 35, critical: true },
    { stage: "Maduración", days: 25, critical: false },
  ],
  wheat: [
    { stage: "Emergencia", days: 10, critical: false },
    { stage: "Macollaje", days: 25, critical: false },
    { stage: "Encañado", days: 30, critical: false },
    { stage: "Espigado", days: 10, critical: true },
    { stage: "Llenado de granos", days: 35, critical: true },
    { stage: "Maduración", days: 15, critical: false },
  ],
  soybean: [
    { stage: "Emergencia", days: 7, critical: false },
    { stage: "Desarrollo vegetativo", days: 35, critical: false },
    { stage: "Floración", days: 15, critical: true },
    { stage: "Formación de vainas", days: 20, critical: true },
    { stage: "Llenado de granos", days: 25, critical: true },
    { stage: "Maduración", days: 15, critical: false },
  ],
  sunflower: [
    { stage: "Emergencia", days: 10, critical: false },
    { stage: "Desarrollo vegetativo", days: 30, critical: false },
    { stage: "Formación del botón floral", days: 15, critical: false },
    { stage: "Floración", days: 15, critical: true },
    { stage: "Llenado de aquenios", days: 25, critical: true },
    { stage: "Maduración", days: 15, critical: false },
  ],
  barley: [
    { stage: "Emergencia", days: 8, critical: false },
    { stage: "Macollaje", days: 25, critical: false },
    { stage: "Encañado", days: 25, critical: false },
    { stage: "Espigado", days: 10, critical: true },
    { stage: "Llenado de granos", days: 30, critical: true },
    { stage: "Maduración", days: 15, critical: false },
  ],
  alfalfa: [
    { stage: "Emergencia", days: 10, critical: false },
    { stage: "Desarrollo inicial", days: 20, critical: false },
    { stage: "Desarrollo vegetativo", days: 25, critical: true },
    { stage: "Prefloración", days: 15, critical: true },
    { stage: "Floración", days: 20, critical: false },
  ],
  sorghum: [
    { stage: "Emergencia", days: 7, critical: false },
    { stage: "Desarrollo vegetativo", days: 30, critical: false },
    { stage: "Inicio de panoja", days: 15, critical: false },
    { stage: "Floración", days: 15, critical: true },
    { stage: "Llenado de granos", days: 25, critical: true },
    { stage: "Maduración", days: 20, critical: false },
  ],
};

// Riesgos específicos para cada cultivo según condiciones climáticas
const evaluateCropRisk = (crop: string, forecast: any[]) => {
  if (!forecast || !CROP_IDEAL_CONDITIONS[crop as keyof typeof CROP_IDEAL_CONDITIONS]) {
    return { level: "unknown", factors: [] };
  }

  const idealConditions = CROP_IDEAL_CONDITIONS[crop as keyof typeof CROP_IDEAL_CONDITIONS];
  const risks = [];
  let maxRiskLevel = "low";

  // Evaluar temperatura
  const avgTemp = forecast.reduce((sum, period) => sum + period.main.temp, 0) / forecast.length;
  if (avgTemp < idealConditions.temp.min) {
    risks.push({
      factor: "Temperatura baja",
      description: `Temperatura promedio de ${Math.round(avgTemp)}°C está por debajo del mínimo ideal (${idealConditions.temp.min}°C) para ${COMMON_CROPS.find(c => c.id === crop)?.name}`,
      impact: avgTemp < idealConditions.temp.min - 5 ? "high" : "moderate"
    });
    maxRiskLevel = avgTemp < idealConditions.temp.min - 5 ? "high" : maxRiskLevel === "low" ? "moderate" : maxRiskLevel;
  } else if (avgTemp > idealConditions.temp.max) {
    risks.push({
      factor: "Temperatura alta",
      description: `Temperatura promedio de ${Math.round(avgTemp)}°C está por encima del máximo ideal (${idealConditions.temp.max}°C) para ${COMMON_CROPS.find(c => c.id === crop)?.name}`,
      impact: avgTemp > idealConditions.temp.max + 5 ? "high" : "moderate"
    });
    maxRiskLevel = avgTemp > idealConditions.temp.max + 5 ? "high" : maxRiskLevel === "low" ? "moderate" : maxRiskLevel;
  }

  // Evaluar humedad
  const avgHumidity = forecast.reduce((sum, period) => sum + period.main.humidity, 0) / forecast.length;
  if (avgHumidity < idealConditions.humidity.min) {
    risks.push({
      factor: "Humedad baja",
      description: `Humedad promedio del ${Math.round(avgHumidity)}% está por debajo del mínimo ideal (${idealConditions.humidity.min}%) para ${COMMON_CROPS.find(c => c.id === crop)?.name}`,
      impact: avgHumidity < idealConditions.humidity.min - 10 ? "high" : "moderate"
    });
    maxRiskLevel = avgHumidity < idealConditions.humidity.min - 10 ? "high" : maxRiskLevel === "low" ? "moderate" : maxRiskLevel;
  } else if (avgHumidity > idealConditions.humidity.max) {
    risks.push({
      factor: "Humedad alta",
      description: `Humedad promedio del ${Math.round(avgHumidity)}% está por encima del máximo ideal (${idealConditions.humidity.max}%) para ${COMMON_CROPS.find(c => c.id === crop)?.name}`,
      impact: avgHumidity > idealConditions.humidity.max + 10 ? "high" : "moderate"
    });
    maxRiskLevel = avgHumidity > idealConditions.humidity.max + 10 ? "high" : maxRiskLevel === "low" ? "moderate" : maxRiskLevel;
  }

  // Evaluar probabilidad de lluvia
  const highRainProb = forecast.some(period => period.pop > 0.7);
  if (highRainProb) {
    risks.push({
      factor: "Alta probabilidad de lluvia",
      description: "Probabilidad significativa de precipitaciones en las próximas 24 horas",
      impact: "moderate"
    });
    maxRiskLevel = maxRiskLevel === "low" ? "moderate" : maxRiskLevel;
  }

  // Evaluar vientos fuertes (especialmente importantes durante la polinización)
  const highWinds = forecast.some(period => period.wind && period.wind.speed > 10);
  if (highWinds) {
    risks.push({
      factor: "Vientos fuertes",
      description: "Se pronostican vientos de más de 10 m/s que pueden afectar la polinización o causar daño mecánico",
      impact: "moderate"
    });
    maxRiskLevel = maxRiskLevel === "low" ? "moderate" : maxRiskLevel;
  }

  return {
    level: maxRiskLevel,
    factors: risks
  };
};

// Generar el cronograma de cultivo a partir de la fecha de siembra
const generateCropSchedule = (cropId: string, plantingDate: Date) => {
  if (!CROP_PHENOLOGY[cropId as keyof typeof CROP_PHENOLOGY]) {
    return [];
  }

  const phenology = CROP_PHENOLOGY[cropId as keyof typeof CROP_PHENOLOGY];
  let currentDate = new Date(plantingDate);
  const schedule = [];

  for (let i = 0; i < phenology.length; i++) {
    const stage = phenology[i];
    const startDate = new Date(currentDate);
    const endDate = addDays(currentDate, stage.days);
    
    schedule.push({
      stage: stage.stage,
      startDate,
      endDate,
      days: stage.days,
      critical: stage.critical
    });
    
    currentDate = addDays(currentDate, stage.days);
  }

  return schedule;
};

interface AgriPlanningToolProps {
  defaultLocation?: {
    lat: number;
    lon: number;
    name: string;
  };
}

export function AgriPlanningTool({ defaultLocation }: AgriPlanningToolProps) {
  const [location, setLocation] = useState(defaultLocation || {
    lat: -38.7183,
    lon: -62.2661,
    name: "Bahía Blanca"
  });
  
  const [selectedCrop, setSelectedCrop] = useState("maize");
  const [plantingDate, setPlantingDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("planning");
  const [showCalendar, setShowCalendar] = useState(false);

  // Consulta para los datos del clima para análisis de siembra
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/weather/forecast', location.lat, location.lon],
    queryFn: async () => {
      const response = await fetch(
        `/api/weather/forecast?lat=${location.lat}&lon=${location.lon}`
      );
      if (!response.ok) {
        throw new Error('Error al obtener pronóstico meteorológico');
      }
      return response.json();
    },
    enabled: Boolean(location.lat && location.lon),
    refetchInterval: 60 * 60 * 1000, // Actualizar cada hora
    refetchOnWindowFocus: false
  });

  // Generar cronograma basado en fecha de siembra
  const cropSchedule = plantingDate 
    ? generateCropSchedule(selectedCrop, plantingDate) 
    : [];

  // Evaluar riesgos específicos del cultivo
  const cropRisks = data?.list 
    ? evaluateCropRisk(selectedCrop, data.list.slice(0, 8)) 
    : { level: "unknown", factors: [] };

  // Obtener ideales del cultivo seleccionado
  const selectedCropDetails = COMMON_CROPS.find(crop => crop.id === selectedCrop);
  const idealConditions = CROP_IDEAL_CONDITIONS[selectedCrop as keyof typeof CROP_IDEAL_CONDITIONS];

  // Si está cargando, mostrar esqueleto
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error al cargar datos meteorológicos</AlertTitle>
        <AlertDescription>
          No se pudieron obtener los datos de pronóstico. Por favor, intente nuevamente más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  const riskColorClass = 
    cropRisks.level === "high" ? "text-red-600" : 
    cropRisks.level === "moderate" ? "text-amber-600" : 
    cropRisks.level === "low" ? "text-green-600" : 
    "text-gray-600";

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          {selectedCropDetails?.icon} Planificación Agrícola
        </CardTitle>
        <CardDescription>
          Herramienta de planificación de siembra y análisis de cultivos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planning">Planificación</TabsTrigger>
            <TabsTrigger value="schedule">Cronograma</TabsTrigger>
            <TabsTrigger value="analysis">Análisis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="planning" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="crop">Seleccionar cultivo</Label>
                <Select 
                  value={selectedCrop} 
                  onValueChange={setSelectedCrop}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cultivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_CROPS.map(crop => (
                      <SelectItem key={crop.id} value={crop.id}>
                        <span className="flex items-center gap-2">
                          {crop.icon} {crop.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date">Fecha de siembra</Label>
                <div className="relative">
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !plantingDate && "text-muted-foreground"
                        )}
                      >
                        {plantingDate ? (
                          format(plantingDate, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={plantingDate}
                        onSelect={(date) => {
                          setPlantingDate(date);
                          setShowCalendar(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mt-4">
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Información del cultivo</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Cultivo</p>
                    <p className="font-medium">{selectedCropDetails?.icon} {selectedCropDetails?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Temporada de siembra ideal</p>
                    <p className="font-medium">
                      {selectedCropDetails?.months.map(m => {
                        const date = new Date(2024, m-1, 1);
                        return format(date, 'MMM', { locale: es });
                      }).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Temperatura ideal</p>
                    <p className="font-medium">{idealConditions?.temp.min}°C - {idealConditions?.temp.max}°C (óptima: {idealConditions?.temp.optimal}°C)</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Humedad ideal</p>
                    <p className="font-medium">{idealConditions?.humidity.min}% - {idealConditions?.humidity.max}% (óptima: {idealConditions?.humidity.optimal}%)</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-500">Descripción</p>
                    <p className="text-sm">{idealConditions?.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Evaluación de condiciones actuales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Nivel de riesgo para siembra:</span>
                    <Badge 
                      className={`
                        ${cropRisks.level === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                          cropRisks.level === 'moderate' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 
                          cropRisks.level === 'low' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                          'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                      `}
                    >
                      {cropRisks.level === 'high' ? 'Alto' : 
                       cropRisks.level === 'moderate' ? 'Moderado' : 
                       cropRisks.level === 'low' ? 'Bajo' : 
                       'Desconocido'}
                    </Badge>
                  </div>
                  
                  {cropRisks.factors.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Factores de riesgo identificados:</p>
                      <ul className="space-y-1 text-sm">
                        {cropRisks.factors.map((factor, idx) => (
                          <li key={idx} className="border-l-2 border-amber-500 pl-2">
                            <span className="font-medium">{factor.factor}:</span> {factor.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">No se detectaron factores de riesgo significativos para este cultivo.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            {plantingDate ? (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Cronograma de {selectedCropDetails?.name}</h3>
                  <Badge>Fecha de siembra: {format(plantingDate, "PPP", { locale: es })}</Badge>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Etapa fenológica</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cropSchedule.map((stage, idx) => {
                      const today = new Date();
                      let status = "pending";
                      if (today > stage.endDate) status = "completed";
                      else if (today >= stage.startDate && today <= stage.endDate) status = "active";
                      
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {stage.stage}
                            {stage.critical && (
                              <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-800 border-amber-200">
                                Crítica
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{format(stage.startDate, "dd MMM yyyy", { locale: es })}</TableCell>
                          <TableCell>{format(stage.endDate, "dd MMM yyyy", { locale: es })}</TableCell>
                          <TableCell>{stage.days} días</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                status === "active" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                                status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                                "bg-slate-100 text-slate-800 hover:bg-slate-200"
                              }
                            >
                              {status === "active" ? "En progreso" :
                               status === "completed" ? "Completada" :
                               "Pendiente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                <div className="space-y-3 mt-2">
                  <h3 className="font-medium">Recomendaciones de gestión</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 mb-1">Monitoreo de cultivo</h4>
                      <p className="text-sm text-blue-700">
                        Realice inspecciones regulares durante las etapas críticas para detectar plagas y enfermedades tempranamente.
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <h4 className="text-sm font-semibold text-green-800 mb-1">Gestión de riego</h4>
                      <p className="text-sm text-green-700">
                        Priorice el riego durante las etapas de {cropSchedule.filter(s => s.critical).map(s => s.stage.toLowerCase()).join(' y ')}.
                      </p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                      <h4 className="text-sm font-semibold text-amber-800 mb-1">Control de malezas</h4>
                      <p className="text-sm text-amber-700">
                        Implemente control de malezas durante las primeras etapas de desarrollo para minimizar la competencia.
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                      <h4 className="text-sm font-semibold text-purple-800 mb-1">Preparación para cosecha</h4>
                      <p className="text-sm text-purple-700">
                        Planifique la cosecha para alrededor del {format(cropSchedule[cropSchedule.length - 1]?.endDate || new Date(), "dd 'de' MMMM", { locale: es })}.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">Selecciona un cultivo y una fecha de siembra para ver el cronograma</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Análisis de aptitud de cultivos</h3>
              <p className="text-sm text-slate-600 mb-4">
                Basado en las condiciones climáticas actuales y pronóstico, se evalúa la aptitud de diferentes cultivos para siembra en esta ubicación.
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cultivo</TableHead>
                    <TableHead>Temporada ideal</TableHead>
                    <TableHead>Aptitud actual</TableHead>
                    <TableHead>Recomendación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMMON_CROPS.map((crop) => {
                    // Analizar si estamos en temporada ideal
                    const currentMonth = new Date().getMonth() + 1;
                    const isIdealSeason = crop.months.includes(currentMonth);
                    
                    // Evaluar aptitud del cultivo en condiciones actuales
                    const cropRisk = data?.list 
                      ? evaluateCropRisk(crop.id, data.list.slice(0, 8)) 
                      : { level: "unknown", factors: [] };
                    
                    let aptitude = "Alta";
                    let aptitudeClass = "text-green-600";
                    let recommendation = "Óptimo para siembra";
                    
                    if (!isIdealSeason && cropRisk.level !== "low") {
                      aptitude = "Baja";
                      aptitudeClass = "text-red-600";
                      recommendation = "No recomendado actualmente";
                    } else if (!isIdealSeason) {
                      aptitude = "Media-Baja";
                      aptitudeClass = "text-amber-600";
                      recommendation = "Fuera de temporada ideal";
                    } else if (cropRisk.level === "high") {
                      aptitude = "Media-Baja";
                      aptitudeClass = "text-amber-600";
                      recommendation = "Riesgos climáticos elevados";
                    } else if (cropRisk.level === "moderate") {
                      aptitude = "Media";
                      aptitudeClass = "text-amber-600";
                      recommendation = "Monitorear condiciones";
                    }
                    
                    return (
                      <TableRow key={crop.id}>
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-2">
                            {crop.icon} {crop.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          {crop.months.map(m => {
                            const date = new Date(2024, m-1, 1);
                            return format(date, 'MMM', { locale: es });
                          }).join(', ')}
                        </TableCell>
                        <TableCell className={aptitudeClass}>
                          {aptitude}
                        </TableCell>
                        <TableCell>
                          {recommendation}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="space-y-3 mt-2">
              <h3 className="font-medium">Pronóstico extendido y consideraciones</h3>
              <p className="text-sm text-slate-600">
                La planificación agrícola debe considerar tanto las condiciones climáticas actuales como las tendencias estacionales.
                Para decisiones más precisas, se recomienda:
              </p>
              <ul className="space-y-2 pl-5 list-disc text-sm text-slate-700">
                <li>Consultar el pronóstico extendido de 15-30 días para planificación de siembra</li>
                <li>Considerar datos históricos de la zona para cada cultivo específico</li>
                <li>Implementar sistemas de monitoreo continuo de humedad del suelo</li>
                <li>Contar con estrategias de mitigación para eventos climáticos extremos</li>
                <li>Diversificar cultivos para distribuir riesgos asociados al clima</li>
              </ul>
              
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => window.open("https://www.smn.gob.ar/pronostico-trimestral", "_blank")}
              >
                Ver pronóstico trimestral (SMN)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-between">
        <div className="text-xs text-slate-500">
          <p>Datos basados en fenología estándar. Ajustar según variedades específicas y condiciones locales.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setLocation({
                  lat: position.coords.latitude,
                  lon: position.coords.longitude,
                  name: "Tu ubicación"
                });
              }
            );
          }
        }}>
          Actualizar ubicación
        </Button>
      </CardFooter>
    </Card>
  );
}