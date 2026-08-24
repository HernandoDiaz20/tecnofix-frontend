import { Link } from 'react-router-dom';
import { Wrench, MessageCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#F2F4F6] border-t border-[#E0E3E5] text-[#191C1E] mt-auto">
      <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#191C1E]">
                Tecno<span className="text-primary">Fix</span>
              </span>
            </div>
            <p className="text-sm text-[#434655]">
              Expertos en tecnología y soporte técnico especializado con garantía y trazabilidad.
            </p>
            <p className="text-xs text-[#737686] mt-auto">
              © {new Date().getFullYear()} TecnoFix SaaS Platform. Todos los derechos reservados.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#191C1E] uppercase tracking-wider">Enlaces</h3>
            <ul className="space-y-2 text-sm text-[#434655]">
              <li>
                <Link to="/productos" className="hover:text-primary transition-colors">
                  Catálogo de Repuestos
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-primary transition-colors">
                  Servicios Técnicos
                </Link>
              </li>
              <li>
                <Link to="/seguimiento" className="hover:text-primary transition-colors">
                  Seguimiento de Reparación
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/573001234567"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  Contacto WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#191C1E] uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm text-[#434655]">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Términos del Servicio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Políticas de Garantía
                </a>
              </li>
            </ul>
          </div>

          {/* Horarios */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#191C1E] uppercase tracking-wider">Horarios de Atención</h3>
            <div className="space-y-1.5 text-sm text-[#434655]">
              <p className="flex justify-between">
                <span>Lunes - Viernes:</span>
                <span className="font-medium text-[#191C1E]">9:00 AM - 6:00 PM</span>
              </p>
              <p className="flex justify-between">
                <span>Sábados:</span>
                <span className="font-medium text-[#191C1E]">10:00 AM - 2:00 PM</span>
              </p>
              <p className="flex justify-between">
                <span>Domingos:</span>
                <span className="text-red-500 font-medium">Cerrado</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
