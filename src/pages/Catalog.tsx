import { useState } from 'react';
import { useProducts } from '@/api/hooks';
import { Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, isError } = useProducts();

  // The API likely returns { products: Product[], total: number } or similar, fallback array
  const products: Product[] = Array.isArray(data) ? data : data?.products || [];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Catálogo de Repuestos</h1>
          <p className="text-gray-600 mt-2">Encuentra repuestos originales y verificados.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            className="pl-10 h-12 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} className="rounded-2xl overflow-hidden shadow-sm">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardHeader className="p-4"><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent className="p-4 pt-0"><Skeleton className="h-4 w-1/2" /></CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-brand-error/20">
          <p className="text-brand-error text-lg font-medium">Hubo un error al cargar el catálogo.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No se encontraron productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link key={product.id} to={`/productos/${product.id}`} className="block group">
              <Card className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-brand-blue transition-colors h-full flex flex-col">
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-gray-400">Sin imagen</span>
                  )}
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-brand-navy line-clamp-2">{product.name}</CardTitle>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1">SKU: {product.sku}</p>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-brand-navy">${product.salePrice.toLocaleString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 border-t border-gray-100 mt-auto">
                  <div className="w-full flex justify-between items-center mt-3">
                    {product.stock > 0 ? (
                      <Badge className="bg-brand-success/10 text-brand-success hover:bg-brand-success/20">En stock ({product.stock})</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">Agotado</Badge>
                    )}
                    <Button variant="ghost" className="text-brand-blue p-0 hover:bg-transparent hover:text-brand-blue/80">Ver detalle</Button>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
