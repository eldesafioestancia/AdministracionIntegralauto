import { useState } from "react";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { AgriPlanningTool } from "@/components/weather/AgriPlanningTool";
import { PrecipitationHistory } from "@/components/weather/PrecipitationHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function WeatherPage() {
  const { toast } = useToast();
  const [customLocation, setCustomLocation] = useState<{
    lat: number;
    lon: number;
    name: string;
  } | null>(null);
  
  const [activeTab, setActiveTab] = useState("weather");
  const [locationInput, setLocationInput] = useState({
    name: "",
    lat: "",
    lon: ""
  });

  const handleAddLocation = () => {
    // Validar que se hayan ingresado todos los datos
    if (!locationInput.name || !locationInput.lat || !locationInput.lon) {
      toast({
        variant: "destructive",
        title: "Datos incompletos",
        description: "Por favor, ingresa el nombre de la ubicación, latitud y longitud."
      });
      return;
    }

    // Validar que latitud y longitud sean números válidos
    const lat = parseFloat(locationInput.lat);
    const lon = parseFloat(locationInput.lon);

    if (isNaN(lat) || isNaN(lon)) {
      toast({
        variant: "destructive",
        title: "Datos inválidos",
        description: "La latitud y longitud deben ser números válidos."
      });
      return;
    }

    // Validar rangos de latitud (-90 a 90) y longitud (-180 a 180)
    if (lat < -90 || lat > 90) {
      toast({
        variant: "destructive",
        title: "Latitud inválida",
        description: "La latitud debe estar entre -90 y 90 grados."
      });
      return;
    }

    if (lon < -180 || lon > 180) {
      toast({
        variant: "destructive",
        title: "Longitud inválida",
        description: "La longitud debe estar entre -180 y 180 grados."
      });
      return;
    }

    // Establecer la ubicación personalizada
    setCustomLocation({
      name: locationInput.name,
      lat,
      lon
    });

    toast({
      title: "Ubicación actualizada",
      description: `Mostrando datos para ${locationInput.name}`,
    });

    // Limpiar el formulario
    setLocationInput({
      name: "",
      lat: "",
      lon: ""
    });
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Clima y Planificación Agrícola</h1>
        <p className="text-muted-foreground">
          Monitorea las condiciones climáticas, evalúa los riesgos para tus cultivos y planifica tus actividades agrícolas.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="weather">Clima Actual</TabsTrigger>
          <TabsTrigger value="planning">Planificación Agrícola</TabsTrigger>
          <TabsTrigger value="precipitation">Historial de Precipitaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weather" className="mt-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="space-y-6 md:col-span-8">
              <WeatherWidget defaultLocation={customLocation || undefined} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Guía de uso</CardTitle>
                  <CardDescription>
                    Cómo utilizar la herramienta de clima y evaluación de riesgos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Información actual</h3>
                    <p className="text-sm text-slate-600">
                      Consulta la temperatura actual, humedad, velocidad del viento y presión atmosférica en tu ubicación. También verás el nivel de riesgo general para los cultivos basado en las condiciones actuales.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Pronóstico</h3>
                    <p className="text-sm text-slate-600">
                      Visualiza la tendencia de temperatura y probabilidad de precipitación para las próximas 24 horas, lo que te permitirá planificar actividades agrícolas.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Evaluación de riesgos</h3>
                    <p className="text-sm text-slate-600">
                      Revisa los factores de riesgo específicos para tus cultivos y las recomendaciones personalizadas para mitigar estos riesgos. Los niveles de riesgo se clasifican como:
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Bajo</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Moderado</Badge>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Alto</Badge>
                      <Badge className="bg-red-200 text-red-900 hover:bg-red-300">Severo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ubicación personalizada</CardTitle>
                  <CardDescription>
                    Ingresa las coordenadas de una ubicación específica para consultar su clima
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre de la ubicación</label>
                    <Input 
                      placeholder="Ej: Campo El Trigal" 
                      value={locationInput.name}
                      onChange={(e) => setLocationInput(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Latitud</label>
                    <Input 
                      placeholder="Ej: -34.6037" 
                      value={locationInput.lat}
                      onChange={(e) => setLocationInput(prev => ({ ...prev, lat: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Longitud</label>
                    <Input 
                      placeholder="Ej: -58.3816" 
                      value={locationInput.lon}
                      onChange={(e) => setLocationInput(prev => ({ ...prev, lon: e.target.value }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddLocation}>
                    Actualizar ubicación
                  </Button>
                  <div className="text-xs text-slate-500 mt-2">
                    <p>Puedes obtener las coordenadas de tu campo desde Google Maps: haz clic derecho en el mapa y selecciona "¿Qué hay aquí?".</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consejos de manejo agrícola</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-3 py-1">
                    <h3 className="font-medium text-sm">Temperaturas extremas</h3>
                    <p className="text-xs text-slate-600">
                      Durante olas de calor, programa el riego para las horas más frescas del día para reducir la evaporación y el estrés de las plantas.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3 py-1">
                    <h3 className="font-medium text-sm">Heladas</h3>
                    <p className="text-xs text-slate-600">
                      Ante pronósticos de heladas, considera el uso de cubiertas protectoras o riego por aspersión para proteger cultivos sensibles.
                    </p>
                  </div>
                  <div className="border-l-4 border-amber-500 pl-3 py-1">
                    <h3 className="font-medium text-sm">Alta humedad</h3>
                    <p className="text-xs text-slate-600">
                      En periodos de alta humedad, aumenta la ventilación en cultivos bajo cubierta y considera aplicaciones preventivas de fungicidas.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3 py-1">
                    <h3 className="font-medium text-sm">Vientos fuertes</h3>
                    <p className="text-xs text-slate-600">
                      Asegura estructuras de soporte y pospón aplicaciones de agroquímicos cuando se pronostiquen vientos superiores a 10 km/h.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="planning" className="mt-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-8">
              <AgriPlanningTool defaultLocation={customLocation || undefined} />
            </div>
            
            <div className="md:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integración con Pasturas y Animales</CardTitle>
                  <CardDescription>
                    Sincroniza datos con otras secciones del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-700">Coordinación con Pasturas</h3>
                    <p className="text-xs text-slate-600">
                      Las recomendaciones de planificación pueden aplicarse directamente a parcelas en el módulo de Pasturas para programar trabajos futuros.
                    </p>
                    <Button variant="outline" size="sm" className="w-full mt-1">
                      Sincronizar con Pasturas
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <h3 className="text-sm font-medium text-slate-700">Gestión de Alimentación Animal</h3>
                    <p className="text-xs text-slate-600">
                      Utiliza el pronóstico para planificar la rotación de ganado y disponibilidad de pasto según condiciones climáticas.
                    </p>
                    <Button variant="outline" size="sm" className="w-full mt-1">
                      Sincronizar con Animales
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recursos adicionales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.open("https://www.smn.gob.ar/", "_blank")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
                    Servicio Meteorológico Nacional
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.open("https://www.magyp.gob.ar/", "_blank")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
                    Min. de Agricultura, Ganadería y Pesca
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.open("https://inta.gob.ar/", "_blank")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                    INTA - Recursos Técnicos
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-700">Calendario Agrícola</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-blue-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Maíz</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Sep - Dic</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Trigo</p>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">May - Ago</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Soja</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Oct - Dic</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Girasol</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Sep - Nov</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Cebada</p>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">May - Ago</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
          <TabsContent value="precipitation" className="mt-6">
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-9">
                <PrecipitationHistory location={customLocation || {
                  lat: -34.6037,
                  lon: -58.3816,
                  name: "Buenos Aires"
                }} />
              </div>
              
              <div className="md:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Uso de datos históricos</CardTitle>
                    <CardDescription>
                      Cómo aprovechar esta información en la gestión agrícola
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-slate-700">Análisis de tendencias</h3>
                      <p className="text-xs text-slate-600">
                        Utiliza los patrones históricos de precipitación para identificar ciclos y tendencias que ayuden a planificar rotaciones de cultivos y fechas de siembra.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-slate-700">Manejo de riesgos</h3>
                      <p className="text-xs text-slate-600">
                        Evalúa la variabilidad histórica para prepararte ante eventos extremos y tomar medidas preventivas según la probabilidad de sequías o excesos hídricos.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-slate-700">Decisiones económicas</h3>
                      <p className="text-xs text-slate-600">
                        Considera los datos históricos para decisiones de inversión en sistemas de riego, drenaje y selección de cultivos adaptados a las condiciones locales.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-blue-700">Impacto en cultivos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-blue-800 space-y-3">
                      <p>
                        Los datos históricos de precipitación son fundamentales para la planificación agrícola a largo plazo.
                      </p>
                      <p>
                        <strong>Las tendencias de 20 años</strong> permiten entender los ciclos climáticos regionales y adaptar las prácticas agrícolas.
                      </p>
                      <p>
                        <strong>Los datos recientes (3 meses)</strong> proporcionan contexto para las decisiones inmediatas sobre manejo de cultivos, riego y aplicación de insumos.
                      </p>
                      <p>
                        La comparación entre promedios históricos y valores actuales ayuda a identificar anomalías y ajustar estrategias.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }