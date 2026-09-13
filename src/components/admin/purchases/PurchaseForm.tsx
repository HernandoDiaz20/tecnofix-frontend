import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useAdminSuppliers, useCreatePurchase } from '@/api/admin/purchase-hooks';
import { useAdminProducts } from '@/api/admin/product-hooks';
import { useAdminParts } from '@/api/admin/part-hooks';
import { useToast } from '@/hooks/use-toast';
import type { CreatePurchaseRequestDto } from '@/types/purchases';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

// En el backend se permite productId O partId
const purchaseItemSchema = z.object({
  type: z.enum(['product', 'part']),
  itemId: z.string().min(1, 'Debe seleccionar un artículo'),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  unitPrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
});

const purchaseSchema = z.object({
  supplierId: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  items: z.array(purchaseItemSchema).min(1, 'Debe agregar al menos un artículo a la compra'),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { toast } = useToast();
  
  // Data hooks
  const { data: suppliersData, isLoading: loadingSuppliers } = useAdminSuppliers(1, 100);
  const { data: productsData, isLoading: loadingProducts } = useAdminProducts(1, 500); // Para el selector
  const { data: partsData, isLoading: loadingParts } = useAdminParts(1, 500); // Para el selector
  
  const createMutation = useCreatePurchase();
  const isSubmitting = createMutation.isPending;

  const form = useForm<any>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: '',
      notes: '',
      items: [{ type: 'product', itemId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Cálculos visuales
  const watchedItems = form.watch('items');
  const calculateTotal = () => {
    return watchedItems.reduce((acc: number, item: any) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return acc + (qty * price);
    }, 0);
  };

  // Reset form when opened
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        supplierId: '',
        notes: '',
        items: [{ type: 'product', itemId: '', quantity: 1, unitPrice: 0 }],
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (values: PurchaseFormValues) => {
    try {
      const payload: CreatePurchaseRequestDto = {
        supplierId: values.supplierId || null,
        notes: values.notes || null,
        items: values.items.map(item => ({
          productId: item.type === 'product' ? item.itemId : null,
          partId: item.type === 'part' ? item.itemId : null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      await createMutation.mutateAsync(payload);
      
      toast({
        title: 'Compra registrada',
        description: 'La solicitud de compra ha sido creada correctamente.',
      });
      onOpenChange(false);
    } catch (error) {
      let errorMessage = 'Ocurrió un error al registrar la compra.';
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Registrar Nueva Compra
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-2">
            Selecciona el proveedor y añade los productos o repuestos a la compra.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            
            {/* Cabecera de compra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Proveedor (Opcional)</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-10 bg-surface border border-outline-variant rounded-md px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50"
                        {...field}
                        disabled={loadingSuppliers}
                      >
                        <option value="">-- Sin proveedor --</option>
                        {suppliersData?.items?.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Artículos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Artículos de la compra
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ type: 'product', itemId: '', quantity: 1, unitPrice: 0 })}
                  className="h-8 text-xs font-medium border-primary/20 text-primary hover:bg-primary/5"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Añadir Artículo
                </Button>
              </div>

              {form.formState.errors.items?.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.items.root.message as React.ReactNode}
                </p>
              )}

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const currentType = form.watch(`items.${index}.type`);
                  
                  return (
                    <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg relative">
                      
                      {/* Tipo */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-[120px]">
                            <FormControl>
                              <select
                                className="w-full h-9 bg-surface border border-outline-variant rounded-md px-2 text-xs focus:border-primary outline-none"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  form.setValue(`items.${index}.itemId`, ''); // Reset item selection when changing type
                                }}
                              >
                                <option value="product">Producto</option>
                                <option value="part">Repuesto</option>
                              </select>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Selector de Artículo */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.itemId`}
                        render={({ field }) => (
                          <FormItem className="flex-1 w-full">
                            <FormControl>
                              <select
                                className="w-full h-9 bg-surface border border-outline-variant rounded-md px-2 text-xs focus:border-primary outline-none disabled:opacity-50"
                                {...field}
                                disabled={currentType === 'product' ? loadingProducts : loadingParts}
                              >
                                <option value="">-- Seleccionar {currentType === 'product' ? 'Producto' : 'Repuesto'} --</option>
                                {currentType === 'product' 
                                  ? productsData?.items?.filter(p => p.active !== false).map(p => (
                                      <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                                    ))
                                  : partsData?.items?.map(p => (
                                      <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                                    ))
                                }
                              </select>
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      {/* Cantidad */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-[90px]">
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-medium">Cant:</span>
                                <Input type="number" min="1" step="1" className="h-9 pl-10 pr-2 py-1 text-xs border-outline-variant" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      {/* Precio Unitario */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-[110px]">
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">$</span>
                                <Input type="number" min="0" step="0.01" className="h-9 pl-6 pr-2 py-1 text-xs border-outline-variant" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      {/* Subtotal visual */}
                      <div className="w-full sm:w-[90px] text-right font-data-mono text-sm font-medium text-on-surface px-2">
                        ${((Number(watchedItems[index]?.quantity) || 0) * (Number(watchedItems[index]?.unitPrice) || 0)).toFixed(2)}
                      </div>

                      {/* Botón Eliminar */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="h-9 w-9 shrink-0 text-on-surface-variant hover:text-error hover:bg-error/10 disabled:opacity-30"
                        title="Eliminar artículo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total visual */}
            <div className="flex justify-end p-4 bg-surface-container-low rounded-xl border border-outline-variant">
              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
                  Total Estimado
                </span>
                <span className="font-data-mono text-2xl font-bold text-primary">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Notas Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones de la compra, instrucciones de envío, etc." 
                      className="resize-none h-20 border-outline-variant" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Registrando...
                  </>
                ) : (
                  'Confirmar Compra'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
