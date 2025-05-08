import { useState } from "react";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function WeatherPage() {
  const { toast } = useToast();
  const [customLocation, setCustomLocation] = useState<{
    lat: number;
    lon: number;
    name: string;
  } | null>(null);
  
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
        <h1 className="text-3xl font-bold">Clima y Riesgos para Cultivos</h1>
        <p className="text-muted-foreground">
          Monitorea las condiciones climáticas actuales y evalúa los posibles riesgos para tus cultivos.
        </p>
      </div>

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
    </div>
  );
}