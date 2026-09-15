import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(1, 'El SKU es obligatorio'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  imageUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  brand: z.string().min(1, 'La marca es obligatoria'),
  color: z.string().optional(),
  specs: z.array(
    z.object({
      label: z.string().min(1, 'El label es obligatorio'),
      value: z.string().min(1, 'El valor es obligatorio'),
    })
  ).optional(),
  purchasePrice: z.coerce.number().min(0, 'El precio debe ser positivo'),
  salePrice: z.coerce.number().min(0, 'El precio debe ser positivo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo').optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
