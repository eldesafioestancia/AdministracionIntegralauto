import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WeightHistoryChart from "@/components/animals/WeightHistoryChart";

export default function AnimalDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("general");

  // Get animal details
  const { data: animal, isLoading: animalLoading, error: animalError } = useQuery({
    queryKey: [`/api/animals/${id}`],
  });

  // Get animal veterinary records
  const { data: veterinaryRecords, isLoading: veterinaryLoading } = useQuery({
    queryKey: [`/api/animal-veterinary?animalId=${id}`],
  });

  // Get animal finance records
  const { data: financeRecords, isLoading: financeLoading } = useQuery({
    queryKey: [`/api/animal-finances?animalId=${id}`],
  });
  
  // Get animal weight records
  const { data: weightRecords, isLoading: weightsLoading } = useQuery({
    queryKey: [`/api/animal-weights?animalId=${id}`],
  });

  const handleDeleteAnimal = async () => {
    if (!window.confirm("¿Está seguro que desea eliminar este animal? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/animals/${id}`, null);
      
      toast({
        title: "Animal eliminado",
        description: "El animal ha sido eliminado exitosamente",
      });
      
      navigate("/animals");
      
    } catch (error) {
      console.error("Error deleting animal:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el animal",
        variant: "destructive",
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "vaca": return "Vaca";
      case "toro": return "Toro";
      case "novillo": return "Novillo";
      case "ternero": return "Ternero";
      case "ternera": return "Ternera";
      default: return category;
    }
  };

  const getRaceLabel = (race: string) => {
    switch (race) {
      case "aberdeen": return "Aberdeen";
      case "angus": return "Angus";
      case "averdin_colorado": return "Averdin Colorado";
      case "averdin_negro": return "Averdin Negro";
      case "criollo": return "Criollo";
      case "limousin": return "Limousin";
      case "braford": return "Braford";
      case "hereford": return "Hereford";
      case "brangus": return "Brangus";
      case "brahman": return "Brahman";
      default: return race;
    }
  };

  const getReproductiveStatusLabel = (status: string) => {
    switch (status) {
      case "prenada": return "Preñada";
      case "vacia": return "Vacía";
      case "con_cria": return "Con cría";
      case "toro_en_servicio": return "Toro en servicio";
      default: return status;
    }
  };

  const getOriginLabel = (origin: string) => {
    switch (origin) {
      case "nacido_establecimiento": return "Nacido en el establecimiento";
      case "comprado": return "Comprado";
      default: return origin;
    }
  };

  const getVeterinaryTypeLabel = (type: string) => {
    switch (type) {
      case "separation": return "Separación";
      case "device_placement": return "Colocación dispositivo";
      case "device_removal": return "Retiro dispositivo";
      case "insemination": return "Inseminación";
      case "check": return "Control";
      case "visit": return "Visita veterinaria";
      case "birth": return "Parto";
      case "weaning": return "Destete";
      case "sale": return "Venta";
      case "vaccination": return "Vacunación";
      default: return type;
    }
  };

  if (animalLoading) {
    return <div className="py-10 text-center">Cargando información del animal...</div>;
  }

  if (animalError || !animal) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Error al cargar el animal</div>
        <Button
          variant="outline"
          onClick={() => navigate("/animals")}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-header font-bold text-neutral-500">
              Caravana #{animal.cartagena}
            </h1>
            <Badge>{getCategoryLabel(animal.category)}</Badge>
          </div>
          <p className="text-neutral-400">
            {getRaceLabel(animal.race)} - {animal.reproductiveStatus ? getReproductiveStatusLabel(animal.reproductiveStatus) : "Sin estado reproductivo"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/animals")}>
            <i className="ri-arrow-left-line mr-1"></i> Volver
          </Button>
          <Button variant="outline" onClick={() => navigate(`/animals/${id}/edit`)}>
            <i className="ri-edit-line mr-1"></i> Editar
          </Button>
          <Button variant="destructive" onClick={handleDeleteAnimal}>
            <i className="ri-delete-bin-line mr-1"></i> Eliminar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="general">Ficha general</TabsTrigger>
          <TabsTrigger value="history">Historial veterinario</TabsTrigger>
          <TabsTrigger value="finances">Finanzas</TabsTrigger>
        </TabsList>
        
        {/* Ficha General */}
        <TabsContent value="general" className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Identificación</CardTitle>
                <CardDescription>Información básica del animal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Nº de Caravana</div>
                    <div>{animal.cartagena}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Color caravana</div>
                    <div className="capitalize">{animal.cartagenaColor || "-"}{animal.cartagenaSecondaryColor ? ` / ${animal.cartagenaSecondaryColor}` : ''}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Categoría</div>
                    <div>{getCategoryLabel(animal.category)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Raza</div>
                    <div>{getRaceLabel(animal.race)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Fecha de nacimiento</div>
                    <div>{format(new Date(animal.birthDate), "dd/MM/yyyy")}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Estado reproductivo</div>
                    <div>{animal.reproductiveStatus ? getReproductiveStatusLabel(animal.reproductiveStatus) : "-"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-neutral-500 font-medium">Origen</div>
                  <div>{animal.origin ? getOriginLabel(animal.origin) : "-"}</div>
                </div>

                {animal.origin === "comprado" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-neutral-500 font-medium">Proveedor</div>
                      <div>{animal.supplier || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500 font-medium">Fecha de compra</div>
                      <div>{animal.purchaseDate ? format(new Date(animal.purchaseDate), "dd/MM/yyyy") : "-"}</div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-neutral-500 font-medium">Señales / Marcas particulares</div>
                  <div>{animal.marks || "-"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datos Productivos y Corporales</CardTitle>
                <CardDescription>Información de producción y condición física</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Peso actual (kg)</div>
                    <div>{animal.currentWeight || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Último control de peso</div>
                    <div>{animal.lastWeightDate ? format(new Date(animal.lastWeightDate), "dd/MM/yyyy") : "-"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-neutral-500 font-medium">Condición corporal (1-5)</div>
                  <div>{animal.bodyCondition || "-"}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Fecha último servicio</div>
                    <div>{animal.lastServiceDate ? format(new Date(animal.lastServiceDate), "dd/MM/yyyy") : "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Tipo de servicio</div>
                    <div>{animal.lastServiceType || "-"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-neutral-500 font-medium">Fecha probable de parto</div>
                  <div>{animal.expectedDeliveryDate ? format(new Date(animal.expectedDeliveryDate), "dd/MM/yyyy") : "-"}</div>
                </div>

                {(animal.motherId || animal.fatherId) && (
                  <div className="grid grid-cols-2 gap-4">
                    {animal.motherId && (
                      <div>
                        <div className="text-sm text-neutral-500 font-medium">ID Madre</div>
                        <div>{animal.motherId}</div>
                      </div>
                    )}
                    {animal.fatherId && (
                      <div>
                        <div className="text-sm text-neutral-500 font-medium">ID Padre</div>
                        <div>{animal.fatherId}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Gráfico de evolución de peso */}
          <div className="mt-6">
            <WeightHistoryChart animalId={Number(id)} />
          </div>

          <div className="flex justify-end space-x-3">
            <Button asChild>
              <a href={`/animals/${id}/veterinary`}>
                <i className="ri-stethoscope-line mr-1"></i> Registrar evento
              </a>
            </Button>
            <Button asChild>
              <a href={`/animals/${id}/weight`}>
                <i className="ri-scales-line mr-1"></i> Registrar peso
              </a>
            </Button>
          </div>
        </TabsContent>
        
        {/* Historial Veterinario */}
        <TabsContent value="history" className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Historial de eventos veterinarios</h3>
            <Button asChild>
              <a href={`/animals/${id}/veterinary`}>
                <i className="ri-stethoscope-line mr-1"></i> Registrar evento
              </a>
            </Button>
          </div>
          
          {veterinaryLoading ? (
            <div className="py-10 text-center">Cargando registros veterinarios...</div>
          ) : veterinaryRecords && veterinaryRecords.length > 0 ? (
            <div className="space-y-4">
              {veterinaryRecords.map((record: any) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{getVeterinaryTypeLabel(record.type)}</Badge>
                          <span className="text-sm text-neutral-500">{format(new Date(record.date), "dd/MM/yyyy")}</span>
                        </div>
                        <div className="text-neutral-700">{record.description}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-neutral-400 hover:text-neutral-600"
                        onClick={async () => {
                          if (window.confirm("¿Está seguro que desea eliminar este registro?")) {
                            try {
                              await apiRequest("DELETE", `/api/animal-veterinary/${record.id}`, null);
                              queryClient.invalidateQueries({ queryKey: [`/api/animal-veterinary?animalId=${id}`] });
                              toast({
                                title: "Registro eliminado",
                                description: "El registro ha sido eliminado exitosamente",
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "No se pudo eliminar el registro",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-neutral-500">
              No hay registros veterinarios para este animal.
            </div>
          )}
        </TabsContent>
        
        {/* Finanzas */}
        <TabsContent value="finances" className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Registros financieros</h3>
            <Button asChild>
              <a href={`/finances?openForm=true&type=income&category=animales&animalId=${id}`}>
                <i className="ri-money-dollar-circle-line mr-1"></i> Registrar transacción
              </a>
            </Button>
          </div>
          
          {financeLoading ? (
            <div className="py-10 text-center">Cargando registros financieros...</div>
          ) : financeRecords && financeRecords.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="text-left py-3 px-4 font-medium text-neutral-500">Fecha</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500">Concepto</th>
                        <th className="text-right py-3 px-4 font-medium text-neutral-500">Monto</th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeRecords.map((record: any) => (
                        <tr key={record.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="py-3 px-4">{format(new Date(record.date), "dd/MM/yyyy")}</td>
                          <td className="py-3 px-4 capitalize">{record.type === "income" ? "Ingreso" : "Gasto"}</td>
                          <td className="py-3 px-4">{record.concept}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={record.type === "income" ? "text-green-600" : "text-red-600"}>
                              {record.type === "income" ? "+" : "-"}${record.amount}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-neutral-400 hover:text-neutral-600 h-8 w-8"
                              onClick={async () => {
                                if (window.confirm("¿Está seguro que desea eliminar este registro?")) {
                                  try {
                                    await apiRequest("DELETE", `/api/animal-finances/${record.id}`, null);
                                    queryClient.invalidateQueries({ queryKey: [`/api/animal-finances?animalId=${id}`] });
                                    toast({
                                      title: "Registro eliminado",
                                      description: "El registro ha sido eliminado exitosamente",
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "No se pudo eliminar el registro",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="py-10 text-center text-neutral-500">
              No hay registros financieros para este animal.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}