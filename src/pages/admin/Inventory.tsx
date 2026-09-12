import React, { useState } from 'react';
import { useAdminProducts, useToggleProductAvailability } from '@/api/admin/product-hooks';
import { useAdminParts } from '@/api/admin/part-hooks';
import { ProductTable } from '@/components/admin/products/ProductTable';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { ProductDetail } from '@/components/admin/products/ProductDetail';
import { ProductMovements } from '@/components/admin/products/ProductMovements';
import { ConfirmDialog } from '@/components/admin/products/ConfirmDialog';
import { PartsTable } from '@/components/admin/parts/PartsTable';
import { PartForm } from '@/components/admin/parts/PartForm';
import { Pagination } from '@/components/admin/products/Pagination';
import type { Product } from '@/types';
import type { Part } from '@/types/parts';
import { Search, FilterX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type ActiveTab = 'products' | 'parts';

export const Inventory: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');

  // Products state
  const [productPage, setProductPage] = useState(1);
  const productPageSize = 10;
  const { data: productsData, isLoading: loadingProducts, isError: errorProducts } = useAdminProducts(productPage, productPageSize);
  const toggleMutation = useToggleProductAvailability();

  // Parts state
  const [partPage, setPartPage] = useState(1);
  const partPageSize = 10;
  const { data: partsData, isLoading: loadingParts, isError: errorParts } = useAdminParts(partPage, partPageSize);

  // Modal states
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isPartFormOpen, setIsPartFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMovementsOpen, setIsMovementsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Selected items
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  // Frontend filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // === Type selector ===
  const handleNewItem = () => {
    setIsTypeSelectorOpen(true);
  };

  const handleSelectProduct = () => {
    setIsTypeSelectorOpen(false);
    setSelectedProduct(null);
    setIsProductFormOpen(true);
  };

  const handleSelectPart = () => {
    setIsTypeSelectorOpen(false);
    setSelectedPart(null);
    setIsPartFormOpen(true);
  };

  // === Product handlers ===
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleViewProduct = (product: Product) => {
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
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del producto.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirmOpen(false);
    }
  };

  // === Part handlers ===
  const handleEditPart = (part: Part) => {
    setSelectedPart(part);
    setIsPartFormOpen(true);
  };

  // === Filtering ===
  const filteredProducts = (productsData?.items || []).filter(p => {
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

  const filteredParts = (partsData?.items || []).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === ''
      ? true
      : statusFilter === 'in_stock' ? p.stock > 0
        : statusFilter === 'out_of_stock' ? p.stock === 0
          : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Inventario</h2>
          <p className="text-on-surface-variant text-sm mt-1">Consulta y administra productos y repuestos registrados.</p>
        </div>
        <button
          onClick={handleNewItem}
          className="bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span> Nuevo artículo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => { setActiveTab('products'); setSearchTerm(''); setStatusFilter(''); }}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-semibold transition-all",
            activeTab === 'products'
              ? "bg-primary-container text-on-primary-container shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <span className="material-symbols-outlined text-sm align-middle mr-1.5">inventory_2</span>
          Productos
        </button>
        <button
          onClick={() => { setActiveTab('parts'); setSearchTerm(''); setStatusFilter(''); }}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-semibold transition-all",
            activeTab === 'parts'
              ? "bg-primary-container text-on-primary-container shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <span className="material-symbols-outlined text-sm align-middle mr-1.5">build_circle</span>
          Repuestos
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center shadow-sm mb-6">
        <div className="relative flex-1 w-full group">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            className="w-full bg-surface border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/60"
            placeholder={activeTab === 'products' ? 'Buscar producto por nombre o SKU...' : 'Buscar repuesto por nombre o SKU...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            className="appearance-none bg-surface border border-outline-variant rounded-lg py-2.5 px-4 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer min-w-[150px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los Estados</option>
            <option value="in_stock">En Stock</option>
            <option value="out_of_stock">Agotado</option>
            {activeTab === 'products' && <option value="inactive">Inactivos</option>}
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

      {/* Content */}
      {activeTab === 'products' ? (
        <>
          {errorProducts ? (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm text-center">
              <span className="material-symbols-outlined text-error text-4xl mb-4">error</span>
              <p className="text-on-surface-variant font-medium">No fue posible cargar los productos.</p>
            </div>
          ) : (
            <>
              <ProductTable
                products={filteredProducts}
                isLoading={loadingProducts}
                onEdit={handleEditProduct}
                onToggleStatus={handleToggleStatusClick}
                onView={handleViewProduct}
                onShowMovements={handleShowMovements}
              />
              <Pagination
                currentPage={productPage}
                totalItems={productsData?.total || 0}
                pageSize={productPageSize}
                onPageChange={setProductPage}
              />
            </>
          )}
        </>
      ) : (
        <>
          {errorParts ? (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm text-center">
              <span className="material-symbols-outlined text-error text-4xl mb-4">error</span>
              <p className="text-on-surface-variant font-medium">No fue posible cargar los repuestos.</p>
            </div>
          ) : (
            <>
              <PartsTable
                parts={filteredParts}
                isLoading={loadingParts}
                onEdit={handleEditPart}
              />
              <Pagination
                currentPage={partPage}
                totalItems={partsData?.total || 0}
                pageSize={partPageSize}
                onPageChange={setPartPage}
              />
            </>
          )}
        </>
      )}

      {/* === MODALS === */}

      {/* Type Selector Modal */}
      <Dialog open={isTypeSelectorOpen} onOpenChange={setIsTypeSelectorOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">¿Qué deseas registrar?</DialogTitle>
            <DialogDescription className="text-on-surface-variant pt-2">
              Selecciona el tipo de artículo que deseas agregar al inventario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={handleSelectProduct}
              className="flex flex-col items-center gap-3 p-6 bg-surface-container-lowest border-2 border-outline-variant/50 rounded-xl hover:border-primary hover:bg-primary-container/10 transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-on-primary-container text-2xl">inventory_2</span>
              </div>
              <span className="font-semibold text-on-surface text-sm">Producto</span>
              <span className="text-xs text-on-surface-variant text-center">Artículos para venta directa</span>
            </button>
            <button
              onClick={handleSelectPart}
              className="flex flex-col items-center gap-3 p-6 bg-surface-container-lowest border-2 border-outline-variant/50 rounded-xl hover:border-primary hover:bg-primary-container/10 transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-on-secondary-container text-2xl">build_circle</span>
              </div>
              <span className="font-semibold text-on-surface text-sm">Repuesto</span>
              <span className="text-xs text-on-surface-variant text-center">Piezas para reparación</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Form */}
      <ProductForm
        isOpen={isProductFormOpen}
        onOpenChange={setIsProductFormOpen}
        product={selectedProduct || undefined}
      />

      {/* Part Form */}
      <PartForm
        isOpen={isPartFormOpen}
        onOpenChange={setIsPartFormOpen}
        part={selectedPart || undefined}
      />

      {/* Product Detail */}
      <ProductDetail
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        product={selectedProduct}
        onEdit={handleEditProduct}
        onShowMovements={handleShowMovements}
      />

      {/* Product Movements */}
      <ProductMovements
        isOpen={isMovementsOpen}
        onOpenChange={setIsMovementsOpen}
        product={selectedProduct}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={selectedProduct?.active ? "Desactivar Producto" : "Activar Producto"}
        description={`¿Estás seguro que deseas ${selectedProduct?.active ? 'desactivar' : 'activar'} el producto "${selectedProduct?.name}"? ${selectedProduct?.active ? 'Este no se mostrará en el catálogo.' : 'Estará disponible nuevamente.'}`}
        confirmText={selectedProduct?.active ? "Desactivar" : "Activar"}
        variant={selectedProduct?.active ? "destructive" : "default"}
        onConfirm={confirmToggleStatus}
        isLoading={toggleMutation.isPending}
      />
    </>
  );
};
