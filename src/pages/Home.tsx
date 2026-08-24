import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings, Smartphone, Wrench, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

export const Home = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="bg-brand-navy text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Servicio Técnico de Alta Precisión
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Reparación de dispositivos, repuestos originales y seguimiento en tiempo real. 
            Confía tus equipos a verdaderos profesionales.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button asChild size="lg" className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue/90 text-white font-medium text-lg h-14 px-8">
              <Link to="/agendar">
                Agendar Servicio <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-brand-navy border-white bg-white hover:bg-gray-100 font-medium text-lg h-14 px-8">
              <Link to="/seguimiento">Rastrear Reparación</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Por qué elegir TecnoFix</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nuestra metodología nos permite ofrecer un servicio rápido, transparente y con garantía.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-brand-navy">Garantía Extendida</h3>
              <p className="text-gray-600">
                Todas nuestras reparaciones cuentan con soporte y garantía documentada directamente en nuestro sistema.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-brand-navy">Seguimiento en Vivo</h3>
              <p className="text-gray-600">
                Consulta el estado de tu equipo en tiempo real mediante tu número de guía único. No más incertidumbre.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-6">
                <Wrench className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-brand-navy">Repuestos Originales</h3>
              <p className="text-gray-600">
                Contamos con un amplio catálogo de repuestos verificados y certificados para cada marca.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Highlight */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">Especialistas en Dispositivos</h2>
              <p className="text-gray-600">
                Brindamos soporte técnico integral para la mayoría de dispositivos del mercado actual.
              </p>
            </div>
            <Button asChild variant="link" className="text-brand-blue mt-4 md:mt-0 font-medium">
              <Link to="/servicios">Ver todos los servicios <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Smartphones', icon: <Smartphone className="w-6 h-6" /> },
              { title: 'Laptops', icon: <Settings className="w-6 h-6" /> },
              { title: 'Tablets', icon: <Smartphone className="w-6 h-6" /> },
              { title: 'Smartwatches', icon: <Clock className="w-6 h-6" /> },
            ].map((item, idx) => (
              <div key={idx} className="group cursor-pointer p-6 rounded-xl border border-gray-200 hover:border-brand-blue transition-colors hover:shadow-md bg-brand-bg/50 hover:bg-white flex flex-col items-center justify-center space-y-4">
                <div className="text-brand-navy group-hover:text-brand-blue transition-colors">
                  {item.icon}
                </div>
                <h4 className="font-semibold text-brand-navy text-lg">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-blue text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Necesitas un repuesto o accesorio?</h2>
          <p className="text-lg md:text-xl text-brand-bg/90 mb-10">
            Explora nuestro catálogo en línea. Compra directa y segura vía WhatsApp.
          </p>
          <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100 font-semibold text-lg h-14 px-10">
            <Link to="/productos">Ir al Catálogo</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};
