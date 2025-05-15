import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface WeightHistoryChartProps {
  animalId: number;
}

interface WeightRecord {
  id: number;
  animalId: number;
  date: string;
  weight: string;
  notes: string | null;
  createdAt: string;
}

export default function WeightHistoryChart({ animalId }: WeightHistoryChartProps) {
  const { data: weights, isLoading } = useQuery({
    queryKey: [`/api/animal-weights?animalId=${animalId}`],
    enabled: !!animalId
  });

  const [formattedData, setFormattedData] = useState<any[]>([]);

  useEffect(() => {
    if (weights && Array.isArray(weights) && weights.length > 0) {
      // Formatear los datos para el gráfico
      const formattedWeights = weights.map((weight: WeightRecord) => ({
        date: format(parseISO(weight.date), 'dd/MM/yyyy'),
        peso: parseFloat(weight.weight),
        notas: weight.notes || '',
        dateRaw: weight.date // Para poder ordenar correctamente
      }));

      // Ordenar por fecha (de más antigua a más reciente)
      const sortedWeights = formattedWeights.sort((a: any, b: any) => 
        new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime()
      );

      setFormattedData(sortedWeights);
    }
  }, [weights]);

  if (isLoading) {
    return <div className="p-4 text-center">Cargando historial de peso...</div>;
  }

  if (!weights || !Array.isArray(weights) || weights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de peso</CardTitle>
          <CardDescription>Sin registros de peso</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          No hay registros de peso para este animal. Los datos de peso se registran durante los eventos veterinarios.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución de peso</CardTitle>
        <CardDescription>Histórico de pesos registrados (kg)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                domain={['auto', 'auto']} 
                label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                labelFormatter={(label) => `Fecha: ${label}`}
                formatter={(value: any, name: string) => {
                  if (name === 'peso') return [`${value} kg`, 'Peso'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="peso" 
                name="Peso (kg)" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}