import React from 'react';

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
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6 flex-1 flex flex-col items-center justify-center text-center min-h-[250px]">
        <span className="material-symbols-outlined text-error text-4xl mb-4">error</span>
        <p className="text-on-surface-variant text-sm font-medium">
          El reporte de estados no está disponible en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6 flex-1 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-on-surface mb-4">Estados de Reparación</h3>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center h-40">
          <div className="w-32 h-32 rounded-full border-[12px] border-surface-container-high animate-pulse"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center h-40">
            {/* Gráfico CSS Puro como en el mockup */}
            <div
              className="w-32 h-32 rounded-full relative"
              style={{
                background: 'conic-gradient(#004AC6 0% 45%, #00687A 45% 70%, #ECEEF0 70% 100%)',
                boxShadow: 'inset 0 0 0 16px #FFFFFF'
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-on-surface">65%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm font-medium">
            <span className="flex items-center gap-1 text-on-surface"><span className="w-3 h-3 rounded-full bg-primary"></span> En Proceso</span>
            <span className="flex items-center gap-1 text-on-surface"><span className="w-3 h-3 rounded-full bg-secondary"></span> Pendiente</span>
            <span className="flex items-center gap-1 text-on-surface"><span className="w-3 h-3 rounded-full bg-surface-container"></span> Completado</span>
          </div>
        </>
      )}
    </div>
  );
};

