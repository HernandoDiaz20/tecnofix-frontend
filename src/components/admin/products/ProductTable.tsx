import React from 'react';
import { ProductStatusBadge } from './ProductStatusBadge';
import { 
  Edit, 
  Trash2, 
  CheckCircle,
  Eye,
  Activity,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import type { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  onView: (product: Product) => void;
  onShowMovements: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  onEdit,
  onToggleStatus,
  onView,
  onShowMovements,
}) => {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm flex-1">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider w-16 text-center">Img</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider">Producto / Repuesto</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider">SKU</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider">Estado</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider text-center">Stock</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider text-right">Precio Venta</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {isLoading ? (
              // Loading State
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="py-2 px-4 text-center">
                    <Skeleton className="w-10 h-10 rounded bg-surface-container mx-auto" />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton className="h-5 w-3/4 bg-surface-container mb-1" />
                    <Skeleton className="h-3 w-1/2 bg-surface-container" />
                  </td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-24 bg-surface-container" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-5 w-16 rounded-full bg-surface-container" /></td>
                  <td className="py-3 px-4 text-center"><Skeleton className="h-4 w-8 bg-surface-container mx-auto" /></td>
                  <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-16 bg-surface-container ml-auto" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-8 w-24 bg-surface-container mx-auto" /></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="w-12 h-12 text-outline mb-2" />
                    <p className="font-medium text-lg text-on-surface">No se encontraron productos</p>
                    <p className="text-sm mt-1">Ajusta los filtros o crea un nuevo producto.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              products.map((product) => {
                const isLowStock = product.stock > 0 && product.stock <= 5;
                const isOutOfStock = product.stock === 0;

                return (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-surface-container-lowest transition-colors group ${
                      !product.active ? 'opacity-60 bg-surface-container-low/50' : ''
                    } ${
                      isLowStock ? 'bg-error-container/10' : ''
                    }`}
                  >
                    <td className="py-2 px-4 text-center align-middle">
                      <div className="w-10 h-10 rounded bg-surface-container-highest border border-outline-variant flex items-center justify-center overflow-hidden shrink-0 mx-auto">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-outline" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className={`font-body-md text-body-md font-medium text-on-surface flex items-center gap-2 ${!product.active ? 'line-through' : ''}`}>
                        {product.name}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate max-w-[250px]">
                        {product.description || 'Sin descripción'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-data-mono text-data-mono text-secondary">{product.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      <ProductStatusBadge active={product.active} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-data-mono text-data-mono font-semibold ${
                        isOutOfStock ? 'text-error line-through' : isLowStock ? 'text-error' : 'text-on-surface'
                      }`}>
                        {product.stock}
                      </span>
                      {isOutOfStock && <span className="block text-[10px] text-error font-medium">Agotado</span>}
                      {isLowStock && <span className="block text-[10px] text-error font-medium">Bajo</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-data-mono text-data-mono text-on-surface font-semibold">
                        ${product.salePrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onView(product)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors" 
                          title="Ver Detalle"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>
                        <button 
                          onClick={() => onShowMovements(product)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors" 
                          title="Movimientos"
                        >
                          <Activity className="w-[18px] h-[18px]" />
                        </button>
                        <button 
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors" 
                          title="Editar"
                        >
                          <Edit className="w-[18px] h-[18px]" />
                        </button>
                        <button 
                          onClick={() => onToggleStatus(product)}
                          className={`p-1.5 rounded transition-colors ${
                            product.active 
                              ? 'text-on-surface-variant hover:text-error hover:bg-error/10' 
                              : 'text-on-surface-variant hover:text-success hover:bg-success-container/50'
                          }`}
                          title={product.active ? 'Desactivar' : 'Activar'}
                        >
                          {product.active ? <Trash2 className="w-[18px] h-[18px]" /> : <CheckCircle className="w-[18px] h-[18px]" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
