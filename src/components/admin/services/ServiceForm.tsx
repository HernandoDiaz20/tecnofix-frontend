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
import { Loader2 } from 'lucide-react';
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '@/types/services';
import { useCreateService, useUpdateService } from '@/api/admin/service-hooks';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const serviceSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del servicio es obligatorio'),
  price: z.coerce.number().min(0, 'El precio debe ser numérico y mayor o igual a cero'),
  description: z.string().optional(),
});

interface ServiceFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  isOpen,
  onOpenChange,
  service,
}) => {
  const isEditing = !!service;
  const { toast } = useToast();

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<any>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
    },
  });

  useEffect(() => {
    if (service && isOpen) {
      form.reset({
        name: service.name,
        price: service.price,
        description: service.description || '',
      });
    } else if (!isOpen) {
      form.reset({
        name: '',
        price: 0,
        description: '',
      });
    }
  }, [service, isOpen, form]);

  const onSubmit = async (values: any) => {
    try {
      if (isEditing && service) {
        const payload: UpdateServiceRequest = {
          name: values.name.trim(),
          price: Number(values.price),
          description: values.description?.trim() || undefined,
        };

        await updateMutation.mutateAsync({
          id: service.id,
          data: payload,
        });

        toast({
          title: 'Servicio actualizado',
          description: 'El servicio ha sido actualizado exitosamente.',
        });
      } else {
        const payload: CreateServiceRequest = {
          name: values.name.trim(),
          price: Number(values.price),
          ...(values.description?.trim() ? { description: values.description.trim() } : {}),
        };

        await createMutation.mutateAsync(payload);

        toast({
          title: 'Servicio creado',
          description: 'El servicio ha sido creado exitosamente.',
        });
      }

      onOpenChange(false);
    } catch (error) {
      let errorMessage = 'Ocurrió un error al procesar el servicio.';
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        errorMessage = apiError.error?.message || (error.response.data as any)?.message || errorMessage;
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-1">
            {isEditing
              ? 'Modifica los campos del servicio técnico.'
              : 'Ingresa los datos para registrar un nuevo servicio en el catálogo.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">
                    Nombre del servicio <span className="text-error">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej. Diagnóstico Experto de Hardware" 
                      className="border-[#E0E3E5] focus-visible:ring-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">
                    Precio (COP) <span className="text-error">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      step="any"
                      placeholder="0" 
                      className="border-[#E0E3E5] focus-visible:ring-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">
                    Descripción (Opcional)
                  </FormLabel>
                  <FormControl>
                    <textarea 
                      rows={3}
                      placeholder="Detalles del procedimiento técnico o cobertura del servicio..." 
                      className="w-full rounded-md border border-[#E0E3E5] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50" 
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
                    Guardando...
                  </>
                ) : (
                  isEditing ? 'Guardar Cambios' : 'Crear Servicio'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
