export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  imageUrl: string | null;
  categoryId: string | null;
  brand: string;
  color: string | null;
  specs: ProductSpec[] | null;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  active: boolean;
  available: boolean;
}

export type { 
  Service, 
  ServicesResponse, 
  CreateServiceRequest, 
  UpdateServiceRequest, 
  ToggleServiceStatusRequest 
} from './services';

export interface TechService {
  id: string;
  name: string;
  description: string;
  estimatedPrice: number;
  estimatedTimeMinutes: number;
  active: boolean;
  createdAt?: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  estimatedPrice: number;
  estimatedTimeMinutes: number;
}

export type UpdateServiceInput = Partial<CreateServiceInput>;

export interface Appointment {
  id: string;
  serviceId: string;
  customerName: string;
  phone: string;
  date: string; // ISO Date String
  status: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  createdAt: string;
  deviceBrand?: string;
  deviceModel?: string;
  deviceSerial?: string;
  problemDescription?: string;
  completedServices?: string | null;
  completedNotes?: string | null;
  completedAt?: string | null;
}

export type OrderStatus =
  | 'INGRESADO'
  | 'EN_REVISION'
  | 'ESPERANDO_REPUESTO'
  | 'EN_REPARACION'
  | 'REPARADO'
  | 'LISTO_PARA_ENTREGA'
  | 'ENTREGADO';

export interface WorkOrder {
  id: string;
  guideNumber: string;
  customerId: string | null;
  technicianId: string | null;
  deviceBrand: string;
  deviceModel: string;
  deviceSerial: string;
  problemDescription: string;
  devicePassword?: string | null;
  accessories: string | null;
  currentStatus: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  scheduledTime?: string | null;
  assignedTime?: string | null;
  appointmentId?: string | null;
}

export interface CreateWorkOrderInput {
  customerId?: string | null;
  technicianId?: string | null;
  deviceBrand: string;
  deviceModel: string;
  deviceSerial: string;
  problemDescription: string;
  devicePassword?: string;
  accessories?: string;
}

export interface TransitionStatusInput {
  toStatus: OrderStatus;
}

export interface ExitRegisterInput {
  finalState: string;
  repairsPerformed: string;
  partsUsed?: string;
  observations?: string;
}

export interface StatusHistoryEntry {
  id: string;
  workOrderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  userId: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  workOrderId: string;
  description: string;
  technicianId: string;
  createdAt: string;
}

export interface CreateActivityInput {
  description: string;
}

export interface Photo {
  id: string;
  workOrderId: string;
  kind: 'inicial' | 'final';
  storagePath: string;
  publicUrl: string;
  uploadedAt: string;
}

export interface Diagnostic {
  id: string;
  workOrderId: string;
  technicianId: string | null;
  observations: string;
  faults: string;
  recommendedActions: string;
  createdAt: string;
}

export interface CreateDiagnosticInput {
  observations: string;
  faults: string;
  recommendedActions: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
