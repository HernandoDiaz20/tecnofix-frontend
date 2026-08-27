export interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  createdAt: string;
}

export interface CreateCustomerRequest {
  fullName: string;
  email?: string | null;
  phone?: string | null;
}

// Para GET /customers/:id/work-orders — snake_case del backend
export interface CustomerWorkOrder {
  id: string;
  guide_number: string;    // snake_case real del backend
  current_status: string;  // snake_case real del backend
}

export interface CustomerWorkOrdersResponse {
  items: CustomerWorkOrder[];
}
