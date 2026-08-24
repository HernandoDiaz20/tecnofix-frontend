import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Wrench,
  Users,
  HardHat,
  Calendar,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  FileSearch,
  LogOut,
  Menu,
  Bell,
  X,
  MonitorSmartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Órdenes', path: '/admin/ordenes', icon: ClipboardList },
    { label: 'Citas', path: '/admin/citas', icon: Calendar },
    { label: 'Productos', path: '/admin/productos', icon: Package },
    { label: 'Inventario', path: '/admin/inventario', icon: Warehouse },
    { label: 'Repuestos', path: '/admin/repuestos', icon: Wrench },
    { label: 'Clientes', path: '/admin/clientes', icon: Users },
    { label: 'Técnicos', path: '/admin/tecnicos', icon: HardHat },
    { label: 'Garantías', path: '/admin/garantias', icon: ShieldCheck },
    { label: 'Reportes', path: '/admin/reportes', icon: BarChart3 },
    { label: 'Auditoría', path: '/admin/auditoria', icon: FileSearch },
  ];

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'AD';
  };

  return (
    <div className="flex h-screen bg-[#F7F9FB] text-[#191C1E] overflow-hidden antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#E0E3E5] flex flex-col transition-transform duration-300 ease-in-out transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#004AC6] flex items-center justify-center text-white">
              <MonitorSmartphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#191C1E] leading-tight tracking-tight">
                Admin Panel
              </h1>
              <p className="text-xs text-[#434655] font-medium">Gestión Técnica</p>
            </div>
          </div>
          <button 
            className="md:hidden text-[#434655] p-2 -mr-2 rounded-full hover:bg-[#F2F4F6]"
            onClick={closeSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold tracking-wider uppercase transition-colors duration-200",
                    isActive
                      ? "bg-[#2563EB] text-white"
                      : "text-[#434655] hover:bg-[#E0E3E5]"
                  )
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-[#E0E3E5]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold tracking-wider uppercase text-[#434655] hover:bg-[#E0E3E5] transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-[#E0E3E5] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-[#191C1E] p-2 -ml-2 rounded-full hover:bg-[#F2F4F6]"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-2xl text-[#191C1E] font-semibold tracking-tight hidden md:block">
              Resumen Operativo
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#434655] hover:bg-[#F2F4F6] rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#DC2626] rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-sm font-bold tracking-wider">
                {user ? getInitials(user.fullName) : 'AD'}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-medium text-[#191C1E] leading-none">
                  {user?.fullName || 'Admin User'}
                </span>
                <span className="text-[11px] text-[#434655] capitalize mt-1">
                  {user?.role || 'Administrador'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F7F9FB]">
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
