import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-brand-navy text-white mt-12">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-2xl font-bold tracking-tighter">
              Tecno<span className="text-brand-cyan">Fix</span>
            </span>
            <p className="mt-2 text-sm text-gray-400">
              Soluciones tecnológicas de alta precisión. Venta de repuestos y servicio técnico especializado.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/productos" className="text-base text-gray-400 hover:text-white">Catálogo</Link></li>
              <li><Link to="/servicios" className="text-base text-gray-400 hover:text-white">Servicios</Link></li>
              <li><Link to="/seguimiento" className="text-base text-gray-400 hover:text-white">Seguimiento de Reparación</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">Contacto</h3>
            <ul className="space-y-2 text-base text-gray-400">
              <li>info@tecnofix.com</li>
              <li>+57 (300) 123-4567</li>
              <li>Centro Comercial Tech, Local 101</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 flex justify-between items-center flex-col md:flex-row">
          <p className="text-base text-gray-400">
            &copy; {new Date().getFullYear()} TecnoFix. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
