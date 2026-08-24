import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProduct } from '@/api/hooks';
import { buildPurchaseMessage, generateWhatsAppLink } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ShoppingBag } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  address: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const Checkout = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('product');
  
  const { data: product, isLoading } = useProduct(productId || '');
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: '', phone: '', address: '' }
  });

  const onSubmit = (values: CheckoutFormValues) => {
    if (!product) return;
    
    // Asumimos un teléfono de WhatsApp genérico de la empresa
    const whatsappCompanyPhone = '+573001234567'; 
    
    const message = buildPurchaseMessage(
      { name: values.name, phone: values.phone, address: values.address },
      [{ name: product.name, price: product.salePrice, quantity: 1 }]
    );
    
    const link = generateWhatsAppLink(whatsappCompanyPhone, message);
    window.open(link, '_blank');
  };

  if (!productId) {
    return <div className="text-center py-20 text-gray-500">El carrito está vacío.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-navy mb-8 flex items-center">
        <ShoppingBag className="mr-3 w-8 h-8 text-brand-blue" />
        Solicitud de Compra
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario */}
        <Card className="rounded-2xl shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle>Tus Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" {...form.register('name')} className="rounded-xl" placeholder="Juan Pérez" />
                {form.formState.errors.name && <p className="text-sm text-brand-error">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
                <Input id="phone" {...form.register('phone')} className="rounded-xl" placeholder="300 123 4567" />
                {form.formState.errors.phone && <p className="text-sm text-brand-error">{form.formState.errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección de Entrega (Opcional si recoge en local)</Label>
                <Textarea id="address" {...form.register('address')} className="rounded-xl" placeholder="Calle 123 #45-67..." />
              </div>

              <Button type="submit" className="w-full bg-[#25D366] hover:bg-[#20b858] text-white h-12 text-lg rounded-xl mt-6">
                <MessageCircle className="mr-2 w-5 h-5" />
                Comprar por WhatsApp
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Sin pasarelas de pago. Coordinarás el pago directamente con nuestro asesor.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card className="rounded-2xl shadow-sm border-gray-100 h-fit bg-brand-bg/50">
          <CardHeader>
            <CardTitle>Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500 animate-pulse">Cargando producto...</p>
            ) : product ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                  <div>
                    <p className="font-medium text-brand-navy">{product.name}</p>
                    <p className="text-sm text-gray-500 mt-1">1 unidad</p>
                  </div>
                  <p className="font-semibold">${product.salePrice.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-lg font-bold text-brand-navy">Total Estimado</p>
                  <p className="text-2xl font-bold text-brand-blue">${product.salePrice.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <p className="text-brand-error">Error al cargar el producto.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
