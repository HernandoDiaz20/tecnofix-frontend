import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#191C1E] tracking-tight">Detalle de Orden</h1>
        <p className="text-[#434655]">ID: {id || 'Desconocido'}</p>
      </div>

      <Card className="border-[#E0E3E5] shadow-sm bg-white">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E6E8EA] flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-[#434655]" />
          </div>
          <h2 className="text-xl font-semibold text-[#191C1E] mb-2">Módulo en Desarrollo</h2>
          <p className="text-[#434655] max-w-md">
            El seguimiento detallado con diagnósticos, repuestos y garantías se implementará luego.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
