import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Interfaces para los datos financieros por área
export interface AreaFinancialData {
  name: string;
  income: number;
  expense: number;
  balance: number;
}

export interface FinancialSummary {
  animals: { income: number; expense: number; total: number };
  machines: { income: number; expense: number; total: number };
  pastures: { income: number; expense: number; total: number };
  investments: { income: number; expense: number; total: number };
  capital: { income: number; expense: number; total: number };
  overall: { income: number; expense: number; total: number };
}

interface FinancialAreaBreakdownProps {
  financialAreaData: AreaFinancialData[];
  financialSummary: FinancialSummary;
}

export default function FinancialAreaBreakdown({ 
  financialAreaData, 
  financialSummary 
}: FinancialAreaBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <i className="ri-line-chart-line mr-2 text-xl text-purple-500"></i> Balance Financiero por Áreas
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          {financialAreaData.map((area, index) => (
            <div key={index} className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{area.name}</h3>
                <span className={`text-sm px-2 py-0.5 rounded ${area.balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {area.balance >= 0 ? 'Ganancia' : 'Pérdida'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-xs text-gray-500">Ingresos</div>
                  <div className="text-sm font-semibold text-green-600">${area.income.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Gastos</div>
                  <div className="text-sm font-semibold text-red-600">${area.expense.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Balance</div>
                  <div className={`text-sm font-semibold ${area.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(area.balance).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ 
                      width: `${area.income > 0 ? (area.income / (area.income + area.expense)) * 100 : 0}%` 
                    }}
                  ></div>
                  <div 
                    className="bg-red-500 h-full" 
                    style={{ 
                      width: `${area.expense > 0 ? (area.expense / (area.income + area.expense)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-5 border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Balance total</h3>
              <span className={`text-sm px-2 py-0.5 rounded ${financialSummary.overall.total >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                ${Math.abs(financialSummary.overall.total).toLocaleString()} 
                <span className="ml-1">
                  ({financialSummary.overall.total >= 0 ? 'ganancia' : 'pérdida'})
                </span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href="/finances">
            <i className="ri-bar-chart-grouped-line mr-1"></i> Ver análisis detallado
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}