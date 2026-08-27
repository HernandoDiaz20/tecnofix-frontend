import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Tablet, 
  Laptop, 
  Monitor, 
  Headphones, 
  Wrench, 
  Sparkles, 
  Cpu, 
  Search, 
  MessageCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useProducts } from '@/api/hooks';
import type { Product } from '@/types';

export const Home = () => {
  const { data: productsData } = useProducts(1, 3);
  
  const apiProducts: Product[] = Array.isArray(productsData) 
    ? productsData 
    : (productsData?.items || productsData?.products || []);

  const displayProducts = apiProducts.slice(0, 3).map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand || 'TecnoFix',
    specs: p.description || `SKU: ${p.sku}`,
    price: p.salePrice || 0,
    image: p.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    available: p.stock > 0
  }));

  const categories = [
    { name: 'Celulares', icon: Smartphone, path: '/productos?cat=celulares' },
    { name: 'Tablets', icon: Tablet, path: '/productos?cat=tablets' },
    { name: 'Portátiles', icon: Laptop, path: '/productos?cat=portatiles' },
    { name: 'PC', icon: Monitor, path: '/productos?cat=pc' },
    { name: 'Accesorios', icon: Headphones, path: '/productos?cat=accesorios' },
  ];

  const services = [
    {
      title: 'Diagnóstico Experto',
      description: 'Revisión profunda de hardware y software para identificar fallas precisas.',
      icon: Search,
    },
    {
      title: 'Cambio de Pantalla',
      description: 'Reemplazo con repuestos originales y garantía de funcionamiento.',
      icon: Smartphone,
    },
    {
      title: 'Mantenimiento Preventivo',
      description: 'Limpieza interna y cambio de pasta térmica para optimizar rendimiento.',
      icon: Sparkles,
    },
    {
      title: 'Soluciones de Software',
      description: 'Instalación de SO, recuperación de datos y eliminación de virus.',
      icon: Cpu,
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4" />
          Servicio Técnico Certificado
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#191C1E] max-w-4xl leading-[1.15]">
          Expertos en Tecnología y Soporte Técnico Especializado
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl text-[#434655] max-w-2xl">
          Venta de dispositivos de última generación y reparación profesional con garantía por escrito.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link
            to="/productos"
            className="inline-flex items-center justify-center bg-primary hover:bg-[#003EA8] text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-sm hover:shadow transition-all"
          >
            Ver dispositivos
          </Link>
          <Link
            to="/agendar"
            className="inline-flex items-center justify-center border border-primary text-primary hover:bg-primary/5 font-semibold text-base px-8 py-3.5 rounded-xl transition-all"
          >
            Solicitar servicio
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E0E3E5]">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#191C1E] text-center mb-8">
          Nuestras Categorías
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={cat.path}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-[#E0E3E5] hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 rounded-xl bg-[#F2F4F6] text-primary flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                  <Icon className="w-8 h-8" />
                </div>
                <span className="font-semibold text-[#191C1E] text-base group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191C1E]">
              Equipos Destacados
            </h2>
            <p className="text-sm text-[#434655] mt-1">
              Dispositivos verificados y listos para entrega inmediata.
            </p>
          </div>
          <Link
            to="/productos"
            className="hidden sm:inline-flex items-center text-primary font-semibold text-sm hover:underline gap-1"
          >
            Ver catálogo completo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {displayProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] overflow-hidden flex flex-col hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="h-56 bg-[#F2F4F6] p-6 flex items-center justify-center relative overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
                      {prod.brand}
                    </span>
                    <h3 className="text-xl font-bold text-[#191C1E] mt-0.5">
                      {prod.name}
                    </h3>
                  </div>
                  <span className="bg-[#DCFCE7] text-[#16A34A] text-xs font-bold px-2.5 py-1 rounded-full">
                    Disponible
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#434655] line-clamp-2 mb-4">
                  {prod.specs}
                </p>

                <div className="mt-auto pt-4 border-t border-[#E0E3E5] flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ${prod.price.toLocaleString('es-CO')}{' '}
                    <span className="text-xs font-normal text-[#434655]">COP</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <Link
                    to={`/productos/${prod.id}`}
                    className="flex items-center justify-center bg-[#F2F4F6] hover:bg-[#E6E8EA] text-[#191C1E] text-sm font-semibold py-2.5 rounded-xl transition-colors text-center"
                  >
                    Ver detalles
                  </Link>
                  <a
                    href={`https://wa.me/573001234567?text=${encodeURIComponent(
                      `Hola TecnoFix, estoy interesado en comprar el ${prod.name} ($${prod.price.toLocaleString('es-CO')} COP).`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Services Section */}
      <section className="bg-white border-t border-[#E0E3E5] py-16">
        <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191C1E]">
              Servicios Técnicos Especializados
            </h2>
            <p className="text-sm sm:text-base text-[#434655] mt-2">
              Soluciones integrales de hardware y software para extender la vida útil de tus equipos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((serv) => {
              const Icon = serv.icon;
              return (
                <div
                  key={serv.title}
                  className="bg-[#F7F9FB] p-6 rounded-2xl border border-[#E0E3E5] flex flex-col items-start gap-4 hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="bg-primary text-white p-3.5 rounded-xl shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#191C1E] text-base mb-1.5">
                      {serv.title}
                    </h4>
                    <p className="text-sm text-[#434655] leading-relaxed">
                      {serv.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/agendar"
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#003EA8] text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-sm transition-all"
            >
              <Wrench className="w-5 h-5" />
              Agendar una Evaluación Técnica
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
