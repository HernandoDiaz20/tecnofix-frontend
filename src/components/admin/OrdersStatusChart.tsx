import React from 'react';
import { AlertCircle } from 'lucide-react';

interface OrdersStatusChartProps {
  data: any; // Se tipará cuando el backend funcione
  isLoading: boolean;
  isError: boolean;
}

export const OrdersStatusChart: React.FC<OrdersStatusChartProps> = ({ 
  data: _data, 
  isLoading, 
  isError 
}) => {
  if (isError) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col h-full items-center justify-center text-center">
        <AlertCircle className="w-10 h-10 text-error mb-4" />
        <p className="text-on-surface-variant font-medium text-sm">
          El reporte de estados no está disponible en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col h-full gap-6">
      <h3 className="text-h3 font-semibold text-on-surface">Órdenes por Estado</h3>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[250px]">
          <div className="w-48 h-48 rounded-full border-[16px] border-surface-container-high animate-pulse"></div>
        </div>
      ) : (
        <>
          <div className="relative flex-1 min-h-[250px] flex items-center justify-center">
            {/* Gráfico CSS Puro como en el mockup */}
            <div 
              className="w-48 h-48 rounded-full relative" 
              style={{
                // Valores de prueba hasta que el backend envíe datos reales
                background: 'conic-gradient(#0a55e3 0% 45%, #10b981 45% 70%, #f59e0b 70% 90%, #ba1a1a 90% 100%)',
                boxShadow: 'inset 0 0 0 24px #f7f9fb'
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-on-surface">--</span>
                <span className="text-sm text-on-surface-variant font-medium">Activas</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0a55e3]"></span>
              <span className="text-on-surface-variant">En Proceso</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
              <span className="text-on-surface-variant">Completado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
              <span className="text-on-surface-variant">Presupuesto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ba1a1a]"></span>
              <span className="text-on-surface-variant">Rechazado</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
