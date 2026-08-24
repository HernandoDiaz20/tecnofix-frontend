import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/api/hooks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, MessageCircle } from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProduct(id!);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton className="w-32 h-6 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-brand-navy mb-4">Producto no encontrado</h2>
        <Button asChild variant="outline">
          <Link to="/productos"><ArrowLeft className="mr-2 w-4 h-4" /> Volver al catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/productos" className="inline-flex items-center text-gray-500 hover:text-brand-blue mb-8 transition-colors">
        <ArrowLeft className="mr-2 w-4 h-4" /> Volver al catálogo
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 p-8 lg:p-12">
          {/* Imagen */}
          <div className="bg-brand-bg rounded-2xl aspect-square flex items-center justify-center p-8">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
            ) : (
              <span className="text-gray-400 text-xl font-medium">Sin imagen disponible</span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-2 flex items-center space-x-3">
              <span className="text-sm font-mono text-gray-500">SKU: {product.sku}</span>
              {product.stock > 0 ? (
                <Badge className="bg-brand-success/10 text-brand-success hover:bg-brand-success/20">Disponible</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">Agotado</Badge>
              )}
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-4">{product.name}</h1>
            <p className="text-4xl font-bold text-brand-blue mb-6">${product.salePrice.toLocaleString()}</p>
            
            <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
              <h3 className="text-lg font-semibold text-brand-navy mb-2">Descripción</h3>
              <p>{product.description || 'No hay descripción disponible para este producto.'}</p>
            </div>

            <div className="mt-auto space-y-4 pt-8 border-t border-gray-100">
              <Button asChild size="lg" className="w-full h-14 bg-brand-blue hover:bg-brand-blue/90 text-white text-lg rounded-xl" disabled={product.stock <= 0}>
                <Link to={`/carrito?product=${product.id}`}>
                  <ShoppingCart className="mr-2 w-5 h-5" /> Agregar al Carrito
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
