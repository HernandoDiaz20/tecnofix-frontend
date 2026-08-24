import React from 'react';
import { 
  Package, 
  Users, 
  Settings2, 
  CalendarDays,
  CalendarClock
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable';
import { OrdersStatusChart } from '@/components/admin/OrdersStatusChart';
import { 
  useAdminProductsCount,
  useAdminCustomersCount,
  useAdminPartsCount,
  useAdminTechniciansCount,
  useAdminRecentOrders,
  useAdminTodayAppointments,
  useAdminPendingAppointments,
  useAdminOrdersByStatus
} from '@/api/admin-hooks';

export const Dashboard: React.FC = () => {
  // Datos
  const { data: productsCount, isLoading: loadingProducts, isError: errorProducts } = useAdminProductsCount();
  const { data: customersCount, isLoading: loadingCustomers, isError: errorCustomers } = useAdminCustomersCount();
  const { data: partsCount, isLoading: loadingParts, isError: errorParts } = useAdminPartsCount();
  const { data: techniciansCount, isLoading: loadingTechnicians, isError: errorTechnicians } = useAdminTechniciansCount();
  const { data: recentOrders, isLoading: loadingOrders, isError: errorOrders } = useAdminRecentOrders();
  const { data: todayAppointments, isLoading: loadingTodayApps, isError: errorTodayApps } = useAdminTodayAppointments();
  const { data: pendingAppointments, isLoading: loadingPendingApps, isError: errorPendingApps } = useAdminPendingAppointments();
  const { data: statusReport, isLoading: loadingStatus, isError: errorStatus } = useAdminOrdersByStatus();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-h1 font-bold text-on-surface tracking-tight mb-2">Dashboard Administrativo</h1>
        <p className="text-body-md text-on-surface-variant">Resumen en tiempo real del taller TecnoFix.</p>
      </div>
      
      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Productos" 
          value={productsCount ?? '--'} 
          icon={Package}
          isLoading={loadingProducts}
          isError={errorProducts}
        />
        <StatCard 
          title="Total Clientes" 
          value={customersCount ?? '--'} 
          icon={Users}
          isLoading={loadingCustomers}
          isError={errorCustomers}
        />
        <StatCard 
          title="Repuestos Disponibles" 
          value={partsCount ?? '--'} 
          icon={Settings2}
          isLoading={loadingParts}
          isError={errorParts}
        />
        <StatCard 
          title="Técnicos Activos" 
          value={techniciansCount ?? '--'} 
          icon={Users}
          isLoading={loadingTechnicians}
          isError={errorTechnicians}
        />
      </div>

      {/* 2 Extra Cards (Appointments) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard 
          title="Citas para Hoy" 
          value={todayAppointments?.length ?? '--'} 
          icon={CalendarDays}
          description="Programadas para hoy"
          isLoading={loadingTodayApps}
          isError={errorTodayApps}
        />
        <StatCard 
          title="Citas Pendientes" 
          value={pendingAppointments?.length ?? '--'} 
          icon={CalendarClock}
          description="Esperando confirmación"
          isLoading={loadingPendingApps}
          isError={errorPendingApps}
        />
      </div>

      {/* Bento Grid: Table + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable 
            orders={recentOrders} 
            isLoading={loadingOrders} 
            isError={errorOrders} 
          />
        </div>
        <div className="lg:col-span-1">
          <OrdersStatusChart 
            data={statusReport} 
            isLoading={loadingStatus} 
            isError={errorStatus} 
          />
        </div>
      </div>
    </div>
  );
};

