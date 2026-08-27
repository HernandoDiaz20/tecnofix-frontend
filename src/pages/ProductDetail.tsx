import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/api/hooks';
import { 
  ChevronRight, 
  Cpu, 
  Smartphone, 
  Camera, 
  ShieldCheck, 
  MessageCircle, 
  Minus, 
  Plus, 
  CheckCircle,
  X,
  Send
} from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: apiProduct } = useProduct(id || '');

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for WhatsApp Modal
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Fallback / mock details if backend ID is mock or empty
  const defaultProduct = {
    id: id || 'mock-1',
    name: 'iPhone 15 Pro 256GB',
    brand: 'Apple',
    color: undefined as string | undefined,
    sku: 'IPH-15PRO-TIT',
    price: 4500000,
    stock: 5,
    description: 'El iPhone 15 Pro está fabricado con titanio de calidad aeroespacial, lo que lo hace ligero y resistente. Cuenta con el chip A17 Pro y un sistema de cámaras Pro de última generación.',
    specs: [
      { label: 'Procesador', value: 'Chip A17 Pro, CPU de 6 núcleos y GPU de 6 núcleos.', icon: Cpu },
      { label: 'Pantalla', value: 'Super Retina XDR OLED de 6.1" ProMotion 120Hz.', icon: Smartphone },
      { label: 'Cámara', value: 'Sistema Pro de 48 MP con teleobjetivo 3x y ultra gran angular.', icon: Camera },
      { label: 'Garantía', value: '1 año de garantía oficial directamente con TecnoFix.', icon: ShieldCheck },
    ],
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
    ]
  };

  const product = apiProduct
    ? {
        id: apiProduct.id,
        name: apiProduct.name,
        brand: apiProduct.brand || 'Original OEM',
        color: apiProduct.color,
        sku: apiProduct.sku || 'SKU-TFX-01',
        price: apiProduct.salePrice || 0,
        stock: apiProduct.stock || 0,
        description: apiProduct.description || 'Componente o equipo verificado y garantizado.',
        specs: apiProduct.specs && Array.isArray(apiProduct.specs) && apiProduct.specs.length > 0 ? apiProduct.specs : defaultProduct.specs,
        images: apiProduct.imageUrl ? [apiProduct.imageUrl, ...defaultProduct.images.slice(1)] : defaultProduct.images
      }
    : defaultProduct;

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = product.price * quantity;
    const message = `*SOLICITUD DE COMPRA - TECNOFIX*\n\n` +
      `📦 *Producto:* ${product.name}\n` +
      `🔢 *Cantidad:* ${quantity}\n` +
      `💰 *Total estimado:* $${total.toLocaleString('es-CO')} COP\n` +
      `🏷️ *SKU:* ${product.sku}\n\n` +
      `👤 *Nombre:* ${customerName || 'No especificado'}\n` +
      `📱 *Teléfono:* ${customerPhone || 'No especificado'}\n` +
      `📍 *Ciudad:* ${customerCity || 'No especificada'}\n` +
      (customerNotes ? `📝 *Notas:* ${customerNotes}\n` : '') +
      `\nQuedo atento(a) a su confirmación de disponibilidad y método de pago.`;

    const cleanPhone = '573001234567';
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-[#434655] mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
        <ChevronRight className="w-4 h-4 text-[#737686]" />
        <Link to="/productos" className="hover:text-primary transition-colors">Productos</Link>
        <ChevronRight className="w-4 h-4 text-[#737686]" />
        <span className="font-semibold text-[#191C1E] line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] overflow-hidden aspect-[4/3] flex items-center justify-center p-8 relative">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain transition-all duration-300"
            />
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`bg-white rounded-xl border p-2 aspect-square flex items-center justify-center overflow-hidden transition-all ${
                  selectedImageIndex === idx
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                    : 'border-[#E0E3E5] hover:border-primary/50'
                }`}
              >
                <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Details & Purchase (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#434655] uppercase tracking-wider">
                {product.brand}
              </span>
              {product.color && (
                <span className="bg-[#F2F4F6] text-[#434655] text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-[#E0E3E5]">
                  Color: {product.color}
                </span>
              )}
              <span className="bg-[#DCFCE7] text-[#16A34A] text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-[#16A34A]/20">
                <CheckCircle className="w-3.5 h-3.5" />
                En Stock ({product.stock})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191C1E] tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs text-[#737686] font-mono mt-1">SKU: {product.sku}</p>

            <div className="text-3xl sm:text-4xl font-black text-primary mt-4">
              ${product.price.toLocaleString('es-CO')}{' '}
              <span className="text-sm font-normal text-[#434655]">COP</span>
            </div>
          </div>

          {/* Specifications Box */}
          <div className="bg-white border border-[#E0E3E5] rounded-2xl p-5 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#191C1E] uppercase tracking-wider mb-4 border-b border-[#E0E3E5] pb-2.5">
              Especificaciones Principales
            </h3>
            <ul className="space-y-3.5">
              {product.specs.map((spec: any, index: number) => {
                const Icon = spec.icon || CheckCircle;
                return (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#191C1E]">{spec.label}</p>
                      <p className="text-xs sm:text-sm text-[#434655]">{spec.value}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#191C1E] mb-2">
              Cantidad
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-11 rounded-xl border border-[#E0E3E5] bg-white flex items-center justify-center text-[#191C1E] hover:bg-[#F2F4F6] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-14 text-center font-bold text-lg text-[#191C1E]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-11 h-11 rounded-xl border border-[#E0E3E5] bg-white flex items-center justify-center text-[#191C1E] hover:bg-[#F2F4F6] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* WhatsApp CTA Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-base py-4 px-6 rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            Comprar por WhatsApp
          </button>
          <p className="text-xs text-center text-[#434655] mt-2.5">
            Solicita tu equipo de forma rápida y segura sin pasarelas de pago.
          </p>
        </div>
      </div>

      {/* Modal Resumen de Solicitud (WhatsApp) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E0E3E5] max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#F2F4F6] px-6 py-4 flex justify-between items-center border-b border-[#E0E3E5]">
              <h3 className="text-lg font-bold text-[#191C1E] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Resumen de Solicitud
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#737686] hover:text-[#191C1E] hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleWhatsAppSubmit} className="p-6 space-y-4">
              <div className="bg-[#F7F9FB] rounded-xl p-4 border border-[#E0E3E5] flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#191C1E] text-sm">{product.name}</p>
                  <p className="text-xs text-[#434655]">Cantidad: {quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-primary text-base">
                    ${(product.price * quantity).toLocaleString('es-CO')} COP
                  </p>
                  <p className="text-[11px] text-[#737686]">Precio estimado</p>
                </div>
              </div>

              <div>
                <label className="tecno-label">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="tecno-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="tecno-label">Teléfono (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 300 123 4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="tecno-input"
                  />
                </div>
                <div>
                  <label className="tecno-label">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej. Bogotá / Medellín"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="tecno-input"
                  />
                </div>
              </div>

              <div>
                <label className="tecno-label">Observaciones (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Color preferido, dudas técnicas o método de entrega..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="tecno-input resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#E0E3E5] flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E0E3E5] text-sm font-semibold text-[#434655] hover:bg-[#F2F4F6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Continuar por WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
