import { Link } from 'react-router-dom';
import { 
  Search, 
  Smartphone, 
  BatteryCharging, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useServices } from '@/api/hooks';

export const Services = () => {
  const { data: apiServices } = useServices();

  const defaultServices = [
    {
      id: 'srv-1',
      name: 'Diagnóstico Experto de Hardware y Software',
      price: 0,
      priceLabel: '$0 COP (Gratis con reparación)',
      duration: '1 - 2 horas',
      description: 'Revisión exhaustiva con instrumental de precisión para detectar cortocircuitos, fallas en placa base y problemas de software.',
      icon: Search,
      benefits: ['Informe técnico por escrito', 'Sin compromiso inicial', 'Revisión en microscopio']
    },
    {
      id: 'srv-2',
      name: 'Cambio de Pantalla y Módulo Táctil',
      price: 250000,
      priceLabel: 'Desde $250.000 COP',
      duration: '2 - 4 horas',
      description: 'Reemplazo con repuestos originales (OEM) o calidades certificadas (OLED / Incell). Calibración de TrueTone y sensor de proximidad.',
      icon: Smartphone,
      benefits: ['Pantallas 100% probadas', 'Sellado contra polvo y salpicaduras', '6 meses de garantía']
    },
    {
      id: 'srv-3',
      name: 'Cambio y Reemplazo de Batería',
      price: 120000,
      priceLabel: 'Desde $120.000 COP',
      duration: '1 - 2 horas',
      description: 'Sustitución con celdas de alta densidad que recuperan el 100% de la condición original sin mensajes de error.',
      icon: BatteryCharging,
      benefits: ['Salud de batería al 100%', 'Cero sobrecalentamiento', 'Certificación de seguridad']
    },
    {
      id: 'srv-4',
      name: 'Mantenimiento Preventivo y Limpieza',
      price: 85000,
      priceLabel: '$85.000 COP',
      duration: '2 - 3 horas',
      description: 'Limpieza ultrasónica, sopleteado de polvo interno, cambio de pasta térmica de alto rendimiento y lubricación de ventiladores.',
      icon: Sparkles,
      benefits: ['Reducción de temperatura', 'Mayor vida útil de chips', 'Optimización de rendimiento']
    },
    {
      id: 'srv-5',
      name: 'Reparación de Placa Base y Microsoldadura',
      price: 180000,
      priceLabel: 'Desde $180.000 COP',
      duration: '24 - 48 horas',
      description: 'Reparación de circuitos integrados (IC de carga, Touch IC, Audio IC), reconstrucción de pistas y líneas en corto.',
      icon: Cpu,
      benefits: ['Técnicos certificados', 'Microscopios de alta definición', 'Garantía extendida']
    },
    {
      id: 'srv-6',
      name: 'Soluciones y Recuperación de Software',
      price: 70000,
      priceLabel: 'Desde $70.000 COP',
      duration: '1 - 3 horas',
      description: 'Flasheo de sistemas operativos (iOS, Android, Windows, macOS), recuperación de datos eliminados y desinfección total.',
      icon: ShieldCheck,
      benefits: ['Respaldo seguro de datos', 'Instalación limpia', 'Eliminación de malware']
    },
  ];

  const servicesList = apiServices && apiServices.length > 0 
    ? apiServices.map((s, idx) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        priceLabel: `Desde $${s.price.toLocaleString('es-CO')} COP`,
        duration: '1 - 3 horas',
        description: s.description || 'Servicio técnico especializado con componentes originales y garantía escrita.',
        icon: defaultServices[idx % defaultServices.length].icon,
        benefits: defaultServices[idx % defaultServices.length].benefits
      }))
    : defaultServices;

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-4 h-4" />
          Servicios de Laboratorio Especializado
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#191C1E] tracking-tight mb-4">
          Servicios Técnicos Especializados
        </h1>
        <p className="text-base sm:text-lg text-[#434655]">
          Diagnóstico y reparación de alta precisión para smartphones, tablets y ordenadores con repuestos originales y garantía certificada.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicesList.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-7 flex flex-col justify-between hover:border-primary hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs text-[#737686] flex items-center gap-1 font-medium bg-[#F2F4F6] px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" /> {service.duration}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#191C1E] mb-2.5">
                  {service.name}
                </h3>
                <p className="text-sm text-[#434655] leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-[#E0E3E5]">
                  {service.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-[#191C1E]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="pt-4 border-t border-[#E0E3E5] mb-5">
                  <p className="text-xs text-[#737686]">Precio estimado</p>
                  <p className="text-xl font-black text-primary">
                    {service.priceLabel}
                  </p>
                </div>

                <Link
                  to="/agendar"
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#003EA8] text-white text-sm font-bold py-3 rounded-xl shadow-sm transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar este Servicio
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
