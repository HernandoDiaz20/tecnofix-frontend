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
import type { Customer } from '@/types/customers';
import { useCreateCustomer, useUpdateCustomer } from '@/api/admin/customer-hooks';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const customerSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es obligatorio'),
  email: z.string().email('El formato de email no es válido').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional().or(z.literal('')),
});

interface CustomerFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onOpenChange,
  customer,
}) => {
  const isEditing = !!customer;
  const { toast } = useToast();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<any>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (customer && isOpen) {
      form.reset({
        fullName: customer.fullName,
        email: customer.email || '',
        phone: customer.phone || '',
      });
    } else if (!isOpen) {
      form.reset();
    }
  }, [customer, isOpen, form]);

  const onSubmit = async (values: z.infer<typeof customerSchema>) => {
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email || null,
        phone: values.phone || null,
      };

      if (isEditing && customer) {
        await updateMutation.mutateAsync({
          id: customer.id,
          data: payload,
        });
        toast({
          title: 'Cliente actualizado',
          description: 'La información del cliente se ha actualizado correctamente.',
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast({
          title: 'Cliente registrado',
          description: 'El cliente se ha registrado exitosamente.',
        });
      }
      onOpenChange(false);
    } catch (error) {
      let errorMessage = 'Ocurrió un error al guardar el cliente.';
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-2">
            Ingresa la información básica del cliente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">
                    Nombre Completo <span className="text-error">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Juan Pérez" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Email (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ej. juan@ejemplo.com" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Teléfono (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Ej. 3001234567" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
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
                  'Guardar Cliente'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
