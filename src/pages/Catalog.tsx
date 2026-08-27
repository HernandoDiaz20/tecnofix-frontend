import { useState } from 'react';
import { useProducts } from '@/api/hooks';
import type { Product } from '@/types';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, ShieldCheck, Filter } from 'lucide-react';

export const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const { data, isLoading } = useProducts();

  const apiProducts: Product[] = Array.isArray(data) ? data : (data?.items || data?.products || []);

  const rawProducts = apiProducts.map(p => ({
    id: p.id,
    sku: p.sku || 'SKU-GEN',
    name: p.name,
    brand: p.brand || 'TecnoFix',
    description: p.description || '',
    salePrice: p.salePrice || 0,
    stock: p.stock || 0,
    imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    category: p.categoryId || 'General'
  }));

  const categories = ['Todos', 'Celulares', 'Tablets', 'Portátiles', 'Repuestos'];

  const filtered = rawProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4" />
          Tienda Oficial TecnoFix
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#191C1E] tracking-tight">
          Catálogo de Productos y Repuestos
        </h1>
        <p className="text-[#434655] text-base mt-2 max-w-2xl">
          Dispositivos y componentes certificados con entrega rápida y compra directa por WhatsApp.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-[#E0E3E5] shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737686] w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, modelo o SKU..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#F7F9FB] border border-[#E0E3E5] rounded-xl text-sm text-[#191C1E] placeholder:text-[#737686] focus:outline-none focus:border-primary focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-[#737686] hidden sm:block mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-[#F2F4F6] text-[#434655] hover:bg-[#E6E8EA] hover:text-[#191C1E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#E0E3E5] animate-pulse space-y-4">
              <div className="h-48 bg-[#F2F4F6] rounded-xl" />
              <div className="h-6 bg-[#F2F4F6] rounded w-3/4" />
              <div className="h-4 bg-[#F2F4F6] rounded w-1/2" />
              <div className="h-10 bg-[#F2F4F6] rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-[#E0E3E5]">
          <p className="text-lg font-semibold text-[#191C1E]">No se encontraron productos</p>
          <p className="text-sm text-[#434655] mt-1">Intenta con otro término de búsqueda o categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {filtered.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] overflow-hidden flex flex-col hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="h-56 bg-[#F2F4F6] p-6 flex items-center justify-center relative overflow-hidden">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
                      {prod.brand}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#191C1E] mt-0.5">
                      {prod.name}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      prod.stock > 0
                        ? 'bg-[#DCFCE7] text-[#16A34A]'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {prod.stock > 0 ? `Stock (${prod.stock})` : 'Agotado'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#434655] line-clamp-2 mb-4">
                  {prod.description}
                </p>

                <div className="mt-auto pt-4 border-t border-[#E0E3E5] flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ${prod.salePrice.toLocaleString('es-CO')}{' '}
                    <span className="text-xs font-normal text-[#434655]">COP</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <Link
                    to={`/productos/${prod.id}`}
                    className="flex items-center justify-center bg-[#F2F4F6] hover:bg-[#E6E8EA] text-[#191C1E] text-sm font-semibold py-2.5 rounded-xl transition-colors text-center"
                  >
                    Ver detalles
                  </Link>
                  <a
                    href={`https://wa.me/573001234567?text=${encodeURIComponent(
                      `Hola TecnoFix, estoy interesado en comprar el ${prod.name} ($${prod.salePrice.toLocaleString('es-CO')} COP).`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
