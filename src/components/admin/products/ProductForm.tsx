import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { Product } from '@/types';
import type { CreateProductRequest, UpdateProductRequest } from '@/types/products';
import { useCreateProduct, useUpdateProduct } from '@/api/admin/product-hooks';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const productSchema = z.object({
  sku: z.string().min(1, 'El SKU es obligatorio'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  imageUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  brand: z.string().min(1, 'La marca es obligatoria'),
  color: z.string().optional(),
  specs: z.array(
    z.object({
      label: z.string().min(1, 'El label es obligatorio'),
      value: z.string().min(1, 'El valor es obligatorio'),
    })
  ).optional(),
  purchasePrice: z.coerce.number().min(0, 'El precio debe ser positivo'),
  salePrice: z.coerce.number().min(0, 'El precio debe ser positivo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo').optional(),
});
// type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onOpenChange,
  product,
}) => {
  const isEditing = !!product;
  const { toast } = useToast();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      imageUrl: '',
      brand: 'Genérico',
      color: '',
      specs: [],
      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specs",
  });

  useEffect(() => {
    if (product && isOpen) {
      form.reset({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        brand: product.brand || 'Genérico',
        color: product.color || '',
        specs: product.specs || [],
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        stock: product.stock,
      });
    } else if (!isOpen) {
      form.reset();
    }
  }, [product, isOpen, form]);

  const onSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        imageUrl: values.imageUrl || null,
        description: values.description || '',
        color: values.color?.trim() || null,
        specs: values.specs && values.specs.length > 0 ? values.specs : (isEditing ? [] : null),
        categoryId: null, // As per requirements, categoryId is hidden and sent as null
      };

      if (isEditing) {
        // En edición no se envía el stock
        const { stock, ...updatePayload } = payload;
        
        // Si el usuario vació los specs por completo, enviamos un array vacío para eliminarlos
        if (!payload.specs || payload.specs.length === 0) {
          updatePayload.specs = [];
        }

        await updateMutation.mutateAsync({
          id: product.id,
          data: updatePayload as UpdateProductRequest
        });
        toast({
          title: 'Producto actualizado',
          description: 'El producto se ha actualizado correctamente.',
        });
      } else {
        await createMutation.mutateAsync(payload as CreateProductRequest);
        toast({
          title: 'Producto creado',
          description: 'El producto se ha creado correctamente.',
        });
      }
      onOpenChange(false);
    } catch (error) {
      let errorMessage = 'Ocurrió un error al guardar el producto.';
      
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          errorMessage = 'El SKU ya existe. Utiliza un SKU diferente.';
        } else if (error.response.data) {
          const apiError = error.response.data as ApiError;
          errorMessage = apiError.error?.message || errorMessage;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-2">
            Completa los detalles del producto o repuesto a continuación.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 mt-4">
            
            {/* Información Principal */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">
                Información Principal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Nombre del Producto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Pantalla OLED iPhone 13 Pro" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. SCR-IP13-001" className="border-[#E0E3E5] focus-visible:ring-primary uppercase" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEditing && (
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Stock Inicial</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="0" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {isEditing && (
                  <div className="flex flex-col justify-end pb-2">
                    <span className="text-sm text-on-surface-variant font-medium">
                      El stock se gestiona a través de movimientos.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles Adicionales (Marca, Color, Precios) */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">
                Detalles y Precios
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Apple, Samsung, Genérico..." className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Color (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Negro, Blanco, Plata..." className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Precio de Compra</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                          <Input type="number" min="0" step="0.01" className="pl-8 border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Precio de Venta</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                          <Input type="number" min="0" step="0.01" className="pl-8 border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">URL de la Imagen (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com/imagen.jpg" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada del producto o repuesto..."
                          className="resize-none border-[#E0E3E5] focus-visible:ring-primary h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Especificaciones Dinámicas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Especificaciones (Opcional)
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ label: '', value: '' })}
                  className="h-8 text-xs font-medium border-primary/20 text-primary hover:bg-primary/5"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Agregar
                </Button>
              </div>
              
              <div className="space-y-3">
                {fields.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic py-2 text-center bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant">
                    No se han añadido especificaciones a este producto.
                  </p>
                ) : (
                  fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`specs.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Ej. Procesador" className="border-[#E0E3E5] h-9 text-sm" {...field} />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`specs.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Ej. Snapdragon 8 Gen 3" className="border-[#E0E3E5] h-9 text-sm" {...field} />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-9 w-9 shrink-0 text-on-surface-variant hover:text-error hover:bg-error/10"
                        title="Eliminar especificación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="text-on-surface-variant hover:text-on-surface"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-on-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Producto'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
