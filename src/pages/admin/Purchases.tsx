import React, { useState } from 'react';
import { useAdminPurchases, useUpdatePurchaseStatus, useReceivePurchase } from '@/api/admin/purchase-hooks';
import { PurchasesTable } from '@/components/admin/purchases/PurchasesTable';
import { PurchaseForm } from '@/components/admin/purchases/PurchaseForm';
import { PurchaseDetail } from '@/components/admin/purchases/PurchaseDetail';
import { ConfirmDialog } from '@/components/admin/products/ConfirmDialog';
import { Pagination } from '@/components/admin/products/Pagination';
import type { PurchaseRequest } from '@/types/purchases';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export const Purchases: React.FC = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useAdminPurchases(page, pageSize);
  const updateStatusMutation = useUpdatePurchaseStatus();
  const receiveMutation = useReceivePurchase();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [isReceiveConfirmOpen, setIsReceiveConfirmOpen] = useState(false);

  // Selected purchase state
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRequest | null>(null);

  const handleCreate = () => {
    setSelectedPurchase(null);
    setIsFormOpen(true);
  };

  const handleView = (purchase: PurchaseRequest) => {
    setSelectedPurchase(purchase);
    setIsDetailOpen(true);
  };

  const handleChangeStatusClick = (purchase: PurchaseRequest) => {
    setSelectedPurchase(purchase);
    setIsStatusConfirmOpen(true);
  };

  const handleReceiveClick = (purchase: PurchaseRequest) => {
    setSelectedPurchase(purchase);
    setIsReceiveConfirmOpen(true);
  };

  const confirmChangeStatus = async () => {
    if (!selectedPurchase) return;

    try {
      // Si está PENDIENTE -> ORDENADO
      const newStatus = selectedPurchase.status === 'PENDIENTE' ? 'ORDENADO' : 'CANCELADO';
      
      await updateStatusMutation.mutateAsync({
        id: selectedPurchase.id,
        data: { status: newStatus }
      });
      toast({
        title: 'Estado actualizado',
        description: `La compra ha pasado a estado ${newStatus}.`,
      });
    } catch (error) {
      let errorMessage = 'No se pudo actualizar el estado de la compra.';
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        errorMessage = apiError.error?.message || errorMessage;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsStatusConfirmOpen(false);
    }
  };

  const confirmReceive = async () => {
    if (!selectedPurchase) return;

    try {
      await receiveMutation.mutateAsync(selectedPurchase.id);
      toast({
        title: 'Compra recibida',
        description: 'La compra ha sido marcada como recibida y el stock ha sido actualizado.',
      });
    } catch (error) {
      let errorMessage = 'No se pudo recibir la compra.';
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        errorMessage = apiError.error?.message || errorMessage;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsReceiveConfirmOpen(false);
    }
  };

  const rawPurchases = data?.items || [];

  return (
    <div className="p-margin flex-1 flex flex-col gap-lg max-w-[1440px] mx-auto w-full">
      {/* Page Header & Global Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface">Compras</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Gestiona las órdenes de compra a proveedores y el ingreso de mercancía.
          </p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <button
            onClick={handleCreate}
            className="bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-[18px] h-[18px]" />
            Nueva Compra
          </button>
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm text-center">
          <span className="material-symbols-outlined text-error text-4xl mb-4">error</span>
          <p className="text-on-surface-variant font-medium">No fue posible cargar las compras. Verifica la conexión o intenta más tarde.</p>
        </div>
      ) : (
        <>
          <PurchasesTable
            purchases={rawPurchases}
            isLoading={isLoading}
            onView={handleView}
            onChangeStatus={handleChangeStatusClick}
            onReceive={handleReceiveClick}
          />

          <Pagination
            currentPage={page}
            totalItems={data?.total || 0}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modals */}
      <PurchaseForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <PurchaseDetail
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        purchaseId={selectedPurchase?.id}
      />

      <ConfirmDialog
        isOpen={isStatusConfirmOpen}
        onOpenChange={setIsStatusConfirmOpen}
        title="Cambiar estado de compra"
        description={`¿Estás seguro que deseas pasar esta compra a estado ${selectedPurchase?.status === 'PENDIENTE' ? 'ORDENADO' : 'CANCELADO'}?`}
        confirmText="Confirmar"
        onConfirm={confirmChangeStatus}
        isLoading={updateStatusMutation.isPending}
      />

      <ConfirmDialog
        isOpen={isReceiveConfirmOpen}
        onOpenChange={setIsReceiveConfirmOpen}
        title="Recibir Compra"
        description="¿Estás seguro que deseas marcar esta compra como RECIBIDA? Esta acción actualizará automáticamente el stock en el inventario y no se puede deshacer."
        confirmText="Sí, recibir e ingresar a stock"
        onConfirm={confirmReceive}
        isLoading={receiveMutation.isPending}
      />
    </div>
  );
};
