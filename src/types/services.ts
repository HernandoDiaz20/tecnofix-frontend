export interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  active: boolean;
}

export interface ServicesResponse {
  items: Service[];
}

export interface CreateServiceRequest {
  name: string;
  price: number;
  description?: string;
}

export interface UpdateServiceRequest {
  name?: string;
  price?: number;
  description?: string;
}

export interface ToggleServiceStatusRequest {
  active: boolean;
}
