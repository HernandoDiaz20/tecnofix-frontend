import React, { useState } from 'react';
import { useAdminProducts, useToggleProductAvailability } from '@/api/admin/product-hooks';
import { ProductTable } from '@/components/admin/products/ProductTable';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { ProductDetail } from '@/components/admin/products/ProductDetail';
import { ProductMovements } from '@/components/admin/products/ProductMovements';
import { ConfirmDialog } from '@/components/admin/products/ConfirmDialog';
import { Pagination } from '@/components/admin/products/Pagination';
import type { Product } from '@/types';
import { Search, Plus, FilterX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Products: React.FC = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useAdminProducts(page, pageSize);
  const toggleMutation = useToggleProductAvailability();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMovementsOpen, setIsMovementsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Selected product state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Frontend filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleShowMovements = (product: Product) => {
    setSelectedProduct(product);
    setIsMovementsOpen(true);
  };

  const handleToggleStatusClick = (product: Product) => {
    setSelectedProduct(product);
    setIsConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedProduct) return;

    try {
      await toggleMutation.mutateAsync({
        id: selectedProduct.id,
        data: { active: !selectedProduct.active }
      });
      toast({
        title: selectedProduct.active ? 'Producto desactivado' : 'Producto activado',
        description: 'El estado del producto se ha actualizado correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del producto.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirmOpen(false);
    }
  };

  // Derived data
  const rawProducts = data?.items || [];

  // Frontend filtering (since the endpoint returns all according to docs, and we only paginate the filtered result if we do frontend pagination, 
  // but since pagination is server-side `page, pageSize`, the filter here only filters the current page. 
  // This is a known limitation when filtering without dedicated API query params).
  const filteredProducts = rawProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === ''
      ? true
      : statusFilter === 'in_stock' ? p.stock > 0
        : statusFilter === 'out_of_stock' ? p.stock === 0
          : statusFilter === 'inactive' ? !p.active
            : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-margin flex-1 flex flex-col gap-lg max-w-[1440px] mx-auto w-full">
      {/* Page Header & Global Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface">Gestión de Catálogo</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Administra el inventario de repuestos, accesorios y productos finales.
          </p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <button
            onClick={handleCreate}
            className="bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-[18px] h-[18px]" />
            Añadir Nuevo
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col lg:flex-row gap-md items-center shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/60"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-sm w-full lg:w-auto">
          <select
            className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-4 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer min-w-[150px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los Estados</option>
            <option value="in_stock">En Stock</option>
            <option value="out_of_stock">Agotado</option>
            <option value="inactive">Inactivos</option>
          </select>

          <button
            onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
            className="bg-surface-container-low text-on-surface border border-outline-variant hover:bg-surface-container p-2.5 rounded-lg transition-colors"
            title="Limpiar Filtros"
          >
            <FilterX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <ProductTable
        products={filteredProducts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatusClick}
        onView={handleView}
        onShowMovements={handleShowMovements}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={data?.total || 0}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Modals */}
      <ProductForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct || undefined}
      />

      <ProductDetail
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        product={selectedProduct}
        onEdit={handleEdit}
        onShowMovements={handleShowMovements}
      />

      <ProductMovements
        isOpen={isMovementsOpen}
        onOpenChange={setIsMovementsOpen}
        product={selectedProduct}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={selectedProduct?.active ? "Desactivar Producto" : "Activar Producto"}
        description={`¿Estás seguro que deseas ${selectedProduct?.active ? 'desactivar' : 'activar'} el producto "${selectedProduct?.name}"? ${selectedProduct?.active ? 'Este no se mostrará en el catálogo ni podrá ser utilizado en órdenes de servicio.' : 'Estará disponible nuevamente en el catálogo y órdenes de servicio.'}`}
        confirmText={selectedProduct?.active ? "Desactivar" : "Activar"}
        variant={selectedProduct?.active ? "destructive" : "default"}
        onConfirm={confirmToggleStatus}
        isLoading={toggleMutation.isPending}
      />
    </div>
  );
};
