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
import { Button } from '@/components/ui/button';
import { Loader2, Package } from 'lucide-react';
import type { Part } from '@/types/parts';
import { useCreatePart, useUpdatePart } from '@/api/admin/part-hooks';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const partSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  sku: z.string().min(1, 'El SKU es obligatorio'),
  purchasePrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  salePrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo').optional(),
});

interface PartFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  part?: Part;
}

export const PartForm: React.FC<PartFormProps> = ({
  isOpen,
  onOpenChange,
  part,
}) => {
  const isEditing = !!part;
  const { toast } = useToast();

  const createMutation = useCreatePart();
  const updateMutation = useUpdatePart();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<any>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: '',
      sku: '',
      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
    },
  });

  useEffect(() => {
    if (part && isOpen) {
      form.reset({
        name: part.name,
        sku: part.sku,
        purchasePrice: part.purchasePrice,
        salePrice: part.salePrice,
        stock: part.stock, // Not submitted on edit, just for UI if needed
      });
    } else if (!isOpen) {
      form.reset();
    }
  }, [part, isOpen, form]);

  const onSubmit = async (values: z.infer<typeof partSchema>) => {
    try {
      if (isEditing) {
        // En edición, no se envía el stock
        const { stock, ...updatePayload } = values;
        await updateMutation.mutateAsync({
          id: part.id,
          data: updatePayload
        });
        toast({
          title: 'Repuesto actualizado',
          description: 'El repuesto se ha actualizado correctamente.',
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          sku: values.sku,
          purchasePrice: values.purchasePrice,
          salePrice: values.salePrice,
          stock: values.stock || 0,
        });
        toast({
          title: 'Repuesto registrado',
          description: 'El repuesto se ha registrado correctamente.',
        });
      }
      onOpenChange(false);
    } catch (error) {
      let errorMessage = 'Ocurrió un error al guardar el repuesto.';
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Editar Repuesto' : 'Añadir Nuevo Repuesto'}
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-2">
            Ingresa la información básica del repuesto.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Nombre del Repuesto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Batería Samsung S22 Ultra" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. BAT-S22-001" className="border-[#E0E3E5] focus-visible:ring-primary uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditing ? (
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
              ) : (
                <div className="flex flex-col justify-end">
                  <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider">Stock Actual</span>
                    <div className="flex items-center gap-1.5 font-data-mono font-medium text-on-surface">
                      <Package className="w-4 h-4 text-primary" />
                      {part.stock}
                    </div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-1 text-right">
                    (Solo lectura)
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  'Guardar Repuesto'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
