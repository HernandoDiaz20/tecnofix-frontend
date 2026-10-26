// DTOs específicos para el Dashboard Administrativo
// NOTA: Se utilizan los nombres de propiedades correctos (sin guión bajo).
// Si el backend temporalmente envía _stock, _currentStatus, etc., el frontend
// no implementará workarounds, simplemente esperará la corrección del contrato.

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface DashboardProduct {
  id: string;
  sku: string;
  name: string;
  stock: number;
  active: boolean;
}

export interface DashboardPart {
  id: string;
  name: string;
  stock: number;
}

export interface DashboardCustomer {
  id: string;
  fullName: string;
}

export interface DashboardWorkOrder {
  id: string;
  guideNumber: string;
  customerId: string | null;
  technicianId: string | null;
  deviceBrand: string;
  deviceModel: string;
  deviceSerial: string;
  problemDescription: string;
  accessories: string | null;
  currentStatus: 'INGRESADO' | 'EN_REVISION' | 'ESPERANDO_REPUESTO' | 'EN_REPARACION' | 'REPARADO' | 'LISTO_PARA_ENTREGA' | 'ENTREGADO';
  createdAt: string;
  // Propiedades opcionales que envuelve el backend en las relaciones (ej. customer)
  customer?: { fullName: string; email?: string }; 
}

export interface DashboardWorkOrderHistory {
  id: string;
  fromStatus: string;
  toStatus: string;
  userId: string | null;
  createdAt: string;
}

export interface DashboardWorkOrderDiagnostic {
  id: string;
  observations: string;
  faults: string;
  recommendedActions: string;
  createdAt: string;
}

export interface DashboardAppointment {
  id: string;
  customerName: string;
  date: string;
  status: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}
