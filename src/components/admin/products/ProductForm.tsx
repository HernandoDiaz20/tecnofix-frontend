import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Loader2 } from 'lucide-react';
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
  purchasePrice: z.coerce.number().min(0, 'El precio debe ser positivo'),
  salePrice: z.coerce.number().min(0, 'El precio debe ser positivo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo').optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

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
      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
    },
  });

  useEffect(() => {
    if (product && isOpen) {
      form.reset({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        stock: product.stock, // ignored in submission for edit, but good for form state
      });
    } else if (!isOpen) {
      form.reset();
    }
  }, [product, isOpen, form]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const payload = {
        ...values,
        imageUrl: values.imageUrl || null,
        description: values.description || '',
        categoryId: null, // As per requirements, categoryId is hidden and sent as null
      };

      if (isEditing) {
        // En edición no se envía el stock
        const { stock, ...updatePayload } = payload;
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
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        errorMessage = apiError.error?.message || errorMessage;
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-2">
            Completa los detalles del producto o repuesto a continuación.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 mt-4">
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
                    El stock se gestiona a través de entradas/salidas.
                  </span>
                </div>
              )}

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
                        className="resize-none border-[#E0E3E5] focus-visible:ring-primary h-24" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
