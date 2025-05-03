import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addDays } from "date-fns";

// Esquema para el servicio de monta natural
const naturalServiceSchema = z.object({
  animalId: z.number({
    required_error: "El animal es requerido",
  }),
  animalCartagena: z.string().optional(),
  bullEntryDate: z.date({
    required_error: "La fecha de ingreso del toro es requerida",
  }),
  bullExitDate: z.date().optional().nullable(),
  bullId: z.number({
    required_error: "El toro es requerido",
  }),
  bullCartagena: z.string().optional(),
  pregnancyCheckDate: z.date().optional().nullable(),
  pregnancyResult: z.enum(["prenada", "vacia", "duda"]).optional(),
  dueDate: z.date().optional().nullable(),
  observations: z.string().optional(),
});

// Esquema para inseminación artificial
const artificialInseminationSchema = z.object({
  animalId: z.number({
    required_error: "El animal es requerido",
  }),
  animalCartagena: z.string().optional(),
  devicePlacementDate: z.date({
    required_error: "La fecha de colocación del dispositivo es requerida",
  }),
  deviceRemovalDate: z.date({
    required_error: "La fecha de retiro del dispositivo es requerida",
  }),
  inseminationDate: z.date({
    required_error: "La fecha de inseminación es requerida",
  }),
  bullId: z.number({
    required_error: "El toro (pajuela) es requerido",
  }),
  bullIdentification: z.string().optional(),
  pregnancyCheckDate: z.date().optional().nullable(),
  pregnancyResult: z.enum(["prenada", "vacia", "duda"]).optional(),
  dueDate: z.date().optional().nullable(),
  observations: z.string().optional(),
});

type NaturalServiceFormValues = z.infer<typeof naturalServiceSchema>;
type ArtificialInseminationFormValues = z.infer<typeof artificialInseminationSchema>;

export default function ReproductiveManagement() {
  const [activeTab, setActiveTab] = useState("natural");
  const [naturalSheetOpen, setNaturalSheetOpen] = useState(false);
  const [artificialSheetOpen, setArtificialSheetOpen] = useState(false);
  const { toast } = useToast();
  
  // Obtener listas de animales existentes
  const { data: animals = [], isLoading: animalsLoading } = useQuery({
    queryKey: ["/api/animals"],
  });
  
  const { data: naturalServices = [], isLoading: naturalServicesLoading } = useQuery({
    queryKey: ["/api/reproductive/natural"],
  });
  
  const { data: artificialServices = [], isLoading: artificialServicesLoading } = useQuery({
    queryKey: ["/api/reproductive/artificial"],
  });
  
  // Formulario para monta natural
  const naturalForm = useForm<NaturalServiceFormValues>({
    resolver: zodResolver(naturalServiceSchema),
    defaultValues: {
      animalId: 0,
      animalCartagena: "",
      bullEntryDate: new Date(),
      bullExitDate: null,
      bullId: 0,
      bullCartagena: "",
      pregnancyCheckDate: null,
      pregnancyResult: undefined,
      dueDate: null,
      observations: "",
    },
  });
  
  // Formulario para inseminación artificial
  const artificialForm = useForm<ArtificialInseminationFormValues>({
    resolver: zodResolver(artificialInseminationSchema),
    defaultValues: {
      animalId: 0,
      animalCartagena: "",
      devicePlacementDate: new Date(),
      deviceRemovalDate: new Date(),
      inseminationDate: new Date(),
      bullId: 0,
      bullIdentification: "",
      pregnancyCheckDate: null,
      pregnancyResult: undefined,
      dueDate: null,
      observations: "",
    },
  });
  
  // Función para calcular fecha probable de parto (283 días después del servicio)
  const calculateDueDate = (serviceDate: Date): Date => {
    return addDays(serviceDate, 283);
  };
  
  // Manejador para enviar formulario de monta natural
  async function onNaturalSubmit(values: NaturalServiceFormValues) {
    try {
      // Calcular fecha de parto si no está definida
      if (!values.dueDate && values.bullEntryDate) {
        values.dueDate = calculateDueDate(values.bullEntryDate);
      }
      
      await apiRequest("POST", "/api/reproductive/natural", values);
      
      // Invalidar consultas para actualizar listas
      queryClient.invalidateQueries({ queryKey: ["/api/reproductive/natural"] });
      
      toast({
        title: "Registro guardado",
        description: "El registro de servicio natural ha sido guardado exitosamente",
      });
      
      setNaturalSheetOpen(false);
      naturalForm.reset();
      
    } catch (error) {
      console.error("Error creando registro de servicio natural:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro de servicio natural",
        variant: "destructive",
      });
    }
  }
  
  // Manejador para enviar formulario de inseminación artificial
  async function onArtificialSubmit(values: ArtificialInseminationFormValues) {
    try {
      // Calcular fecha de parto si no está definida
      if (!values.dueDate && values.inseminationDate) {
        values.dueDate = calculateDueDate(values.inseminationDate);
      }
      
      await apiRequest("POST", "/api/reproductive/artificial", values);
      
      // Invalidar consultas para actualizar listas
      queryClient.invalidateQueries({ queryKey: ["/api/reproductive/artificial"] });
      
      toast({
        title: "Registro guardado",
        description: "El registro de inseminación artificial ha sido guardado exitosamente",
      });
      
      setArtificialSheetOpen(false);
      artificialForm.reset();
      
    } catch (error) {
      console.error("Error creando registro de inseminación artificial:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro de inseminación artificial",
        variant: "destructive",
      });
    }
  }
  
  // Función para obtener etiqueta de resultado de preñez
  const getPregnancyResultLabel = (result?: string) => {
    switch(result) {
      case "prenada": return "Preñada";
      case "vacia": return "Vacía";
      case "duda": return "En duda";
      default: return "No registrado";
    }
  };
  
  // Filtrar solo animales hembra (vacas y vaquillonas)
  const femaleAnimals = animals ? animals.filter((animal: any) => 
    animal.category === "vaca" || animal.category === "vaquillona"
  ) : [];
  
  // Filtrar solo toros
  const bulls = animals ? animals.filter((animal: any) => 
    animal.category === "toro"
  ) : [];
  
  // Buscar detalles del animal por ID
  const findAnimalById = (id: number) => {
    return animals?.find((animal: any) => animal.id === id);
  };
  
  if (animalsLoading || naturalServicesLoading || artificialServicesLoading) {
    return <div className="py-10 text-center">Cargando datos...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Manejo Reproductivo</h1>
          <p className="text-neutral-400 text-sm">Registros de servicios naturales e inseminación artificial</p>
        </div>
      </div>
      
      {/* Pestañas */}
      <Tabs defaultValue="natural" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="natural">Monta Natural</TabsTrigger>
          <TabsTrigger value="artificial">Inseminación Artificial</TabsTrigger>
        </TabsList>
        
        {/* Contenido para Monta Natural */}
        <TabsContent value="natural" className="space-y-4">
          <div className="flex justify-end">
            <Sheet open={naturalSheetOpen} onOpenChange={setNaturalSheetOpen}>
              <SheetTrigger asChild>
                <Button>
                  <i className="ri-add-line mr-1"></i> Nuevo Registro
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Registro de Monta Natural</SheetTitle>
                  <SheetDescription>
                    Complete los datos del servicio natural
                  </SheetDescription>
                </SheetHeader>
                
                <Form {...naturalForm}>
                  <form onSubmit={naturalForm.handleSubmit(onNaturalSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={naturalForm.control}
                      name="animalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Animal (Hembra)</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));
                              // Actualizar el número de caravana
                              const animal = findAnimalById(parseInt(value));
                              if (animal) {
                                naturalForm.setValue("animalCartagena", animal.cartagena);
                              }
                            }}
                            value={field.value ? field.value.toString() : ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un animal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {femaleAnimals.map((animal: any) => (
                                <SelectItem key={animal.id} value={animal.id.toString()}>
                                  #{animal.cartagena} ({animal.category === "vaca" ? "Vaca" : "Vaquillona"})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={naturalForm.control}
                      name="bullId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Toro</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));
                              // Actualizar el número de caravana
                              const bull = findAnimalById(parseInt(value));
                              if (bull) {
                                naturalForm.setValue("bullCartagena", bull.cartagena);
                              }
                            }}
                            value={field.value ? field.value.toString() : ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un toro" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bulls.map((bull: any) => (
                                <SelectItem key={bull.id} value={bull.id.toString()}>
                                  #{bull.cartagena} ({bull.race})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={naturalForm.control}
                        name="bullEntryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha ingreso toro</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                {...field}
                                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  const date = e.target.value ? new Date(e.target.value) : null;
                                  field.onChange(date);
                                  
                                  // Calcular automáticamente fecha probable de parto
                                  if (date) {
                                    const dueDate = calculateDueDate(date);
                                    naturalForm.setValue("dueDate", dueDate);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={naturalForm.control}
                        name="bullExitDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha retiro toro</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                {...field}
                                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  const date = e.target.value ? new Date(e.target.value) : null;
                                  field.onChange(date);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={naturalForm.control}
                        name="pregnancyCheckDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de tacto</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                {...field}
                                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  const date = e.target.value ? new Date(e.target.value) : null;
                                  field.onChange(date);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={naturalForm.control}
                        name="pregnancyResult"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resultado del tacto</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione resultado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="prenada">Preñada</SelectItem>
                                <SelectItem value="vacia">Vacía</SelectItem>
                                <SelectItem value="duda">En duda</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={naturalForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha probable de parto</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : null;
                                field.onChange(date);
                              }}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={naturalForm.control}
                      name="observations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <Input placeholder="Observaciones adicionales" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <SheetFooter className="pt-4">
                      <Button type="submit">Guardar registro</Button>
                    </SheetFooter>
                  </form>
                </Form>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Tabla de servicios naturales */}
          <Card>
            <Table>
              <TableCaption>Lista de servicios naturales registrados</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Toro</TableHead>
                  <TableHead>Ingreso toro</TableHead>
                  <TableHead>Retiro toro</TableHead>
                  <TableHead>Fecha tacto</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Fecha prob. parto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {naturalServices && naturalServices.length > 0 ? (
                  naturalServices.map((service: any) => (
                    <TableRow key={service.id}>
                      <TableCell>#{service.animalCartagena}</TableCell>
                      <TableCell>#{service.bullCartagena}</TableCell>
                      <TableCell>{format(new Date(service.bullEntryDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{service.bullExitDate ? format(new Date(service.bullExitDate), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>{service.pregnancyCheckDate ? format(new Date(service.pregnancyCheckDate), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>
                        {service.pregnancyResult && (
                          <Badge className={
                            service.pregnancyResult === "prenada" ? "bg-green-100 text-green-800" :
                            service.pregnancyResult === "vacia" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }>
                            {getPregnancyResultLabel(service.pregnancyResult)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{service.dueDate ? format(new Date(service.dueDate), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" title="Editar">
                          <i className="ri-edit-line"></i>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">No hay registros de servicios naturales</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        {/* Contenido para Inseminación Artificial */}
        <TabsContent value="artificial" className="space-y-4">
          <div className="flex justify-end">
            <Sheet open={artificialSheetOpen} onOpenChange={setArtificialSheetOpen}>
              <SheetTrigger asChild>
                <Button>
                  <i className="ri-add-line mr-1"></i> Nuevo Registro
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Registro de Inseminación Artificial</SheetTitle>
                  <SheetDescription>
                    Complete los datos del servicio de inseminación
                  </SheetDescription>
                </SheetHeader>
                
                <Form {...artificialForm}>
                  <form onSubmit={artificialForm.handleSubmit(onArtificialSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={artificialForm.control}
                      name="animalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Animal (Hembra)</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));
                              // Actualizar el número de caravana
                              const animal = findAnimalById(parseInt(value));
                              if (animal) {
                                artificialForm.setValue("animalCartagena", animal.cartagena);
                              }
                            }}
                            value={field.value ? field.value.toString() : ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un animal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {femaleAnimals.map((animal: any) => (
                                <SelectItem key={animal.id} value={animal.id.toString()}>
                                  #{animal.cartagena} ({animal.category === "vaca" ? "Vaca" : "Vaquillona"})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={artificialForm.control}
                        name="devicePlacementDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Colocación dispositivo</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                {...field}
                                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  const date = e.target.value ? new Date(e.target.value) : null;
                                  field.onChange(date);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={artificialForm.control}
                        name="deviceRemovalDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retiro dispositivo</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                {...field}
                                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  const date = e.target.value ? new Date(e.target.value) : null;
                                  field.onChange(date);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={artificialForm.control}
                      name="inseminationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de inseminación</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : null;
                                field.onChange(date);
                                
                                // Calcular automáticamente fecha probable de parto
                                if (date) {
                                  const dueDate = calculateDueDate(date);
                                  artificialForm.setValue("dueDate", dueDate);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={artificialForm.control}
                        name="bullId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Toro (Pajuela)</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(parseInt(value));
                                // Actualizar la identificación
                                const bull = findAnimalById(parseInt(value));
                                if (bull) {
                                  artificialForm.setValue("bullIdentification", bull.cartagena);
                                }
                              }}
                              value={field.value ? field.value.toString() : ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un toro" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {bulls.map((bull: any) => (
                                  <SelectItem key={bull.id} value={bull.id.toString()}>
                                    #{bull.cartagena} ({bull.race})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={artificialForm.control}
                        name="bullIdentification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Identificación pajuela</FormLabel>
                            <FormControl>
                              <Input placeholder="Código de pajuela" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={artificialForm.control}
                        name="pregnancyCheckDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de tacto</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                {...field}
                                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  const date = e.target.value ? new Date(e.target.value) : null;
                                  field.onChange(date);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={artificialForm.control}
                        name="pregnancyResult"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resultado del tacto</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione resultado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="prenada">Preñada</SelectItem>
                                <SelectItem value="vacia">Vacía</SelectItem>
                                <SelectItem value="duda">En duda</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={artificialForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha probable de parto</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : null;
                                field.onChange(date);
                              }}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={artificialForm.control}
                      name="observations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <Input placeholder="Observaciones adicionales" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <SheetFooter className="pt-4">
                      <Button type="submit">Guardar registro</Button>
                    </SheetFooter>
                  </form>
                </Form>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Tabla de inseminaciones */}
          <Card>
            <Table>
              <TableCaption>Lista de inseminaciones artificiales registradas</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Colocación</TableHead>
                  <TableHead>Retiro</TableHead>
                  <TableHead>Inseminación</TableHead>
                  <TableHead>Pajuela</TableHead>
                  <TableHead>Fecha tacto</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Fecha prob. parto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artificialServices && artificialServices.length > 0 ? (
                  artificialServices.map((service: any) => (
                    <TableRow key={service.id}>
                      <TableCell>#{service.animalCartagena}</TableCell>
                      <TableCell>{format(new Date(service.devicePlacementDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(new Date(service.deviceRemovalDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(new Date(service.inseminationDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{service.bullIdentification}</TableCell>
                      <TableCell>{service.pregnancyCheckDate ? format(new Date(service.pregnancyCheckDate), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>
                        {service.pregnancyResult && (
                          <Badge className={
                            service.pregnancyResult === "prenada" ? "bg-green-100 text-green-800" :
                            service.pregnancyResult === "vacia" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }>
                            {getPregnancyResultLabel(service.pregnancyResult)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{service.dueDate ? format(new Date(service.dueDate), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" title="Editar">
                          <i className="ri-edit-line"></i>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">No hay registros de inseminación artificial</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}