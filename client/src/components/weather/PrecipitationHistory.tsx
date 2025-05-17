import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { es } from "date-fns/locale";

// Registrar componentes de Chart.js necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Paletas de colores para gráficos
const barChartColors = [
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 99, 132, 0.6)',
  'rgba(75, 192, 192, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)',
  'rgba(199, 199, 199, 0.6)'
];

const lineChartColors = [
  'rgb(54, 162, 235)',
  'rgb(255, 99, 132)',
  'rgb(75, 192, 192)',
  'rgb(255, 206, 86)',
  'rgb(153, 102, 255)',
  'rgb(255, 159, 64)',
  'rgb(199, 199, 199)'
];

interface PrecipitationHistoryProps {
  location: {
    lat: number;
    lon: number;
    name: string;
  };
}

interface YearlyData {
  year: number;
  precipitation: number;
  monthlyData: {
    month: string;
    precipitation: number;
    months: { [key: string]: number };
  }[];
}

interface HistoricalWeatherData {
  yearlyData: YearlyData[];
  totalAverage: number;
  monthlyAverages: { [key: string]: number };
  recentMonths: {
    month: string;
    precipitation: number;
    months: { [key: string]: number };
  }[];
}

interface PrecipitationHistoryProps {
  location?: {
    lat: number;
    lon: number;
    name: string;
  };
}

export function PrecipitationHistory({ location }: PrecipitationHistoryProps) {
  const defaultLocation = {
    lat: -38.7183, // Buenos Aires (default)
    lon: -62.2661,
    name: "Bahía Blanca"
  };
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("20years");
  const [customStartYear, setCustomStartYear] = useState<string>("1975");
  const [customEndYear, setCustomEndYear] = useState<string>("2025");
  
  // Usar la ubicación por defecto si no se proporciona una
  const locationData = location || defaultLocation;
  
  const { data, isLoading, error } = useQuery<HistoricalWeatherData>({
    queryKey: ['/api/weather/historical-precipitation', locationData.lat, locationData.lon, selectedPeriod, customStartYear, customEndYear],
    queryFn: async () => {
      let url = `/api/weather/historical-precipitation?lat=${locationData.lat}&lon=${locationData.lon}&period=${selectedPeriod}`;
      
      // Si el periodo es personalizado, incluir años inicio y fin
      if (selectedPeriod === 'custom') {
        url += `&startYear=${customStartYear}&endYear=${customEndYear}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener datos históricos de precipitaciones');
      }
      return response.json();
    },
    enabled: Boolean(location.lat && location.lon),
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
  });

  // Actualiza el año seleccionado cuando cambian los datos
  useEffect(() => {
    if (data && data.yearlyData.length > 0) {
      // Por defecto, mostrar todos los años
      setSelectedYear("all");
    }
  }, [data]);

  // Si está cargando, mostrar esqueleto
  if (isLoading) {
    return (
      <Card className="shadow-md mt-6">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertTitle>Error al cargar datos históricos</AlertTitle>
        <AlertDescription>
          No se pudieron obtener los datos históricos de precipitaciones. Por favor, intente nuevamente más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // Si no hay datos, no mostrar nada
  if (!data) return null;

  // Preparar datos para gráficos
  // 1. Gráfico de precipitación anual
  const yearlyChartData = {
    labels: data.yearlyData.map(year => year.year.toString()),
    datasets: [
      {
        label: 'Precipitación anual (mm)',
        data: data.yearlyData.map(year => year.precipitation),
        backgroundColor: barChartColors[0],
        borderColor: lineChartColors[0],
        borderWidth: 1
      }
    ]
  };

  // 2. Gráfico de promedios mensuales (todos los años)
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const monthlyAveragesChartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Promedio mensual (mm)',
        data: monthNames.map(month => data.monthlyAverages[month]),
        backgroundColor: barChartColors[1],
        borderColor: lineChartColors[1],
        borderWidth: 1
      }
    ]
  };

  // 3. Gráfico de datos mensuales por año seleccionado
  let monthlyDataByYear = {
    labels: monthNames,
    datasets: [] as any[]
  };

  if (selectedYear === "all") {
    // Datos de todos los años, uno por año
    monthlyDataByYear = {
      labels: monthNames,
      datasets: data.yearlyData.map((yearData, index) => ({
        label: yearData.year.toString(),
        data: monthNames.map(month => {
          const monthData = yearData.monthlyData.find(m => m.month === month);
          return monthData ? monthData.precipitation : 0;
        }),
        backgroundColor: barChartColors[index % barChartColors.length],
        borderColor: lineChartColors[index % lineChartColors.length],
        borderWidth: 1,
        fill: false,
        tension: 0.1
      }))
    };
  } else {
    // Datos solo del año seleccionado
    const yearData = data.yearlyData.find(y => y.year === parseInt(selectedYear));
    if (yearData) {
      monthlyDataByYear = {
        labels: monthNames,
        datasets: [
          {
            label: `Precipitación mensual ${yearData.year}`,
            data: monthNames.map(month => {
              const monthData = yearData.monthlyData.find(m => m.month === month);
              return monthData ? monthData.precipitation : 0;
            }),
            backgroundColor: barChartColors[0],
            borderColor: lineChartColors[0],
            borderWidth: 1
          }
        ]
      };
    }
  }

  // 4. Gráfico de los últimos 3 meses
  const recentMonthsChartData = {
    labels: data.recentMonths.map(m => m.month),
    datasets: [
      {
        label: 'Precipitación (mm)',
        data: data.recentMonths.map(m => m.precipitation),
        backgroundColor: barChartColors[2],
        borderColor: lineChartColors[2],
        borderWidth: 1
      }
    ]
  };

  // 5. Gráfico de comparación con promedio histórico
  // Para cada mes reciente, mostrar el valor actual vs el promedio histórico
  const comparisonChartData = {
    labels: data.recentMonths.map(m => m.month),
    datasets: [
      {
        label: 'Precipitación reciente',
        data: data.recentMonths.map(m => m.precipitation),
        backgroundColor: barChartColors[3],
        borderColor: lineChartColors[3],
        borderWidth: 1,
        stack: 'Stack 0',
      },
      {
        label: 'Promedio histórico',
        data: data.recentMonths.map(m => data.monthlyAverages[m.month]),
        backgroundColor: barChartColors[4],
        borderColor: lineChartColors[4],
        borderWidth: 1,
        stack: 'Stack 1',
      }
    ]
  };

  // Opciones para la selección de años
  const yearOptions = [
    { value: "all", label: "Todos los años" },
    ...data.yearlyData.map(year => ({
      value: year.year.toString(),
      label: year.year.toString()
    })).sort((a, b) => parseInt(b.value) - parseInt(a.value)) // Ordenar descendente
  ];

  return (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Historial de Precipitaciones en {location.name}</CardTitle>
        <CardDescription>
          Datos históricos de precipitaciones y análisis comparativo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <label className="text-sm text-neutral-500 mb-1 block">Período de datos</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10years">Últimos 10 años</SelectItem>
                <SelectItem value="20years">Últimos 20 años</SelectItem>
                <SelectItem value="30years">Últimos 30 años</SelectItem>
                <SelectItem value="50years">Últimos 50 años</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedPeriod === "custom" && (
            <div className="flex gap-2 items-center">
              <div>
                <label className="text-sm text-neutral-500 mb-1 block">Desde</label>
                <Select value={customStartYear} onValueChange={setCustomStartYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Año inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 76 }, (_, i) => 1950 + i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-neutral-500 mb-1 block">Hasta</label>
                <Select value={customEndYear} onValueChange={setCustomEndYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Año fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 76 }, (_, i) => 1950 + i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
            <TabsTrigger value="yearly">Anual</TabsTrigger>
            <TabsTrigger value="recent">Reciente</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Precipitación Mensual</h3>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="h-[400px]">
              {selectedYear === "all" ? (
                <Line 
                  data={monthlyDataByYear}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Precipitación mensual por año'
                      },
                      legend: {
                        position: 'top',
                      }
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'mm'
                        },
                        min: 0
                      }
                    }
                  }}
                />
              ) : (
                <Bar 
                  data={monthlyDataByYear}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: `Precipitación mensual - ${selectedYear}`
                      },
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'mm'
                        },
                        min: 0
                      }
                    }
                  }}
                />
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Promedio Mensual Histórico</h3>
              <div className="h-[300px]">
                <Bar 
                  data={monthlyAveragesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Promedios mensuales históricos'
                      },
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'mm'
                        },
                        min: 0
                      }
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="yearly" className="space-y-6">
            <h3 className="text-lg font-medium">Precipitación Anual</h3>
            <div className="h-[400px]">
              <Bar 
                data={yearlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Precipitación anual (20 años)'
                    },
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'mm'
                      },
                      min: 0
                    }
                  }
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="bg-slate-100 p-4 rounded-md">
                <p className="text-sm text-slate-500">Promedio anual</p>
                <p className="text-2xl font-bold">{data.totalAverage} mm</p>
              </div>
              <div className="bg-slate-100 p-4 rounded-md">
                <p className="text-sm text-slate-500">Año más húmedo</p>
                {(() => {
                  const maxYear = [...data.yearlyData].sort((a, b) => b.precipitation - a.precipitation)[0];
                  return (
                    <p className="text-2xl font-bold">{maxYear.year} <span className="text-lg">({maxYear.precipitation} mm)</span></p>
                  );
                })()}
              </div>
              <div className="bg-slate-100 p-4 rounded-md">
                <p className="text-sm text-slate-500">Año más seco</p>
                {(() => {
                  const minYear = [...data.yearlyData].sort((a, b) => a.precipitation - b.precipitation)[0];
                  return (
                    <p className="text-2xl font-bold">{minYear.year} <span className="text-lg">({minYear.precipitation} mm)</span></p>
                  );
                })()}
              </div>
              <div className="bg-slate-100 p-4 rounded-md">
                <p className="text-sm text-slate-500">Variabilidad</p>
                {(() => {
                  const maxPrecipitation = Math.max(...data.yearlyData.map(y => y.precipitation));
                  const minPrecipitation = Math.min(...data.yearlyData.map(y => y.precipitation));
                  const variabilityPercent = Math.round(((maxPrecipitation - minPrecipitation) / data.totalAverage) * 100);
                  return (
                    <p className="text-2xl font-bold">{variabilityPercent}%</p>
                  );
                })()}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-6">
            <h3 className="text-lg font-medium">Precipitación Reciente (Últimos 3 Meses)</h3>
            <div className="h-[300px]">
              <Bar 
                data={recentMonthsChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Precipitación reciente'
                    },
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'mm'
                      },
                      min: 0
                    }
                  }
                }}
              />
            </div>
            
            <h3 className="text-lg font-medium mt-6">Comparación con Promedios Históricos</h3>
            <div className="h-[300px]">
              <Bar 
                data={comparisonChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Comparación con promedios históricos'
                    },
                    legend: {
                      position: 'top'
                    }
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'mm'
                      },
                      min: 0,
                      stacked: false
                    },
                    x: {
                      stacked: false
                    }
                  }
                }}
              />
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800">Análisis y Tendencias</h3>
              {(() => {
                // Calcular tendencias
                const totalRecentPrecipitation = data.recentMonths.reduce((sum, m) => sum + m.precipitation, 0);
                const totalHistoricalAverage = data.recentMonths.reduce((sum, m) => sum + data.monthlyAverages[m.month], 0);
                const percentageDifference = Math.round((totalRecentPrecipitation - totalHistoricalAverage) / totalHistoricalAverage * 100);
                
                return (
                  <div className="text-blue-700 mt-2 space-y-2">
                    <p>
                      En los últimos 3 meses, las precipitaciones han sido 
                      <strong className={percentageDifference > 0 ? ' text-green-700' : percentageDifference < 0 ? ' text-red-700' : ' text-blue-700'}>
                        {' '}{percentageDifference > 0 ? `${percentageDifference}% superiores` : 
                              percentageDifference < 0 ? `${Math.abs(percentageDifference)}% inferiores` : 
                              'similares'}
                      </strong> 
                      {' '}al promedio histórico.
                    </p>
                    
                    {data.recentMonths.map((month, index) => {
                      const diff = month.precipitation - data.monthlyAverages[month.month];
                      const percentDiff = Math.round((diff / data.monthlyAverages[month.month]) * 100);
                      
                      return (
                        <p key={index}>
                          <strong>{month.month}:</strong> {month.precipitation} mm, 
                          <span className={diff > 0 ? ' text-green-700' : diff < 0 ? ' text-red-700' : ' text-blue-700'}>
                            {' '}{diff > 0 ? `${percentDiff}% más` : diff < 0 ? `${Math.abs(percentDiff)}% menos` : 'igual'}
                          </span> 
                          {' '}que el promedio histórico.
                        </p>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}