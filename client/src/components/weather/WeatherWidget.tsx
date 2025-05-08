import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Registrar componentes necesarios de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mapeo de códigos de clima a íconos
const weatherIcons: Record<string, string> = {
  "01d": "☀️", // Cielo despejado (día)
  "01n": "🌙", // Cielo despejado (noche)
  "02d": "🌤️", // Algunas nubes (día)
  "02n": "☁️", // Algunas nubes (noche)
  "03d": "☁️", // Nubes dispersas
  "03n": "☁️", // Nubes dispersas
  "04d": "☁️", // Muy nublado
  "04n": "☁️", // Muy nublado
  "09d": "🌧️", // Lluvia ligera
  "09n": "🌧️", // Lluvia ligera
  "10d": "🌦️", // Lluvia (día)
  "10n": "🌧️", // Lluvia (noche)
  "11d": "⛈️", // Tormenta
  "11n": "⛈️", // Tormenta
  "13d": "❄️", // Nieve
  "13n": "❄️", // Nieve
  "50d": "🌫️", // Niebla
  "50n": "🌫️", // Niebla
};

// Mapeo de niveles de riesgo a colores y emojis
const riskLevelStyles: Record<string, { color: string, bg: string, emoji: string }> = {
  "low": { color: "text-green-700", bg: "bg-green-100", emoji: "✅" },
  "moderate": { color: "text-yellow-700", bg: "bg-yellow-100", emoji: "⚠️" },
  "high": { color: "text-red-700", bg: "bg-red-100", emoji: "❗" },
  "severe": { color: "text-red-900", bg: "bg-red-200", emoji: "🚨" },
};

// Mapeo de impacto de factores de riesgo a colores
const impactStyles: Record<string, string> = {
  "low": "text-green-600",
  "moderate": "text-yellow-600",
  "high": "text-red-600",
};

interface WeatherWidgetProps {
  defaultLocation?: {
    lat: number;
    lon: number;
    name: string;
  };
}

export function WeatherWidget({ defaultLocation }: WeatherWidgetProps) {
  const [location, setLocation] = useState(defaultLocation || {
    lat: -38.7183, // Buenos Aires (default)
    lon: -62.2661,
    name: "Bahía Blanca"
  });
  const [activeTab, setActiveTab] = useState("current");

  // Obtener la ubicación del usuario si no se proporciona una por defecto
  useEffect(() => {
    if (!defaultLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: "Tu ubicación"
          });
        },
        (error) => {
          console.error("Error obteniendo la ubicación:", error);
        }
      );
    }
  }, [defaultLocation]);

  // Consulta para los datos del clima y riesgos de cultivos
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/weather/crop-risks', location.lat, location.lon],
    queryFn: async () => {
      const response = await fetch(
        `/api/weather/crop-risks?lat=${location.lat}&lon=${location.lon}`
      );
      if (!response.ok) {
        throw new Error('Error al obtener datos meteorológicos');
      }
      return response.json();
    },
    enabled: Boolean(location.lat && location.lon),
    refetchInterval: 30 * 60 * 1000, // Actualizar cada 30 minutos
    refetchOnWindowFocus: false
  });

  // Preparar datos para el gráfico de temperatura
  const temperatureChartData = {
    labels: data?.forecast?.map((item: any) => 
      format(new Date(item.dt * 1000), 'HH:mm', { locale: es })
    ) || [],
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: data?.forecast?.map((item: any) => item.main.temp) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Preparar datos para el gráfico de precipitación
  const precipitationChartData = {
    labels: data?.forecast?.map((item: any) => 
      format(new Date(item.dt * 1000), 'HH:mm', { locale: es })
    ) || [],
    datasets: [
      {
        label: 'Prob. Precipitación (%)',
        data: data?.forecast?.map((item: any) => item.pop * 100) || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Si está cargando, mostrar esqueleto
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
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
          No se pudieron obtener los datos del clima. Por favor, intente nuevamente más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // Si no hay datos, no mostrar nada
  if (!data) return null;

  const { currentWeather, riskAssessment } = data;
  const currentDate = new Date(currentWeather.dt * 1000);
  const weatherIcon = weatherIcons[currentWeather.weather[0].icon] || "🌡️";
  const riskLevel = riskAssessment.level; // Cambiado de riskLevel a level
  const { color, bg, emoji } = riskLevelStyles[riskLevel] || riskLevelStyles.low;
  
  // Generar recomendaciones basadas en condiciones actuales
  const recommendationsList = riskAssessment.factors && riskAssessment.factors.length > 0
    ? [
        // Recomendaciones según temperatura
        currentWeather.main.temp > 30
          ? "Riegue cultivos temprano en la mañana o al atardecer para minimizar la evaporación."
          : currentWeather.main.temp < 5
          ? "Proteja cultivos sensibles ante posibles heladas."
          : "Las condiciones de temperatura son favorables para la mayoría de cultivos.",
        
        // Recomendaciones según humedad
        currentWeather.main.humidity > 80
          ? "Vigile posibles enfermedades fúngicas debido a la alta humedad."
          : currentWeather.main.humidity < 30
          ? "Considere aumentar el riego para compensar la baja humedad ambiental."
          : "El nivel de humedad es adecuado para el desarrollo de cultivos.",
        
        // Recomendaciones según viento
        currentWeather.wind.speed > 8
          ? "Evite la aplicación de agroquímicos con estas condiciones de viento."
          : "Las condiciones actuales son favorables para labores de fumigación."
      ]
    : [
        "Las condiciones actuales son favorables para la mayoría de operaciones agrícolas.",
        "Aproveche estas condiciones para realizar labores de campo pendientes.",
        "Monitoree regularmente el pronóstico para planificar actividades futuras."
      ];

  return (
    <Card className="shadow-md border-t-4" style={{ borderTopColor: riskLevel === 'low' ? '#10b981' : riskLevel === 'moderate' ? '#f59e0b' : '#ef4444' }}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {weatherIcon} Clima en {location.name}
              <Badge variant="outline" className="ml-2">
                {format(currentDate, "d 'de' MMMM, HH:mm", { locale: es })}
              </Badge>
            </CardTitle>
            <CardDescription>
              {currentWeather.weather[0].description.charAt(0).toUpperCase() + currentWeather.weather[0].description.slice(1)}
            </CardDescription>
          </div>
          <div className="text-3xl font-bold">
            {Math.round(currentWeather.main.temp)}°C
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Actual</TabsTrigger>
            <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
            <TabsTrigger value="risks">Riesgos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-100 p-3 rounded-md">
                <div className="text-sm text-slate-500">Sensación térmica</div>
                <div className="font-semibold">{Math.round(currentWeather.main.feels_like)}°C</div>
              </div>
              <div className="bg-slate-100 p-3 rounded-md">
                <div className="text-sm text-slate-500">Humedad</div>
                <div className="font-semibold">{currentWeather.main.humidity}%</div>
              </div>
              <div className="bg-slate-100 p-3 rounded-md">
                <div className="text-sm text-slate-500">Viento</div>
                <div className="font-semibold">{Math.round(currentWeather.wind.speed * 3.6)} km/h</div>
              </div>
              <div className="bg-slate-100 p-3 rounded-md">
                <div className="text-sm text-slate-500">Presión</div>
                <div className="font-semibold">{currentWeather.main.pressure} hPa</div>
              </div>
            </div>

            <div className={`p-4 rounded-md ${bg}`}>
              <h3 className={`font-bold ${color} flex items-center gap-2`}>
                {emoji} Nivel de riesgo para cultivos: {riskLevel === 'low' ? 'Bajo' : riskLevel === 'moderate' ? 'Moderado' : riskLevel === 'high' ? 'Alto' : 'Severo'}
              </h3>
            </div>
          </TabsContent>
          
          <TabsContent value="forecast" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Temperatura (próximas 24h)</h3>
                <div className="h-[200px]">
                  <Line 
                    data={temperatureChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          title: {
                            display: true,
                            text: '°C'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Probabilidad de precipitación</h3>
                <div className="h-[200px]">
                  <Line 
                    data={precipitationChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          title: {
                            display: true,
                            text: '%'
                          },
                          min: 0,
                          max: 100
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="risks" className="space-y-4">
            <div className={`p-4 rounded-md ${bg}`}>
              <h3 className={`font-bold ${color} flex items-center gap-2`}>
                {emoji} Nivel de riesgo: {riskLevel === 'low' ? 'Bajo' : riskLevel === 'moderate' ? 'Moderado' : riskLevel === 'high' ? 'Alto' : 'Severo'}
              </h3>
            </div>
            
            {riskAssessment.factors && riskAssessment.factors.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold">Factores de riesgo:</h3>
                {riskAssessment.factors.map((factor: any, index: number) => (
                  <div key={index} className="border p-3 rounded-md">
                    <div className={`font-medium ${impactStyles[factor.impact]}`}>
                      {factor.factor}
                      <Badge variant="outline" className="ml-2">
                        Impacto: {factor.impact === 'low' ? 'Bajo' : factor.impact === 'moderate' ? 'Moderado' : 'Alto'}
                      </Badge>
                    </div>
                    <div className="text-slate-600 text-sm">{factor.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-green-600">No se detectaron factores de riesgo significativos para los cultivos.</div>
            )}
            
            <div className="space-y-3">
              <h3 className="font-semibold">Recomendaciones:</h3>
              <ul className="space-y-2">
                {recommendationsList.map((rec: string, index: number) => (
                  <li key={index} className="bg-blue-50 p-3 rounded-md text-blue-700">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
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
        <Button variant="outline" size="sm" onClick={() => {
          window.open(`https://openweathermap.org/city/${currentWeather.id}`, '_blank');
        }}>
          Ver más detalles
        </Button>
      </CardFooter>
    </Card>
  );
}