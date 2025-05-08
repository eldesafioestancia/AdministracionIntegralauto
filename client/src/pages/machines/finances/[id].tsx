import React, { useState } from 'react';
import { useParams, useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, FileText, Trash2, ArrowLeft } from 'lucide-react';
import MachineFinanceForm from '@/components/machines/MachineFinanceForm';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(Number(amount));
};

export default function MachineFinancesPage() {
  const params = useParams();
  const [, navigate] = useRoute();
  const machineId = parseInt(params.id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Consultas para obtener datos
  const { data: machine, isLoading: isLoadingMachine } = useQuery({ 
    queryKey: ['/api/machines', machineId],
    enabled: !isNaN(machineId)
  });
  
  const { 
    data: finances, 
    isLoading: isLoadingFinances,
    isError,
    error 
  } = useQuery({ 
    queryKey: ['/api/machine-finances'],
    queryFn: async () => {
      const response = await fetch(`/api/machine-finances?machineId=${machineId}`);
      if (!response.ok) {
        throw new Error('Error al cargar los datos financieros');
      }
      return response.json();
    },
    enabled: !isNaN(machineId)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/machine-finances/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Registro eliminado",
        description: "El registro financiero ha sido eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/machine-finances'] });
    },
    onError: (error) => {
      console.error("Error eliminando registro:", error);
      toast({
        title: "Error",
        description: "Hubo un error al eliminar el registro financiero",
        variant: "destructive",
      });
    },
  });
  
  // Procesar y calcular datos financieros
  const calculateTotals = () => {
    if (!finances) return { income: 0, expense: 0, balance: 0 };
    
    const income = finances
      .filter(f => f.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0);
      
    const expense = finances
      .filter(f => f.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0);
      
    return {
      income,
      expense,
      balance: income - expense
    };
  };
  
  const totals = calculateTotals();
  
  if (isLoadingMachine || isLoadingFinances) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600 mb-4">Error al cargar los datos: {String(error)}</p>
        <Button onClick={() => navigate('/machines')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Maquinaria
        </Button>
      </div>
    );
  }
  
  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">No se encontró la máquina solicitada</p>
        <Button onClick={() => navigate('/machines')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Maquinaria
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Button
            variant="outline"
            className="mb-4 md:mb-0"
            onClick={() => navigate('/machines')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold mt-2">
            Finanzas: {machine.brand} {machine.model}
          </h1>
          <p className="text-muted-foreground">
            Gestión financiera y registros económicos de la maquinaria
          </p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo registro
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Nuevo registro financiero</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <MachineFinanceForm 
                machineId={machineId} 
                onSuccess={() => setSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600">Ingresos</CardTitle>
            <CardDescription>Total de ingresos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totals.income.toString())}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600">Egresos</CardTitle>
            <CardDescription>Total de gastos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totals.expense.toString())}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={totals.balance >= 0 ? "text-blue-600" : "text-amber-600"}>Balance</CardTitle>
            <CardDescription>Ingresos - Egresos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totals.balance >= 0 ? "text-blue-600" : "text-amber-600"}`}>
              {formatCurrency(totals.balance.toString())}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="expense">Egresos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <FinancesTable 
            finances={finances || []} 
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        </TabsContent>
        
        <TabsContent value="income" className="mt-4">
          <FinancesTable 
            finances={(finances || []).filter(f => f.type === 'income')} 
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        </TabsContent>
        
        <TabsContent value="expense" className="mt-4">
          <FinancesTable 
            finances={(finances || []).filter(f => f.type === 'expense')} 
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FinancesTableProps {
  finances: any[];
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

function FinancesTable({ finances, onDelete, isDeleting }: FinancesTableProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  
  if (finances.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md bg-gray-50">
        <p className="text-gray-500">No hay registros para mostrar</p>
      </div>
    );
  }
  
  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-center">Archivo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finances.map((finance) => (
                <TableRow key={finance.id}>
                  <TableCell>{format(new Date(finance.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={finance.type === 'income' ? 'outline' : 'secondary'}>
                      {finance.type === 'income' ? 'Ingreso' : 'Egreso'}
                    </Badge>
                  </TableCell>
                  <TableCell>{finance.concept}</TableCell>
                  <TableCell>
                    {finance.paymentMethod === 'cash' && 'Efectivo'}
                    {finance.paymentMethod === 'deposit' && 'Depósito'}
                    {finance.paymentMethod === 'transfer' && 'Transferencia'}
                    {finance.paymentMethod === 'check' && 'Cheque'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(finance.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    {finance.attachmentFile ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Mostrar el documento (puede ser un enlace o abrirse en una nueva pestaña)
                          window.open(finance.attachmentFile, '_blank');
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente el registro financiero 
                            y no puede deshacerse.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(finance.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}