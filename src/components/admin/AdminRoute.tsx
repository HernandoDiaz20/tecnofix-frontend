import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/types/auth';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user?.role !== ROLES.ADMINISTRADOR) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-outline-variant max-w-md">
          <h2 className="text-2xl font-bold text-error mb-2">Acceso Denegado</h2>
          <p className="text-on-surface-variant mb-4">
            No tienes los permisos necesarios para acceder a esta área.
            Esta sección es exclusiva para administradores.
          </p>
          <a href="/" className="text-primary hover:underline font-medium">
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
