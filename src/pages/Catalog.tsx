import { useState } from 'react';
import { useProducts } from '@/api/hooks';
import type { Product } from '@/types';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, ShieldCheck, Filter } from 'lucide-react';

export const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const { data, isLoading } = useProducts();

  const defaultCatalog = [
    {
      id: 'mock-1',
      sku: 'IPH-15PRO-256',
      name: 'iPhone 15 Pro 256GB',
      brand: 'Apple',
      description: 'Pantalla Super Retina XDR OLED 6.1", Chip A17 Pro, Titanio.',
      salePrice: 4500000,
      stock: 5,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
      category: 'Celulares'
    },
    {
      id: 'mock-2',
      sku: 'MBA-M2-256',
      name: 'MacBook Air M2 13.6"',
      brand: 'Apple',
      description: 'Chip M2, 8GB RAM Unificada, 256GB SSD, Teclado Magic Keyboard.',
      salePrice: 5200000,
      stock: 3,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      category: 'Portátiles'
    },
    {
      id: 'mock-3',
      sku: 'S23-ULT-256',
      name: 'Samsung Galaxy S23 Ultra',
      brand: 'Samsung',
      description: '256GB, 12GB RAM, Pantalla Dynamic AMOLED 2X 120Hz, S-Pen.',
      salePrice: 4800000,
      stock: 4,
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
      category: 'Celulares'
    },
    {
      id: 'mock-4',
      sku: 'IPAD-AIR-64',
      name: 'iPad Air 5ta Gen M1',
      brand: 'Apple',
      description: 'Pantalla Liquid Retina 10.9", Chip M1, Soporte Apple Pencil 2da Gen.',
      salePrice: 3100000,
      stock: 6,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
      category: 'Tablets'
    },
    {
      id: 'mock-5',
      sku: 'DISP-IP13-OEM',
      name: 'Pantalla Original iPhone 13',
      brand: 'Repuestos OEM',
      description: 'Módulo de pantalla completo original certificado con adhesivo de sellado.',
      salePrice: 450000,
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      category: 'Repuestos'
    },
    {
      id: 'mock-6',
      sku: 'BAT-IP12-OEM',
      name: 'Batería Original iPhone 12 / 12 Pro',
      brand: 'Repuestos OEM',
      description: 'Batería de polímero de litio 2815 mAh con control de ciclos.',
      salePrice: 180000,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
      category: 'Repuestos'
    },
  ];

  const apiProducts: Product[] = Array.isArray(data) ? data : data?.products || [];

  const rawProducts = apiProducts.length > 0
    ? apiProducts.map(p => ({
        id: p.id,
        sku: p.sku || 'SKU-GEN',
        name: p.name,
        brand: 'TecnoFix',
        description: p.description || 'Repuesto o accesorio garantizado',
        salePrice: p.salePrice || 0,
        stock: p.stock || 0,
        imageUrl: p.imageUrl || defaultCatalog[0].imageUrl,
        category: 'General'
      }))
    : defaultCatalog;

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
