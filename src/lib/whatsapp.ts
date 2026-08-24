export const generateWhatsAppLink = (phoneNumber: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  // Remove any non-numeric characters from the phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

export const buildPurchaseMessage = (
  customerDetails: { name: string; phone: string; address?: string },
  cartItems: { name: string; quantity: number; price: number }[]
) => {
  let message = `Hola TecnoFix, me interesa realizar la siguiente compra:\n\n`;
  
  let total = 0;
  cartItems.forEach(item => {
    const subtotal = item.quantity * item.price;
    total += subtotal;
    message += `- ${item.quantity}x ${item.name} ($${item.price.toFixed(2)})\n`;
  });

  message += `\n*Total aproximado: $${total.toFixed(2)}*\n\n`;
  message += `Mis datos:\n`;
  message += `Nombre: ${customerDetails.name}\n`;
  if (customerDetails.address) {
    message += `Dirección: ${customerDetails.address}\n`;
  }
  
  message += `\nQuedo atento(a) para coordinar el pago y entrega.`;

  return message;
};
