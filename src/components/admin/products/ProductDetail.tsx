import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProductStatusBadge } from './ProductStatusBadge';
import { Edit2, Package, Tag, Hash, Image as ImageIcon, Briefcase, Palette, ListChecks } from 'lucide-react';
import type { Product } from '@/types';

interface ProductDetailProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  onShowMovements: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  isOpen,
  onOpenChange,
  product,
  onEdit,
  onShowMovements,
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-surface-container-low p-6 border-b border-outline-variant flex items-start gap-4 shrink-0">
          <div className="w-20 h-20 bg-surface-container-highest rounded-lg border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-outline" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-semibold text-on-surface">
                  {product.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <ProductStatusBadge active={product.active} />
                  {product.available ? (
                    <span className="text-[11px] font-medium text-success bg-success-container/30 px-2 py-0.5 rounded-full">Disponible</span>
                  ) : (
                    <span className="text-[11px] font-medium text-error bg-error-container/30 px-2 py-0.5 rounded-full">Agotado</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                <Hash className="w-4 h-4" /> SKU
              </div>
              <p className="font-data-mono text-on-surface font-medium">{product.sku}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                <Package className="w-4 h-4" /> Stock Actual
              </div>
              <p className="font-data-mono text-on-surface font-medium text-lg">{product.stock}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                <Tag className="w-4 h-4" /> Precio Venta
              </div>
              <p className="font-data-mono text-on-surface font-medium">${product.salePrice.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                <Tag className="w-4 h-4" /> Precio Compra
              </div>
              <p className="font-data-mono text-on-surface-variant">${product.purchasePrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/50">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                <Briefcase className="w-4 h-4" /> Marca
              </div>
              <p className="text-on-surface font-medium">{product.brand || 'Genérico'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                <Palette className="w-4 h-4" /> Color
              </div>
              <p className="text-on-surface font-medium">
                {product.color ? product.color : <span className="text-outline italic">Sin especificar</span>}
              </p>
            </div>
          </div>

          {product.description && (
            <div className="space-y-1 pt-4 border-t border-outline-variant/50">
              <h4 className="text-sm font-medium text-on-surface-variant">Descripción</h4>
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t border-outline-variant/50">
             <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium mb-2">
                <ListChecks className="w-4 h-4" /> Especificaciones
             </div>
             {product.specs && product.specs.length > 0 ? (
               <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
                 <table className="w-full text-sm">
                   <tbody className="divide-y divide-outline-variant/50">
                     {product.specs.map((spec, i) => (
                       <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                         <td className="py-2 px-3 font-medium text-on-surface-variant w-1/3 bg-surface-container-lowest/50 border-r border-outline-variant/50">
                           {spec.label}
                         </td>
                         <td className="py-2 px-3 text-on-surface">
                           {spec.value}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
               <p className="text-sm text-outline italic">Sin especificaciones</p>
             )}
          </div>

        </div>

        <div className="bg-surface-container-lowest p-4 border-t border-outline-variant flex justify-end gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onShowMovements(product);
            }}
            className="text-on-surface-variant"
          >
            Ver Movimientos
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEdit(product);
            }}
            className="bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
