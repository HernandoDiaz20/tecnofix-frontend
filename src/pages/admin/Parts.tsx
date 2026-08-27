import React, { useState } from 'react';
import { useAdminParts } from '@/api/admin/part-hooks';
import { PartsTable } from '@/components/admin/parts/PartsTable';
import { PartForm } from '@/components/admin/parts/PartForm';
import { Pagination } from '@/components/admin/products/Pagination';
import type { Part } from '@/types/parts';
import { Search, Plus, FilterX } from 'lucide-react';

export const Parts: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useAdminParts(page, pageSize);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Selected part state
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  // Frontend filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleCreate = () => {
    setSelectedPart(null);
    setIsFormOpen(true);
  };

  const handleEdit = (part: Part) => {
    setSelectedPart(part);
    setIsFormOpen(true);
  };

  // Derived data
  const rawParts = data?.items || [];

  // Frontend filtering (filters only the current page of items as requested by backend limitations)
  const filteredParts = rawParts.filter(p => {
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
    <div className="p-margin flex-1 flex flex-col gap-lg max-w-[1440px] mx-auto w-full">
      {/* Page Header & Global Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface">Gestión de Repuestos</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Administra el catálogo de repuestos para órdenes de servicio.
          </p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <button
            onClick={handleCreate}
            className="bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-[18px] h-[18px]" />
            Añadir Repuesto
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
            placeholder="Buscar en esta página..."
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
      <PartsTable
        parts={filteredParts}
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={data?.total || 0}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Modals */}
      <PartForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        part={selectedPart || undefined}
      />
    </div>
  );
};
