import { useServices } from '@/api/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export const Services = () => {
  const { data: services, isLoading, isError } = useServices();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">Servicios Técnicos</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Conoce nuestra oferta de servicios especializados. Reparamos con componentes originales y ofrecemos garantía por escrito.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="rounded-2xl">
              <CardHeader className="pb-2"><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-brand-error/20">
          <p className="text-brand-error text-lg font-medium">Hubo un error al cargar los servicios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <Card key={service.id} className="rounded-2xl shadow-sm border border-gray-100 hover:border-brand-blue transition-colors flex flex-col h-full">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-brand-bg text-brand-blue rounded-xl flex items-center justify-center mb-4">
                  <Wrench className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold text-brand-navy">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-gray-600 mb-6">{service.description || 'Servicio técnico especializado.'}</p>
                  <p className="text-2xl font-bold text-brand-navy mb-6">Desde ${service.price.toLocaleString()}</p>
                </div>
                <Button asChild className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl h-12">
                  <Link to="/agendar">Agendar ahora</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
