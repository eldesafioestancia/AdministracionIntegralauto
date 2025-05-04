import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Esquema de validación del formulario
const productFormSchema = z.object({
  name: z.string().min(1, { message: "El nombre del producto es requerido" }),
  category: z.string().min(1, { message: "La categoría es requerida" }),
  quantity: z.string().min(1, { message: "La cantidad es requerida" }),
  unit: z.string().min(1, { message: "La unidad es requerida" }),
  unitPrice: z.string().min(1, { message: "El precio unitario es requerido" }),
  notes: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// Lista de productos dummy (hasta que tengamos la API real)
const mockProducts = [
  {
    id: 1,
    name: "Aceite de motor",
    category: "fluidos",
    quantity: 8,
    unit: "litros",
    unitPrice: 2400,
    totalPrice: 19200,
  },
  {
    id: 2,
    name: "Aceite hidráulico",
    category: "fluidos",
    quantity: 0,
    unit: "litros",
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    id: 3,
    name: "Refrigerante",
    category: "fluidos",
    quantity: 0,
    unit: "litros",
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    id: 4,
    name: "Filtros",
    category: "repuestos",
    quantity: 0,
    unit: "unidades",
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    id: 5,
    name: "Correas",
    category: "repuestos",
    quantity: 0,
    unit: "unidades",
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    id: 6,
    name: "Gomería",
    category: "repuestos",
    quantity: 0,
    unit: "unidades",
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    id: 7,
    name: "Repuestos",
    category: "repuestos",
    quantity: 0,
    unit: "unidades",
    unitPrice: 0,
    totalPrice: 0,
  },
];

export default function Warehouse() {
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();

  // Usar datos reales cuando tengamos la API conectada
  // const { data: products, isLoading, error } = useQuery({
  //   queryKey: ["/api/warehouse/products"],
  // });
  
  // Usando datos simulados por ahora
  const products = mockProducts;
  const isLoading = false;
  const error = null;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "fluidos",
      quantity: "",
      unit: "litros",
      unitPrice: "",
      notes: "",
    },
  });

  async function onSubmit(values: ProductFormValues) {
    try {
      // Implementar cuando tengamos la API
      // await apiRequest("POST", "/api/warehouse/products", values);
      // queryClient.invalidateQueries({ queryKey: ["/api/warehouse/products"] });
      
      toast({
        title: "Producto agregado",
        description: "El producto ha sido agregado al inventario",
      });
      
      setSheetOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto",
        variant: "destructive",
      });
    }
  }

  const filteredProducts = products
    ? products.filter((product: any) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (isLoading) {
    return <div className="py-10 text-center">Cargando inventario...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Error al cargar el inventario</div>
        <Button 
          variant="outline" 
          onClick={() => {}/* queryClient.invalidateQueries({ queryKey: ["/api/warehouse/products"] }) */}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Gestión de Depósito</h1>
          <p className="text-neutral-400 text-sm">Administre el inventario de insumos, repuestos y materiales</p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nuevo producto
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Agregar nuevo producto</SheetTitle>
              <SheetDescription>
                Complete los datos del producto para agregarlo al inventario
              </SheetDescription>
            </SheetHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del producto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Aceite de motor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fluidos">Fluidos</SelectItem>
                          <SelectItem value="repuestos">Repuestos</SelectItem>
                          <SelectItem value="herramientas">Herramientas</SelectItem>
                          <SelectItem value="insumos">Insumos agrícolas</SelectItem>
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione unidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="litros">Litros</SelectItem>
                            <SelectItem value="unidades">Unidades</SelectItem>
                            <SelectItem value="kg">Kilogramos</SelectItem>
                            <SelectItem value="metros">Metros</SelectItem>
                            <SelectItem value="pares">Pares</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio unitario *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2400.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Notas adicionales sobre el producto"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <SheetFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSheetOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Filtro de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
      </div>
      
      {/* Tabla de productos */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Valor Unitario</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.quantity} {product.unit}</TableCell>
                  <TableCell>${product.unitPrice.toLocaleString()}</TableCell>
                  <TableCell>${product.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Agregar stock"
                      >
                        <i className="ri-add-circle-line text-green-500"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Quitar stock"
                      >
                        <i className="ri-subtract-circle-line text-amber-500"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Editar"
                      >
                        <i className="ri-pencil-line text-blue-500"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Eliminar"
                      >
                        <i className="ri-delete-bin-line text-red-500"></i>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-neutral-400">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}