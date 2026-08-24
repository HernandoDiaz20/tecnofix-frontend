import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/productos' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Seguimiento', path: '/seguimiento' },
  ];

  return (
    <header className="bg-brand-navy text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-white tracking-tighter">
              Tecno<span className="text-brand-cyan">Fix</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="default" className="bg-brand-blue hover:bg-brand-blue/90 text-white">
              <Link to="/agendar">Agendar Cita</Link>
            </Button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-brand-navy border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                {link.name}
              </Link>
            ))}
            <div className="px-3 py-2">
              <Button asChild className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white">
                <Link to="/agendar" onClick={() => setIsOpen(false)}>Agendar Cita</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
