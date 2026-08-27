import React, { useState } from 'react';
import { useAdminCustomers } from '@/api/admin/customer-hooks';
import { CustomersTable } from '@/components/admin/customers/CustomersTable';
import { CustomerForm } from '@/components/admin/customers/CustomerForm';
import { CustomerDetail } from '@/components/admin/customers/CustomerDetail';
import { Pagination } from '@/components/admin/products/Pagination';
import type { Customer } from '@/types/customers';
import { Search, Plus, FilterX } from 'lucide-react';

export const Customers: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useAdminCustomers(page, pageSize);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selected customer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Frontend filtering state
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = () => {
    setIsFormOpen(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  // Derived data
  const rawCustomers = data?.items || [];

  // Frontend filtering (filters only the current page of items since backend lacks global search)
  const filteredCustomers = rawCustomers.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="p-margin flex-1 flex flex-col gap-lg max-w-[1440px] mx-auto w-full">
      {/* Page Header & Global Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface">Gestión de Clientes</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Directorio y gestión de clientes registrados en el sistema.
          </p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <button
            onClick={handleCreate}
            className="bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-[18px] h-[18px]" />
            Añadir Cliente
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
            placeholder="Buscar por nombre o email en esta página..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-sm w-full lg:w-auto">
           <span className="text-[11px] text-on-surface-variant italic">
            *La búsqueda aplica solo a la página actual
          </span>
          <button
            onClick={() => setSearchTerm('')}
            className="bg-surface-container-low text-on-surface border border-outline-variant hover:bg-surface-container p-2.5 rounded-lg transition-colors ml-2"
            title="Limpiar Búsqueda"
          >
            <FilterX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <CustomersTable
        customers={filteredCustomers}
        isLoading={isLoading}
        onView={handleView}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={data?.total || 0}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Modals */}
      <CustomerForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <CustomerDetail
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        customer={selectedCustomer}
      />
    </div>
  );
};
