export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  imageUrl: string | null;
  categoryId: string | null;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  active: boolean;
  available: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  serviceId: string;
  customerName: string;
  phone: string;
  date: string; // ISO Date String
  status: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  createdAt: string;
}

export interface WorkOrder {
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
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
