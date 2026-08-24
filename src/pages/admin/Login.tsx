import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MonitorSmartphone, Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const AdminLogin: React.FC = () => {
  const { login, isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // If already authenticated and is admin, redirect
  if (!isAuthLoading && isAuthenticated && user?.role === ROLES.ADMINISTRADOR) {
    const from = location.state?.from?.pathname || '/admin/dashboard';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      await login(data);
      // Wait a tick for state to update, then navigate
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      let errorMessage = 'Ocurrió un error al iniciar sesión';
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        errorMessage = apiError.error?.message || errorMessage;
      }
      toast({
        title: 'Error de Autenticación',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <Loader2 className="w-8 h-8 text-[#004AC6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] p-4">
      <Card className="w-full max-w-md shadow-card border-[#E0E3E5]">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#004AC6] flex items-center justify-center text-white shadow-sm">
            <MonitorSmartphone className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-[#191C1E] tracking-tight">TecnoFix Admin</CardTitle>
            <CardDescription className="text-[#434655] font-medium">
              Ingresa tus credenciales para acceder al panel
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tecnofix.com"
                className="border-[#E0E3E5] focus-visible:ring-[#004AC6]"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-[#DC2626]">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase">
                  Contraseña
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                className="border-[#E0E3E5] focus-visible:ring-[#004AC6]"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-[#DC2626]">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#004AC6] hover:bg-[#003EA8] text-white h-11 text-[15px] font-semibold mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando Sesión...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
