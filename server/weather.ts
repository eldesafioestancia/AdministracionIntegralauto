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