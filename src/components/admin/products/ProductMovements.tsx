import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Loader2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import type { Product } from '@/types';
import { useProductMovements, useCreateProductMovement } from '@/api/admin/product-hooks';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const movementSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  reason: z.string().min(1, 'El motivo es obligatorio'),
});

type MovementFormValues = z.infer<typeof movementSchema>;

interface ProductMovementsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export const ProductMovements: React.FC<ProductMovementsProps> = ({
  isOpen,
  onOpenChange,
  product,
}) => {
  const { toast } = useToast();
  
  const { 
    data: movementsData, 
    isLoading: isLoadingMovements 
  } = useProductMovements(product?.id || '');
  
  const createMutation = useCreateProductMovement();

  const form = useForm<any>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: 'IN',
      quantity: 1,
      reason: '',
    },
  });

  const onSubmit = async (values: MovementFormValues) => {
    if (!product) return;
    
    try {
      await createMutation.mutateAsync({
        id: product.id,
        data: values,
      });
      
      toast({
        title: 'Movimiento registrado',
        description: 'El inventario se ha actualizado correctamente.',
      });
      form.reset();
    } catch (error) {
      let errorMessage = 'Ocurrió un error al registrar el movimiento.';
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

  const movements = movementsData?.items || [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Movimientos de Inventario
            </DialogTitle>
            <DialogDescription className="text-on-surface-variant pt-2">
              Gestiona las entradas y salidas de stock para: <strong className="text-on-surface">{product?.name}</strong>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          {/* Formulario Inline */}
          <div className="w-full lg:w-1/3 space-y-4">
            <h3 className="font-h3 text-h3 text-on-surface">Nuevo Movimiento</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Tipo de Movimiento</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                          {...field}
                        >
                          <option value="IN">Entrada (IN)</option>
                          <option value="OUT">Salida (OUT)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Cantidad</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Motivo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Compra de stock" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-primary text-on-primary hover:bg-primary/90 mt-2"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Registrar Movimiento'
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Historial */}
          <div className="w-full lg:w-2/3 space-y-4">
            <h3 className="font-h3 text-h3 text-on-surface flex items-center justify-between">
              <span>Historial</span>
              <span className="text-sm font-normal text-on-surface-variant font-data-mono">Stock actual: {product?.stock}</span>
            </h3>
            
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="sticky top-0 bg-surface-container-low border-b border-outline-variant z-10">
                    <tr>
                      <th className="py-2.5 px-4 font-label-md text-[11px] text-on-secondary-fixed-variant uppercase tracking-wider">Fecha</th>
                      <th className="py-2.5 px-4 font-label-md text-[11px] text-on-secondary-fixed-variant uppercase tracking-wider text-center">Tipo</th>
                      <th className="py-2.5 px-4 font-label-md text-[11px] text-on-secondary-fixed-variant uppercase tracking-wider text-right">Cant.</th>
                      <th className="py-2.5 px-4 font-label-md text-[11px] text-on-secondary-fixed-variant uppercase tracking-wider">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {isLoadingMovements ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                          <p>Cargando movimientos...</p>
                        </td>
                      </tr>
                    ) : movements.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                          No hay movimientos registrados
                        </td>
                      </tr>
                    ) : (
                      movements.map((mov) => (
                        <tr key={mov.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="py-2 px-4 whitespace-nowrap text-on-surface">
                            {format(new Date(mov.createdAt), "d MMM yyyy HH:mm", { locale: es })}
                          </td>
                          <td className="py-2 px-4 text-center">
                            {mov.type === 'IN' ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-success-container/30 text-success border border-success/20">
                                <ArrowDownToLine className="w-3 h-3" />
                                IN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-error-container/30 text-error border border-error/20">
                                <ArrowUpFromLine className="w-3 h-3" />
                                OUT
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-right font-data-mono font-medium text-on-surface">
                            {mov.type === 'IN' ? '+' : '-'}{mov.quantity}
                          </td>
                          <td className="py-2 px-4 text-on-surface-variant truncate max-w-[150px]" title={mov.reason}>
                            {mov.reason}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
