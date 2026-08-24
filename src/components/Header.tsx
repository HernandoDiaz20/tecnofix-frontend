import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wrench, Calendar } from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/productos' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Seguimiento', path: '/seguimiento' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-[#E0E3E5]">
      <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#191C1E]">
              Tecno<span className="text-primary">Fix</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-all py-1.5 ${
                    active
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-[#434655] hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/agendar"
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#003EA8] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200"
            >
              <Calendar className="w-4 h-4" />
              Agendar Servicio
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-[#434655] hover:text-[#191C1E] hover:bg-[#F2F4F6] transition-colors"
              aria-label="Abrir menú"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-[#E0E3E5] shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-3 pb-5 space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-[#434655] hover:bg-[#F2F4F6] hover:text-[#191C1E]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                to="/agendar"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#003EA8] text-white text-base font-semibold py-3 rounded-xl shadow-sm"
              >
                <Calendar className="w-5 h-5" />
                Agendar Servicio
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
