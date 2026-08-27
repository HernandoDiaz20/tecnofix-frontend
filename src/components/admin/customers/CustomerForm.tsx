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
import { Loader2 } from 'lucide-react';
import { useCreateCustomer } from '@/api/admin/customer-hooks';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const customerSchema = z.object({
  fullName: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Debe ser un email válido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

interface CustomerFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const createMutation = useCreateCustomer();

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof customerSchema>) => {
    try {
      await createMutation.mutateAsync({
        fullName: values.fullName,
        email: values.email || null,
        phone: values.phone || null,
      });
      toast({
        title: 'Cliente registrado',
        description: 'El cliente se ha registrado correctamente.',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      let errorMessage = 'Ocurrió un error al registrar el cliente.';
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Añadir Nuevo Cliente
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-2">
            Ingresa la información básica del cliente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Nombre Completo</FormLabel>
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
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Correo Electrónico (Opcional)</FormLabel>
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
                    <Input placeholder="Ej. 3001234567" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
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
                disabled={createMutation.isPending}
                className="text-on-surface-variant hover:text-on-surface"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-primary text-on-primary hover:bg-primary/90"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Cliente'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
