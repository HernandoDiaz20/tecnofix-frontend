import React, { useState } from 'react';
import { useAdminCustomers, useDeleteCustomer } from '@/api/admin/customer-hooks';
import { CustomersTable } from '@/components/admin/customers/CustomersTable';
import { CustomerForm } from '@/components/admin/customers/CustomerForm';
import { CustomerDetail } from '@/components/admin/customers/CustomerDetail';
import { ConfirmDialog } from '@/components/admin/products/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Customer } from '@/types/customers';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export const Customers: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError } = useAdminCustomers(page, pageSize);
  const deleteMutation = useDeleteCustomer();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);

  const handleCreate = () => {
    setSelectedCustomer(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleDeleteRequest = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCustomer) return;
    
    try {
      await deleteMutation.mutateAsync(selectedCustomer.id);
      toast({
        title: 'Cliente eliminado',
        description: 'El cliente se ha eliminado correctamente.',
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      // Capture 400 Bad Request or similar error (like active work orders)
      let errorMessage = 'Ocurrió un error al eliminar el cliente.';
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        errorMessage = apiError.error?.message || errorMessage;
      }
      
      toast({
        title: 'No se puede eliminar el cliente',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-background tracking-tight">Clientes</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Gestión de clientes registrados
          </p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-primary text-on-primary hover:bg-primary/90 shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo cliente
        </Button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-outline-variant p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-on-surface-variant text-sm">Cargando clientes...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-error text-center">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <p>Ocurrió un error al cargar los clientes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <CustomersTable
              customers={data?.items || []}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />

            {/* Paginación simple basada en 'total' si hay más de 1 página */}
            {data && data.total > pageSize && (
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                <span className="text-sm text-on-surface-variant">
                  Mostrando {Math.min((page - 1) * pageSize + 1, data.total)} a {Math.min(page * pageSize, data.total)} de {data.total} clientes
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * pageSize >= data.total}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CustomerForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        customer={selectedCustomer}
      />

      <CustomerDetail
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        customer={selectedCustomer}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Estás seguro de que deseas eliminar este cliente?"
        description={`Esta acción es permanente y no se puede deshacer. Vas a eliminar a ${selectedCustomer?.fullName}. Si el cliente tiene órdenes de servicio activas, la acción será denegada por el sistema.`}
        confirmText="Eliminar cliente"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
