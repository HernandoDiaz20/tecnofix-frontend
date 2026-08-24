import React, { useState } from 'react';
import { useTrackWorkOrder } from '@/api/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, MonitorSmartphone, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Tracking = () => {
  const [guideNumber, setGuideNumber] = useState('');
  
  const { data, refetch, isFetching, isError } = useTrackWorkOrder(guideNumber);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (guideNumber.trim()) {
      refetch();
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'INGRESADO': 'bg-gray-100 text-gray-700',
      'EN_REVISION': 'bg-blue-100 text-blue-700',
      'ESPERANDO_REPUESTO': 'bg-orange-100 text-orange-700',
      'EN_REPARACION': 'bg-indigo-100 text-indigo-700',
      'REPARADO': 'bg-green-100 text-green-700',
      'LISTO_PARA_ENTREGA': 'bg-brand-cyan/20 text-brand-navy',
      'ENTREGADO': 'bg-gray-800 text-white',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  const formatStatus = (status: string) => status.replace(/_/g, ' ');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">Seguimiento de Reparación</h1>
        <p className="text-gray-600">Ingresa tu número de guía para conocer el estado actual de tu dispositivo en tiempo real.</p>
      </div>

      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 mb-12">
        <div className="relative flex-grow">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            type="text" 
            placeholder="Ej. TFX-2023-001" 
            value={guideNumber}
            onChange={(e) => setGuideNumber(e.target.value.toUpperCase())}
            className="pl-10 h-14 rounded-xl text-lg uppercase font-mono"
          />
        </div>
        <Button type="submit" disabled={isFetching || !guideNumber} className="h-14 px-8 bg-brand-blue text-white rounded-xl text-lg w-full sm:w-auto">
          {isFetching ? 'Buscando...' : 'Consultar'}
        </Button>
      </form>

      {isError && (
        <div className="text-center py-10 bg-brand-error/10 text-brand-error rounded-2xl border border-brand-error/20">
          <p className="text-lg font-medium">No se encontró ninguna orden con el número de guía provisto.</p>
          <p className="text-sm mt-2 opacity-80">Verifica que lo hayas escrito correctamente.</p>
        </div>
      )}

      {data && data.order && (
        <div className="space-y-8">
          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="bg-brand-bg rounded-t-2xl border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Orden de Servicio</p>
                  <CardTitle className="text-2xl font-mono text-brand-navy">{data.order.guideNumber}</CardTitle>
                </div>
                <Badge className={`${getStatusColor(data.order.currentStatus)} text-sm px-4 py-1 rounded-full uppercase tracking-wider`}>
                  {formatStatus(data.order.currentStatus)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MonitorSmartphone className="w-5 h-5 text-brand-blue mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Dispositivo</p>
                      <p className="text-brand-navy font-medium">{data.order.deviceBrand} {data.order.deviceModel}</p>
                      <p className="text-xs text-gray-400 font-mono">SN: {data.order.deviceSerial}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-brand-blue mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Fecha de Ingreso</p>
                      <p className="text-brand-navy font-medium">
                        {format(new Date(data.order.createdAt), "d 'de' MMMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-brand-blue mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Falla Reportada</p>
                      <p className="text-brand-navy">{data.order.problemDescription}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {data.history && data.history.length > 0 && (
            <Card className="rounded-2xl shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle>Historial de Movimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-l-2 border-gray-200 ml-3 md:ml-4 space-y-8 pb-4">
                  {data.history.map((event: any, idx: number) => (
                    <div key={idx} className="relative pl-8">
                      <div className="absolute w-4 h-4 bg-brand-blue rounded-full -left-[9px] top-1 border-4 border-white shadow-sm" />
                      <p className="text-sm text-gray-500 mb-1">
                        {format(new Date(event.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                      <p className="font-medium text-brand-navy">Estado actualizado a: {formatStatus(event.toStatus)}</p>
                      {event.notes && <p className="text-gray-600 text-sm mt-1">{event.notes}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
