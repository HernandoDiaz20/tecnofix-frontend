import React from 'react';
import { StatCard } from '@/components/admin/StatCard';
import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable';
import { OrdersStatusChart } from '@/components/admin/OrdersStatusChart';
import { 
  useAdminProductsCount,
  useAdminCustomersCount,
  useAdminPartsCount,
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
  const { data: recentOrders, isLoading: loadingOrders, isError: errorOrders } = useAdminRecentOrders();
  const { data: todayAppointments, isLoading: loadingTodayApps, isError: errorTodayApps } = useAdminTodayAppointments();
  const { data: pendingAppointments, isLoading: loadingPendingApps, isError: errorPendingApps } = useAdminPendingAppointments();
  const { data: statusReport, isLoading: loadingStatus, isError: errorStatus } = useAdminOrdersByStatus();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">Dashboard General</h2>
        <button className="bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span> Nueva Orden
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Productos en Inventario" 
          value={productsCount ?? '--'} 
          icon="inventory_2"
          isLoading={loadingProducts}
          isError={errorProducts}
        />
        <StatCard 
          title="Stock Bajo" 
          value="N/D" 
          icon="warning"
          description="Datos no disponibles"
        />
        <StatCard 
          title="Órdenes Activas" 
          value="N/D" 
          icon="build"
          description="En desarrollo"
        />
        <StatCard 
          title="Citas de Hoy" 
          value={todayAppointments?.length ?? '--'} 
          icon="calendar_today"
          isLoading={loadingTodayApps}
          isError={errorTodayApps}
        />
      </div>

      {/* Extra KPIs (Para conservar las métricas que sí funcionan) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard 
          title="Total Clientes" 
          value={customersCount ?? '--'} 
          icon="group"
          isLoading={loadingCustomers}
          isError={errorCustomers}
        />
        <StatCard 
          title="Repuestos Disponibles" 
          value={partsCount ?? '--'} 
          icon="build_circle"
          isLoading={loadingParts}
          isError={errorParts}
        />
        <StatCard 
          title="Citas Pendientes" 
          value={pendingAppointments?.length ?? '--'} 
          icon="pending_actions"
          isLoading={loadingPendingApps}
          isError={errorPendingApps}
        />
      </div>

      {/* Bento Grid Layout for Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6 flex flex-col">
          <h3 className="text-xl font-semibold text-on-surface mb-4">Servicios Semanales</h3>
          <div className="flex-1 w-full min-h-[250px] relative flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-outline text-4xl mb-2 opacity-50">show_chart</span>
            <p className="text-on-surface-variant font-medium">Funcionalidad en desarrollo</p>
            <p className="text-sm text-outline mt-1">El gráfico de tendencias requiere soporte de datos históricos.</p>
          </div>
        </div>

        {/* Right Column: Status & Alerts */}
        <div className="space-y-6 flex flex-col">
          <OrdersStatusChart 
            data={statusReport} 
            isLoading={loadingStatus} 
            isError={errorStatus} 
          />

          {/* Alerts Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-on-surface">Alertas</h3>
              <button className="text-primary text-sm font-semibold hover:underline">Ver todas</button>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="material-symbols-outlined text-outline text-3xl mb-2 opacity-50">notifications_off</span>
              <p className="text-on-surface-variant text-sm font-medium">Alertas no disponibles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="mb-8">
        <RecentOrdersTable 
          orders={recentOrders} 
          isLoading={loadingOrders} 
          isError={errorOrders} 
        />
      </div>
    </>
  );
};

