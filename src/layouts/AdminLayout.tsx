import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react'; // Fallback para botones móviles si no queremos usar Material Symbols ahí, pero usaremos Material

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Órdenes', path: '/admin/ordenes', icon: 'build' },
    { label: 'Citas', path: '/admin/citas', icon: 'calendar_today' },
    { label: 'Productos', path: '/admin/productos', icon: 'inventory_2' },
    { label: 'Inventario', path: '/admin/inventario', icon: 'inventory' },
    { label: 'Repuestos', path: '/admin/repuestos', icon: 'build_circle' },
    { label: 'Clientes', path: '/admin/clientes', icon: 'group' },
    { label: 'Técnicos', path: '/admin/tecnicos', icon: 'engineering' },
    { label: 'Garantías', path: '/admin/garantias', icon: 'verified' },
    { label: 'Reportes', path: '/admin/reportes', icon: 'analytics' },
    { label: 'Auditoría', path: '/admin/auditoria', icon: 'history' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'AD';
  };

  return (
    <div className="flex h-screen bg-background text-on-background overflow-hidden antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* SideNavBar */}
      <nav
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-30 w-64 border-r border-outline-variant bg-surface-container-low flex flex-col transition-transform duration-300 ease-in-out transform lg:translate-x-0 h-screen",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center gap-3 border-b border-outline-variant justify-between">
          <div className="flex items-center gap-3">
            <img
              alt="TecnoFix Logo"
              className="h-8 w-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7tG9Vrq6YpqCQtzpvPupKZy0CHDM_cZ5o6px-NwkaHPW-oequVx_nnYktk-OEDCBbhzEx7THdRmPhfP6DFdD1zQ7bzL3hUbKA2eaa74omGFCtYMahUh9Bnpc3ct4Z5eG2YA4LWFkNUMqOM8v_bVR88QF5B1DDlLtk7h1AydPn6BOQloi_-e5AyV3Wu0KKWeDxWuhl_B43XH-lZRSDdIafEV_Z5gMIlAVaT3u8HY7LAS72mU1p984d"
            />
            <div>
              <h1 className="text-xl font-bold text-primary leading-tight tracking-tight">TecnoFix Admin</h1>
              <p className="text-sm text-on-surface-variant">Technical Operations</p>
            </div>
          </div>
          <button
            className="lg:hidden text-on-surface-variant p-1 rounded-full hover:bg-surface-container"
            onClick={closeSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    cn(
                      "rounded-lg px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-transform active:scale-95",
                      isActive
                        ? "bg-primary-container text-on-primary-container"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="material-symbols-outlined"
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-2 border-t border-outline-variant">
          <ul className="space-y-1">
            <li>
              <button className="w-full text-on-surface-variant hover:bg-surface-container-high rounded-lg px-4 py-3 flex items-center gap-3 text-sm font-semibold">
                <span className="material-symbols-outlined">settings</span> Settings
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-error hover:bg-error-container/50 rounded-lg px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-colors"
              >
                <span className="material-symbols-outlined">logout</span> Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopNavBar Admin */}
        <header className="flex justify-between items-center px-6 w-full h-16 border-b border-outline-variant bg-surface-container-lowest z-10">
          <div className="flex-1 flex items-center gap-4">
            <button
              className="lg:hidden text-on-surface-variant p-2 -ml-2 rounded-full hover:bg-surface-container"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-md hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Buscar orden, cliente..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all duration-200">
              <span className="material-symbols-outlined">help</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-semibold ml-4 cursor-pointer border border-primary/20">
              {user ? getInitials(user.fullName) : 'AD'}
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          <div className="max-w-[1280px] mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
