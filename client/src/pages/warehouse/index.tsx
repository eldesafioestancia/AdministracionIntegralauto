import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  {
    id: 8,
    name: "Mecánico",
    category: "servicios",
    quantity: 0,
    unit: "horas",
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    id: 9,
    name: "Rollo",
    category: "forraje",
    quantity: 0,
    unit: "unidades",
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    id: 10,
    name: "Maíz",
    category: "forraje",
    quantity: 0,
    unit: "kg",
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    id: 11,
    name: "Hilo para rollos",
    category: "insumos",
    quantity: 0,
    unit: "rollos",
    unitPrice: 0,
    totalPrice: 0,
  },
];

export default function Warehouse() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [removeStockOpen, setRemoveStockOpen] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const { toast } = useToast();

  // Usar datos reales cuando tengamos la API conectada
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["/api/warehouse/products"],
  });

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

  // Configuración del formulario para editar productos
  useEffect(() => {
    if (editProduct) {
      form.reset({
        name: editProduct.name,
        category: editProduct.category,
        quantity: String(editProduct.quantity),
        unit: editProduct.unit,
        unitPrice: String(editProduct.unitPrice),
        notes: editProduct.notes || "",
      });
    } else {
      form.reset({
        name: "",
        category: "fluidos",
        quantity: "",
        unit: "litros",
        unitPrice: "",
        notes: "",
      });
    }
  }, [editProduct, form]);

  // Función para agregar un nuevo producto
  async function onSubmit(values: ProductFormValues) {
    try {
      // Simulamos una actualización de productos (en lugar de una API real por ahora)
      // En una implementación completa, aquí se llamaría a una API para actualizar el producto
      
      // Notificar cambios en los datos
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse/products"] });
      
      setSheetOpen(false);
      setEditProduct(null);
      form.reset();
      
      toast({
        title: editProduct ? "Producto actualizado" : "Producto agregado",
        description: editProduct 
          ? "El producto ha sido actualizado correctamente" 
          : "El producto ha sido agregado al inventario",
      });
      
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      });
    }
  }

  // Función para agregar stock a un producto
  const handleAddStock = async () => {
    if (!selectedProductId || !stockQuantity) return;
    
    try {
      // En una implementación real, aquí llamaríamos a una API para actualizar el stock
      // Por ahora, simplemente refrescamos los datos después de una pausa simulada
      
      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Notificar cambios en los datos
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse/products"] });
      
      setAddStockOpen(false);
      setStockQuantity("");
      setSelectedProductId(null);
      
      toast({
        title: "Stock actualizado",
        description: `Se ha actualizado el stock del producto correctamente`,
      });
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock del producto",
        variant: "destructive",
      });
    }
  };

  // Función para quitar stock de un producto
  const handleRemoveStock = async () => {
    if (!selectedProductId || !stockQuantity) return;
    
    try {
      // Verificar si el producto existe y tiene suficiente stock
      const product = Array.isArray(products) 
        ? products.find((p: any) => p.id === selectedProductId) 
        : null;
      
      if (!product) {
        toast({
          title: "Error",
          description: "No se encontró el producto seleccionado",
          variant: "destructive",
        });
        return;
      }
      
      const removeQuantity = Number(stockQuantity);
      
      if (removeQuantity > product.quantity) {
        toast({
          title: "Error",
          description: `No puede quitar más de ${product.quantity} ${product.unit} disponibles`,
          variant: "destructive",
        });
        return;
      }
      
      // En una implementación real, aquí llamaríamos a una API para actualizar el stock
      // Por ahora, simplemente refrescamos los datos después de una pausa simulada
      
      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Notificar cambios en los datos
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse/products"] });
      
      setRemoveStockOpen(false);
      setStockQuantity("");
      setSelectedProductId(null);
      
      toast({
        title: "Stock actualizado",
        description: `Se ha reducido el stock del producto correctamente`,
      });
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock del producto",
        variant: "destructive",
      });
    }
  };

  // Función para eliminar un producto
  const handleDeleteProduct = async () => {
    if (!selectedProductId) return;
    
    try {
      // En una implementación real, aquí llamaríamos a una API para eliminar el producto
      // Por ahora, simplemente refrescamos los datos después de una pausa simulada
      
      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Notificar cambios en los datos
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse/products"] });
      
      setDeleteConfirmOpen(false);
      setSelectedProductId(null);
      
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del inventario",
      });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  // Función para abrir el cuadro de diálogo de edición
  const openEditDialog = (product: any) => {
    setEditProduct(product);
    setSheetOpen(true);
  };

  // Obtener categorías únicas para el filtro
  const categories = Array.isArray(products) 
    ? Array.from(new Set(products.map((product: any) => product.category).filter(Boolean)))
    : [];

  // Filtra productos por término de búsqueda y categoría
  const filteredProducts = Array.isArray(products)
    ? products.filter((product: any) => {
        const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) || false;
        const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
        return matchesSearch && matchesCategory;
      })
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
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/warehouse/products"] })}
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
                          <SelectItem value="servicios">Mecánico</SelectItem>
                          <SelectItem value="forraje">Forraje (Rollos/Maíz)</SelectItem>
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
                            <SelectItem value="rollos">Rollos</SelectItem>
                            <SelectItem value="horas">Horas</SelectItem>
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
      
      {/* Filtros de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        
        <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {categoryFilter && (
          <Button 
            variant="outline" 
            onClick={() => setCategoryFilter(null)}
            className="sm:w-auto"
          >
            <i className="ri-filter-off-line mr-1"></i>
            Limpiar filtro
          </Button>
        )}
      </div>
      
      {/* Tabla de productos */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
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
                  <TableCell className="font-medium">{product.name || "Sin nombre"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {product.category || "Sin categoría"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.quantity || 0} {product.unit || "unidades"}</TableCell>
                  <TableCell>${(product.unitPrice || 0).toLocaleString()}</TableCell>
                  <TableCell>${(product.totalPrice || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex items-center justify-center"
                        title="Agregar stock"
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setAddStockOpen(true);
                        }}
                      >
                        <i className="ri-add-circle-line text-green-500 text-base"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex items-center justify-center"
                        title="Quitar stock"
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setRemoveStockOpen(true);
                        }}
                      >
                        <i className="ri-indeterminate-circle-line text-black text-base font-bold"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex items-center justify-center"
                        title="Editar"
                        onClick={() => openEditDialog(product)}
                      >
                        <i className="ri-pencil-line text-blue-500 text-base"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex items-center justify-center"
                        title="Eliminar"
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <i className="ri-delete-bin-line text-red-500 text-base"></i>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-neutral-400">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para agregar stock */}
      <Dialog open={addStockOpen} onOpenChange={setAddStockOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar stock</DialogTitle>
            <DialogDescription>
              Ingrese la cantidad a agregar al inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel htmlFor="add-quantity">Cantidad a agregar</FormLabel>
              <Input
                id="add-quantity"
                type="number"
                min="1"
                placeholder="Ej: 5"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStockOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddStock}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para quitar stock */}
      <Dialog open={removeStockOpen} onOpenChange={setRemoveStockOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quitar stock</DialogTitle>
            <DialogDescription>
              Ingrese la cantidad a quitar del inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel htmlFor="remove-quantity">Cantidad a quitar</FormLabel>
              <Input
                id="remove-quantity"
                type="number"
                min="1"
                placeholder="Ej: 2"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveStockOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRemoveStock}>Quitar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar producto */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el producto del inventario y no puede ser deshecha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}