import React, { useState } from 'react';
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
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useCreateTechnician } from '@/api/admin/technician-hooks';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const technicianSchema = z.object({
  fullName: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().min(1, 'El email es obligatorio').email('Debe ser un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  phone: z.string().optional().or(z.literal('')),
});

interface TechnicianFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TechnicianForm: React.FC<TechnicianFormProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const createMutation = useCreateTechnician();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof technicianSchema>>({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof technicianSchema>) => {
    try {
      await createMutation.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || null,
      });
      toast({
        title: 'Técnico registrado',
        description: 'El técnico se ha registrado correctamente.',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      let errorMessage = 'Ocurrió un error al registrar el técnico.';
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
         form.reset();
         setShowPassword(false);
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Añadir Nuevo Técnico
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-2">
            Ingresa la información básica y credenciales del técnico.
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
                    <Input placeholder="Ej. Carlos Ruiz" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
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
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ej. carlos.tecnico@tecnofix.com" className="border-[#E0E3E5] focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Mínimo 8 caracteres" 
                        className="border-[#E0E3E5] focus-visible:ring-primary pr-10" 
                        {...field} 
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                  'Registrar Técnico'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
