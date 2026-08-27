export interface Technician {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateTechnicianRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
}

export interface ToggleTechnicianStatusRequest {
  active: boolean;  // boolean real, siempre
}

// Misma estructura snake_case que clientes
export interface TechnicianWorkOrder {
  id: string;
  guide_number: string;
  current_status: string;
}

export interface TechnicianWorkOrdersResponse {
  items: TechnicianWorkOrder[];
}
