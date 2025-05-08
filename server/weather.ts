import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Interfaz para la respuesta del clima actual
export interface CurrentWeatherResponse {
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  name: string;
}

// Interfaz para el pronóstico del clima
export interface ForecastResponse {
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
    };
    visibility: number;
    pop: number; // Probabilidad de precipitación
    rain?: {
      '3h'?: number;
    };
    sys: {
      pod: string;
    };
    dt_txt: string;
  }[];
  city: {
    id: number;
    name: string;
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

// Evaluación de riesgo para cultivos basada en condiciones climáticas
export interface CropRiskAssessment {
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  riskFactors: {
    factor: string;
    description: string;
    impact: 'low' | 'moderate' | 'high';
  }[];
  recommendations: string[];
}

// Función para obtener el clima actual por ubicación
export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeatherResponse> {
  try {
    const response = await axios.get(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw new Error('No se pudo obtener la información del clima actual');
  }
}

// Función para obtener el pronóstico del clima
export async function getWeatherForecast(lat: number, lon: number): Promise<ForecastResponse> {
  try {
    const response = await axios.get(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw new Error('No se pudo obtener el pronóstico del clima');
  }
}

// Función para evaluar los riesgos para cultivos basados en condiciones climáticas
export function assessCropRisks(weather: CurrentWeatherResponse, forecast: ForecastResponse): CropRiskAssessment {
  const riskFactors = [];
  let overallRiskLevel: 'low' | 'moderate' | 'high' | 'severe' = 'low';
  const recommendations = [];

  // Evaluar temperatura actual
  if (weather.main.temp > 35) {
    riskFactors.push({
      factor: 'Temperatura extremadamente alta',
      description: 'Las temperaturas superiores a 35°C pueden causar estrés térmico en los cultivos',
      impact: 'high'
    });
    recommendations.push('Implementar riego adicional durante las horas más frescas del día');
    recommendations.push('Considerar mallas de sombreo para cultivos sensibles');
    overallRiskLevel = 'high';
  } else if (weather.main.temp > 30) {
    riskFactors.push({
      factor: 'Temperatura alta',
      description: 'Las temperaturas entre 30-35°C pueden reducir la eficiencia fotosintética en algunos cultivos',
      impact: 'moderate'
    });
    recommendations.push('Monitorear la humedad del suelo y ajustar el riego según sea necesario');
    if (overallRiskLevel === 'low') overallRiskLevel = 'moderate';
  }

  if (weather.main.temp < 0) {
    riskFactors.push({
      factor: 'Temperatura bajo cero',
      description: 'Las heladas pueden dañar severamente los tejidos de las plantas',
      impact: 'high'
    });
    recommendations.push('Implementar medidas de protección contra heladas como cubiertas o calentadores');
    recommendations.push('Posponer la siembra de cultivos sensibles');
    overallRiskLevel = 'high';
  } else if (weather.main.temp < 5) {
    riskFactors.push({
      factor: 'Temperatura baja',
      description: 'Temperaturas entre 0-5°C pueden ralentizar el crecimiento de muchos cultivos',
      impact: 'moderate'
    });
    recommendations.push('Monitorear pronósticos de heladas y preparar medidas preventivas');
    if (overallRiskLevel === 'low') overallRiskLevel = 'moderate';
  }

  // Evaluar humedad
  if (weather.main.humidity > 90) {
    riskFactors.push({
      factor: 'Humedad extremadamente alta',
      description: 'La alta humedad favorece el desarrollo de enfermedades fúngicas',
      impact: 'high'
    });
    recommendations.push('Aplicar fungicidas preventivos');
    recommendations.push('Mejorar la ventilación en cultivos bajo cubierta');
    overallRiskLevel = 'high';
  } else if (weather.main.humidity > 75) {
    riskFactors.push({
      factor: 'Humedad alta',
      description: 'Condiciones favorables para enfermedades en cultivos susceptibles',
      impact: 'moderate'
    });
    recommendations.push('Monitorear signos de enfermedades fúngicas');
    if (overallRiskLevel === 'low') overallRiskLevel = 'moderate';
  } else if (weather.main.humidity < 30) {
    riskFactors.push({
      factor: 'Humedad baja',
      description: 'La baja humedad puede causar estrés hídrico en las plantas',
      impact: 'moderate'
    });
    recommendations.push('Considerar riego adicional para compensar la baja humedad ambiental');
    if (overallRiskLevel === 'low') overallRiskLevel = 'moderate';
  }

  // Evaluar viento
  if (weather.wind.speed > 15) {
    riskFactors.push({
      factor: 'Viento fuerte',
      description: 'Vientos superiores a 15 m/s pueden causar daño mecánico a los cultivos',
      impact: 'high'
    });
    recommendations.push('Instalar cortavientos o protecciones temporales');
    recommendations.push('Posponer aplicaciones de pesticidas o fertilizantes foliares');
    overallRiskLevel = 'high';
  } else if (weather.wind.speed > 10) {
    riskFactors.push({
      factor: 'Viento moderado a fuerte',
      description: 'Vientos entre 10-15 m/s pueden afectar la polinización y causar estrés mecánico',
      impact: 'moderate'
    });
    recommendations.push('Evitar fumigaciones o aplicaciones foliares');
    if (overallRiskLevel === 'low') overallRiskLevel = 'moderate';
  }

  // Evaluar probabilidad de lluvia en el pronóstico
  const next24Hours = forecast.list.slice(0, 8); // Próximas 24 horas (intervalos de 3 horas)
  const highPrecipitation = next24Hours.some(period => period.pop > 0.5 || (period.rain && period.rain['3h'] > 5));
  
  if (highPrecipitation) {
    riskFactors.push({
      factor: 'Probabilidad alta de precipitaciones',
      description: 'Se esperan precipitaciones significativas en las próximas 24 horas',
      impact: 'moderate'
    });
    recommendations.push('Posponer actividades de siembra o cosecha');
    recommendations.push('Asegurar buen drenaje en áreas propensas a encharcamiento');
    if (overallRiskLevel === 'low') overallRiskLevel = 'moderate';
  }

  // Evaluar alertas de clima extremo
  const severeWeatherCodes = [202, 212, 221, 504, 511, 522, 602, 622, 781];
  const hasSevereWeather = weather.weather.some(w => severeWeatherCodes.includes(w.id));
  
  if (hasSevereWeather) {
    riskFactors.push({
      factor: 'Alerta de clima severo',
      description: 'Condiciones de clima extremo detectadas (tormentas eléctricas, granizo, etc.)',
      impact: 'high'
    });
    recommendations.push('Implementar medidas de emergencia para proteger cultivos');
    recommendations.push('Monitorear constantemente las actualizaciones del pronóstico');
    overallRiskLevel = 'severe';
  }

  // Si no hay riesgos específicos, proporcionar recomendaciones generales
  if (riskFactors.length === 0) {
    recommendations.push('Condiciones favorables para la mayoría de actividades agrícolas');
    recommendations.push('Continuar con prácticas normales de manejo de cultivos');
  }

  return {
    riskLevel: overallRiskLevel,
    riskFactors,
    recommendations
  };
}