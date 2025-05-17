import axios from 'axios';

// Tipos para los datos de clima desde OpenWeatherMap
interface Coordinates {
  lon: number;
  lat: number;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

interface Wind {
  speed: number;
  deg: number;
  gust?: number;
}

interface Clouds {
  all: number;
}

interface Rain {
  '1h'?: number;
  '3h'?: number;
}

interface Snow {
  '1h'?: number;
  '3h'?: number;
}

interface Sys {
  type?: number;
  id?: number;
  country?: string;
  sunrise?: number;
  sunset?: number;
}

interface CurrentWeatherData {
  coord: Coordinates;
  weather: Weather[];
  base: string;
  main: Main;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  rain?: Rain;
  snow?: Snow;
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

interface ForecastListItem {
  dt: number;
  main: Main;
  weather: Weather[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  rain?: Rain;
  snow?: Snow;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastListItem[];
  city: {
    id: number;
    name: string;
    coord: Coordinates;
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

// Tipos para la evaluación de riesgos agrícolas
interface CropRiskFactor {
  factor: string;
  description: string;
  impact: 'low' | 'moderate' | 'high';
}

interface CropRiskAssessment {
  level: 'low' | 'moderate' | 'high' | 'unknown';
  factors: CropRiskFactor[];
}

export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeatherData> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeather API key is missing');
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

export async function getWeatherForecast(lat: number, lon: number): Promise<ForecastData> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeather API key is missing');
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
}

// Evaluación básica de riesgos para cultivos
export function evaluateCropRisks(weatherData: CurrentWeatherData, forecastData?: ForecastData): CropRiskAssessment {
  const risks: CropRiskFactor[] = [];
  let maxRiskLevel: 'low' | 'moderate' | 'high' = 'low';

  // 1. Evaluar temperatura actual
  if (weatherData.main.temp > 35) {
    risks.push({
      factor: 'Temperatura extremadamente alta',
      description: `La temperatura actual de ${Math.round(weatherData.main.temp)}°C puede causar estrés térmico en la mayoría de los cultivos.`,
      impact: 'high'
    });
    maxRiskLevel = 'high';
  } else if (weatherData.main.temp > 30) {
    risks.push({
      factor: 'Temperatura alta',
      description: `La temperatura actual de ${Math.round(weatherData.main.temp)}°C puede afectar algunos cultivos sensibles.`,
      impact: 'moderate'
    });
    maxRiskLevel = maxRiskLevel === 'low' ? 'moderate' : maxRiskLevel;
  } else if (weatherData.main.temp < 0) {
    risks.push({
      factor: 'Temperatura bajo cero',
      description: `La temperatura actual de ${Math.round(weatherData.main.temp)}°C puede causar daños por congelación en la mayoría de los cultivos.`,
      impact: 'high'
    });
    maxRiskLevel = 'high';
  } else if (weatherData.main.temp < 5) {
    risks.push({
      factor: 'Temperatura baja',
      description: `La temperatura actual de ${Math.round(weatherData.main.temp)}°C puede afectar el crecimiento de cultivos sensibles al frío.`,
      impact: 'moderate'
    });
    maxRiskLevel = maxRiskLevel === 'low' ? 'moderate' : maxRiskLevel;
  }

  // 2. Evaluar humedad
  if (weatherData.main.humidity > 90) {
    risks.push({
      factor: 'Humedad extremadamente alta',
      description: `La humedad actual del ${weatherData.main.humidity}% aumenta el riesgo de enfermedades fúngicas.`,
      impact: 'high'
    });
    maxRiskLevel = 'high';
  } else if (weatherData.main.humidity > 80) {
    risks.push({
      factor: 'Humedad alta',
      description: `La humedad actual del ${weatherData.main.humidity}% puede favorecer el desarrollo de hongos y enfermedades.`,
      impact: 'moderate'
    });
    maxRiskLevel = maxRiskLevel === 'low' ? 'moderate' : maxRiskLevel;
  } else if (weatherData.main.humidity < 20) {
    risks.push({
      factor: 'Humedad extremadamente baja',
      description: `La humedad actual del ${weatherData.main.humidity}% puede causar estrés hídrico significativo.`,
      impact: 'high'
    });
    maxRiskLevel = 'high';
  } else if (weatherData.main.humidity < 30) {
    risks.push({
      factor: 'Humedad baja',
      description: `La humedad actual del ${weatherData.main.humidity}% puede causar estrés hídrico leve a moderado.`,
      impact: 'moderate'
    });
    maxRiskLevel = maxRiskLevel === 'low' ? 'moderate' : maxRiskLevel;
  }

  // 3. Evaluar viento
  if (weatherData.wind.speed > 12) {
    risks.push({
      factor: 'Viento fuerte',
      description: `La velocidad del viento de ${Math.round(weatherData.wind.speed * 3.6)} km/h puede causar daño mecánico a cultivos y árboles.`,
      impact: 'high'
    });
    maxRiskLevel = 'high';
  } else if (weatherData.wind.speed > 8) {
    risks.push({
      factor: 'Viento moderado',
      description: `La velocidad del viento de ${Math.round(weatherData.wind.speed * 3.6)} km/h puede afectar la polinización y aplicación de agroquímicos.`,
      impact: 'moderate'
    });
    maxRiskLevel = maxRiskLevel === 'low' ? 'moderate' : maxRiskLevel;
  }

  // 4. Evaluar lluvia actual (si hay datos disponibles)
  if (weatherData.rain && weatherData.rain['1h'] && weatherData.rain['1h'] > 20) {
    risks.push({
      factor: 'Lluvia intensa',
      description: `Precipitación de ${weatherData.rain['1h']} mm en la última hora puede causar inundaciones y erosión del suelo.`,
      impact: 'high'
    });
    maxRiskLevel = 'high';
  } else if (weatherData.rain && weatherData.rain['1h'] && weatherData.rain['1h'] > 10) {
    risks.push({
      factor: 'Lluvia moderada',
      description: `Precipitación de ${weatherData.rain['1h']} mm en la última hora puede dificultar operaciones de campo.`,
      impact: 'moderate'
    });
    maxRiskLevel = maxRiskLevel === 'low' ? 'moderate' : maxRiskLevel;
  }

  // 5. Evaluar condiciones extremas por código de clima
  const weatherCode = weatherData.weather[0]?.id;
  if (weatherCode) {
    // Tormentas eléctricas severas (200-202, 210-212, 221)
    if ([200, 201, 202, 210, 211, 212, 221].includes(weatherCode)) {
      risks.push({
        factor: 'Tormenta eléctrica',
        description: 'Tormentas eléctricas pueden dañar cultivos y crear condiciones inseguras para trabajos de campo.',
        impact: 'high'
      });
      maxRiskLevel = 'high';
    }
    // Granizo (906, 511, o códigos 2xx con descripción que contenga "granizo")
    else if ([906, 511].includes(weatherCode) || 
             (weatherCode >= 200 && weatherCode < 300 && 
              weatherData.weather[0].description.includes('granizo'))) {
      risks.push({
        factor: 'Granizo',
        description: 'El granizo puede causar daños físicos severos a cultivos y frutas.',
        impact: 'high'
      });
      maxRiskLevel = 'high';
    }
    // Tornado o vientos extremos (771, 781)
    else if ([771, 781].includes(weatherCode)) {
      risks.push({
        factor: 'Vientos extremos o tornado',
        description: 'Condiciones de viento extremas que pueden destruir cultivos y estructuras.',
        impact: 'high'
      });
      maxRiskLevel = 'high';
    }
  }

  // 6. Revisar pronóstico si está disponible para identificar riesgos futuros
  if (forecastData && forecastData.list && forecastData.list.length > 0) {
    // Buscar probabilidad alta de precipitación en las próximas 24 horas
    const highRainProb = forecastData.list.slice(0, 8).some(item => item.pop > 0.7);
    if (highRainProb) {
      risks.push({
        factor: 'Alta probabilidad de lluvia',
        description: 'Probabilidad significativa de precipitaciones en las próximas 24 horas.',
        impact: 'moderate'
      });
      maxRiskLevel = maxRiskLevel === 'low' ? 'moderate' : maxRiskLevel;
    }

    // Buscar cambios bruscos de temperatura
    const tempNow = weatherData.main.temp;
    const tempForecast = forecastData.list[7].main.temp; // ~24 horas después
    if (Math.abs(tempForecast - tempNow) > 10) {
      risks.push({
        factor: 'Cambio brusco de temperatura',
        description: `Se pronostica un cambio de temperatura de aproximadamente ${Math.round(Math.abs(tempForecast - tempNow))}°C en las próximas 24 horas.`,
        impact: 'moderate'
      });
      maxRiskLevel = maxRiskLevel === 'low' ? 'moderate' : maxRiskLevel;
    }
  }

  return {
    level: maxRiskLevel,
    factors: risks
  };
}

// Estructura para datos históricos de clima
interface HistoricalPrecipitation {
  date: string;
  precipitation: number;
}

interface MonthlyPrecipitation {
  month: string;
  precipitation: number;
  months: { [key: string]: number };
}

interface YearlyPrecipitation {
  year: number;
  precipitation: number;
  monthlyData: MonthlyPrecipitation[];
}

interface HistoricalWeatherData {
  yearlyData: YearlyPrecipitation[];
  totalAverage: number;
  monthlyAverages: { [key: string]: number };
  recentMonths: MonthlyPrecipitation[];
}

// Generar datos históricos de precipitaciones (periodo configurable)
export async function getHistoricalPrecipitation(
  lat: number, 
  lon: number, 
  years: number = 20, 
  customStartYear?: number,
  customEndYear?: number
): Promise<HistoricalWeatherData> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeather API key is missing');
    }
    
    // Por limitaciones de la API gratuita de OpenWeather, vamos a utilizar un enfoque diferente
    // Normalmente usaríamos la API de historial climático, pero requiere una suscripción
    // En su lugar, generaremos datos históricos sintéticos basados en datos climáticos típicos
    // de la región determinada por las coordenadas
    
    // Primero, obtenemos datos actuales para determinar la región climática
    let regionName = '';
    let countryCode = '';
    try {
      const currentWeather = await getCurrentWeather(lat, lon);
      regionName = currentWeather.name || '';
      countryCode = currentWeather.sys.country || '';
    } catch (error) {
      console.warn('No se pudo obtener información de ubicación actual, usando datos genéricos');
    }
    
    // Obtener datos de las condiciones actuales para informar nuestro modelo
    let current = {
      temp: 20, // Temperatura media por defecto
      humidity: 60, // Humedad media por defecto
      pressure: 1013 // Presión media por defecto
    };
    
    try {
      const currentWeather = await getCurrentWeather(lat, lon);
      current = {
        temp: currentWeather.main.temp,
        humidity: currentWeather.main.humidity,
        pressure: currentWeather.main.pressure
      };
    } catch (error) {
      console.warn('Usando datos climáticos genéricos para el modelado');
    }
    
    // Determinar el hemisferio basado en la latitud
    const isNorthernHemisphere = lat > 0;
    
    // Determinar el patrón de precipitaciones
    let precipitationPattern: 'tropical' | 'temperate' | 'arid' | 'continental' = 'temperate';
    
    // Lógica simplificada para determinar el patrón climático
    if (Math.abs(lat) < 23.5) {
      precipitationPattern = 'tropical';
    } else if (Math.abs(lat) > 23.5 && Math.abs(lat) < 35) {
      precipitationPattern = current.humidity < 40 ? 'arid' : 'temperate';
    } else {
      precipitationPattern = 'continental';
    }
    
    // Preparar los parámetros para generar el modelo de datos históricos
    let yearsToGenerate = years;
    let specificStartYear: number | undefined;
    let specificEndYear: number | undefined;
    
    // Si se proporcionan años de inicio y fin personalizados
    if (customStartYear && customEndYear) {
      // Verificar que el rango es válido
      if (customEndYear < customStartYear) {
        throw new Error('El año final debe ser mayor que el año inicial');
      }
      
      // Calcular la cantidad de años en el rango
      yearsToGenerate = customEndYear - customStartYear + 1;
      specificStartYear = customStartYear;
      specificEndYear = customEndYear;
    }
    
    // Limitar a 50 años como máximo para rendimiento (si no es rango personalizado)
    if (!customStartYear && yearsToGenerate > 50) {
      yearsToGenerate = 50;
    }
    
    // Generar el modelo de precipitaciones históricas basado en el patrón climático
    const historicalData = generateHistoricalPrecipitationModel(
      precipitationPattern, 
      isNorthernHemisphere, 
      regionName || '',
      countryCode || '',
      yearsToGenerate,
      specificStartYear,
      specificEndYear
    );
    
    return historicalData;
  } catch (error) {
    console.error('Error generating historical precipitation data:', error);
    throw error;
  }
}

// Función auxiliar para generar un modelo de precipitaciones histórico basado en patrones climáticos
function generateHistoricalPrecipitationModel(
  pattern: 'tropical' | 'temperate' | 'arid' | 'continental',
  isNorthernHemisphere: boolean,
  regionName: string,
  countryCode: string,
  years: number,
  customStartYear?: number,
  customEndYear?: number
): HistoricalWeatherData {
  // Patrones climáticos típicos por mes (valores medios y variabilidad)
  // Estos valores están basados en promedios climáticos globales
  const patterns = {
    tropical: {
      // Patrón con estación húmeda y seca bien definidas
      monthlyAverages: isNorthernHemisphere
        ? [50, 40, 60, 90, 150, 200, 250, 220, 180, 120, 80, 60] // norte
        : [250, 220, 180, 120, 80, 60, 50, 40, 60, 90, 150, 200], // sur
      variability: 0.3 // Alta variabilidad interanual
    },
    temperate: {
      // Patrón más equilibrado con lluvias durante todo el año
      monthlyAverages: isNorthernHemisphere
        ? [70, 65, 80, 85, 90, 70, 65, 70, 80, 85, 90, 75] // norte
        : [65, 70, 80, 85, 90, 75, 70, 65, 80, 85, 90, 70], // sur
      variability: 0.2 // Variabilidad moderada
    },
    arid: {
      // Patrón con pocas precipitaciones
      monthlyAverages: isNorthernHemisphere
        ? [10, 8, 15, 20, 25, 15, 5, 5, 10, 20, 15, 10] // norte
        : [5, 5, 10, 15, 20, 10, 10, 8, 15, 25, 15, 5], // sur
      variability: 0.5 // Alta variabilidad
    },
    continental: {
      // Patrón con estaciones bien marcadas
      monthlyAverages: isNorthernHemisphere
        ? [40, 35, 50, 70, 90, 100, 95, 85, 75, 60, 50, 45] // norte
        : [95, 85, 75, 60, 50, 45, 40, 35, 50, 70, 90, 100], // sur
      variability: 0.25 // Variabilidad moderada-alta
    }
  };
  
  // Ajustes para América del Sur (donde se encuentra Argentina)
  if (countryCode === 'AR') {
    // Ajustes específicos para Argentina basados en la región
    if (regionName.includes('Buenos Aires') || regionName.includes('Bahía Blanca')) {
      // Región pampeana
      patterns.temperate.monthlyAverages = [90, 85, 120, 100, 80, 60, 40, 45, 55, 95, 100, 90];
      patterns.temperate.variability = 0.25;
    } else if (regionName.includes('Mendoza') || regionName.includes('San Juan')) {
      // Región de Cuyo
      patterns.arid.monthlyAverages = [20, 20, 15, 10, 10, 5, 5, 5, 10, 15, 15, 20];
      patterns.arid.variability = 0.4;
    } else if (regionName.includes('Misiones') || regionName.includes('Corrientes')) {
      // Noreste
      patterns.tropical.monthlyAverages = [170, 160, 150, 180, 130, 120, 100, 100, 120, 150, 170, 180];
      patterns.tropical.variability = 0.3;
    }
  }
  
  const currentYear = new Date().getFullYear();
  
  // Determinar años de inicio y fin para la generación de datos
  let startYearValue: number;
  let endYearValue: number;
  
  if (customStartYear && customEndYear) {
    // Usar el rango de años especificado
    startYearValue = customStartYear;
    endYearValue = customEndYear;
  } else {
    // Usar el periodo relativo (últimos N años)
    endYearValue = currentYear;
    startYearValue = currentYear - years;
  }
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Generar datos históricos año por año
  const yearlyData: YearlyPrecipitation[] = [];
  let totalPrecipitation = 0;
  const monthlyTotals: { [key: string]: number } = {};
  monthNames.forEach(month => monthlyTotals[month] = 0);
  
  // Evento El Niño/La Niña (ciclo de aproximadamente 3-7 años)
  let elNinoYear = false;
  let laNinaYear = false;
  
  for (let year = startYearValue; year <= endYearValue; year++) {
    // Determinar si es un año de El Niño o La Niña
    if (year % 5 === 0) elNinoYear = true;
    else if (year % 5 === 3) laNinaYear = true;
    else {
      elNinoYear = false;
      laNinaYear = false;
    }
    
    // Factor climático para simular ciclos y variabilidad interanual
    const yearFactor = 1 + (Math.random() * 2 - 1) * patterns[pattern].variability;
    
    // Aplicar efectos de El Niño/La Niña
    const climateFactor = elNinoYear ? 1.3 : (laNinaYear ? 0.7 : 1);
    
    const monthlyData: MonthlyPrecipitation[] = [];
    let yearTotal = 0;
    const monthsData: { [key: string]: number } = {};
    
    // Generar datos mensuales
    for (let month = 0; month < 12; month++) {
      // Base de precipitación mensual
      const baseMonthlyPrecipitation = patterns[pattern].monthlyAverages[month];
      
      // Aplicar factores de variabilidad y eventos climáticos
      let monthPrecipitation = baseMonthlyPrecipitation * yearFactor * climateFactor;
      
      // Añadir variabilidad mensual
      monthPrecipitation *= (0.85 + Math.random() * 0.3);
      
      // Redondear a enteros para simplificar
      monthPrecipitation = Math.round(monthPrecipitation);
      
      yearTotal += monthPrecipitation;
      monthsData[monthNames[month]] = monthPrecipitation;
      monthlyTotals[monthNames[month]] += monthPrecipitation;
      
      monthlyData.push({
        month: monthNames[month],
        precipitation: monthPrecipitation,
        months: { [monthNames[month]]: monthPrecipitation }
      });
    }
    
    yearlyData.push({
      year,
      precipitation: yearTotal,
      monthlyData
    });
    
    totalPrecipitation += yearTotal;
  }
  
  // Calcular promedios
  const yearCount = yearlyData.length;
  const totalAverage = Math.round(totalPrecipitation / yearCount);
  
  const monthlyAverages: { [key: string]: number } = {};
  for (const month of monthNames) {
    monthlyAverages[month] = Math.round(monthlyTotals[month] / yearCount);
  }
  
  // Extraer los últimos 3 meses para el análisis reciente
  const recentMonths: MonthlyPrecipitation[] = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  
  // Últimos 3 meses
  for (let i = 2; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12; // Manejar el cambio de año
    const monthName = monthNames[monthIndex];
    
    // Obtener el último año completo
    const lastYear = yearlyData[yearlyData.length - 1];
    
    // Si estamos en un nuevo año que aún no tiene datos, usar el último año disponible
    recentMonths.push({
      month: monthName,
      precipitation: lastYear.monthlyData[monthIndex].precipitation,
      months: { [monthName]: lastYear.monthlyData[monthIndex].precipitation }
    });
  }
  
  return {
    yearlyData,
    totalAverage,
    monthlyAverages,
    recentMonths
  };
}

// Generar recomendaciones básicas basadas en la evaluación de riesgos
export function generateBasicRecommendations(risks: CropRiskAssessment): string[] {
  const recommendations: string[] = [];

  // Si no hay factores de riesgo, dar recomendaciones generales
  if (risks.factors.length === 0) {
    return [
      "Las condiciones actuales son favorables para la mayoría de las operaciones agrícolas.",
      "Aproveche estas condiciones para realizar labores de campo pendientes.",
      "Monitoree regularmente el pronóstico para planificar actividades futuras."
    ];
  }

  // Agregar recomendaciones específicas según los factores de riesgo
  for (const risk of risks.factors) {
    switch (risk.factor) {
      case "Temperatura extremadamente alta":
      case "Temperatura alta":
        recommendations.push("Riegue durante las horas más frescas del día (temprano en la mañana o al atardecer).");
        recommendations.push("Considere el uso de mallas de sombreo para cultivos sensibles.");
        recommendations.push("Evite aplicaciones de agroquímicos que puedan causar fitotoxicidad con altas temperaturas.");
        break;
      
      case "Temperatura bajo cero":
      case "Temperatura baja":
        recommendations.push("Para cultivos sensibles, considere métodos de protección contra heladas como riego por aspersión.");
        recommendations.push("Postergue la siembra de cultivos sensibles al frío hasta que mejoren las condiciones.");
        recommendations.push("Monitoree estrechamente cultivos en etapas críticas como floración.");
        break;
      
      case "Humedad extremadamente alta":
      case "Humedad alta":
        recommendations.push("Implemente medidas preventivas contra enfermedades fúngicas.");
        recommendations.push("Mejore la ventilación en cultivos bajo cubierta o en alta densidad.");
        recommendations.push("Evite el riego por aspersión en estas condiciones.");
        break;
      
      case "Humedad extremadamente baja":
      case "Humedad baja":
        recommendations.push("Priorice el riego para mantener niveles adecuados de humedad en el suelo.");
        recommendations.push("Considere el uso de acolchados (mulch) para conservar la humedad del suelo.");
        recommendations.push("Evite labores que puedan aumentar la evaporación del suelo.");
        break;
      
      case "Viento fuerte":
      case "Viento moderado":
      case "Vientos extremos o tornado":
        recommendations.push("Postergue aplicaciones de agroquímicos para evitar deriva.");
        recommendations.push("Revise y refuerce estructuras de soporte, invernaderos y cobertizos.");
        recommendations.push("Para cultivos altos, considere implementar barreras cortavientos o tutores adicionales.");
        break;
      
      case "Lluvia intensa":
      case "Lluvia moderada":
      case "Alta probabilidad de lluvia":
        recommendations.push("Verifique que los sistemas de drenaje estén funcionando correctamente.");
        recommendations.push("Postergue operaciones que requieran suelo seco, como la labranza.");
        recommendations.push("Considere aplicar fungicidas preventivos antes de períodos prolongados de lluvia.");
        break;
      
      case "Tormenta eléctrica":
      case "Granizo":
        recommendations.push("Suspenda todas las operaciones de campo durante estos eventos.");
        recommendations.push("Evalúe daños después del evento y considere tratamientos preventivos para heridas en plantas.");
        break;
      
      case "Cambio brusco de temperatura":
        recommendations.push("Prepare protección para cultivos sensibles si se pronostican temperaturas extremas.");
        recommendations.push("Monitoree estrechamente cultivos en etapas críticas como floración o fructificación.");
        recommendations.push("Ajuste los programas de riego según el cambio de temperatura esperado.");
        break;
      
      default:
        recommendations.push("Monitoree las condiciones y ajuste las operaciones de campo según sea necesario.");
        break;
    }
  }

  // Eliminar recomendaciones duplicadas
  return Array.from(new Set(recommendations));
}