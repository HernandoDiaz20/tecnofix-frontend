# Integración API - TecnoFix Frontend

Este documento detalla la estructura y especificaciones de la API del backend que el frontend de TecnoFix debe consumir. Todo el acceso a la base de datos (Supabase/PostgreSQL) debe realizarse **exclusivamente** a través de estos endpoints.

## 1. Configuración Base

- **Base URL (Local):** `http://localhost:3000/api/v1`
- **Arquitectura:** Frontend (React/etc) → Backend API (Express) → Supabase/PostgreSQL.

## 2. Autenticación y Autorización

- **Tipo:** Bearer Auth (JWT) provisto por Supabase Auth.
- **Formato del Header:** `Authorization: Bearer <token>`
- **Roles Identificados:**
  - `cliente`: Puede agendar citas y ver el estado de sus equipos.
  - `tecnico`: Puede gestionar órdenes de servicio, cambiar estados de reparación, registrar diagnósticos y solicitar repuestos.
  - `administrador`: Acceso total. Puede gestionar productos, servicios, usuarios, generar reportes y ver auditorías.

## 3. Entidades Principales

1. **User (AuthUser):** ID, email, role, fullName, phone.
2. **Product:** sku, name, description, imageUrl, categoryId, purchasePrice, salePrice, stock, active, available.
3. **Service:** name, description, price, active.
4. **Appointment (Cita):** serviceId, customerName, phone, date, status.
5. **WorkOrder (Orden de Servicio):** guideNumber, customerId, technicianId, deviceBrand, deviceModel, deviceSerial, problemDescription, accessories, currentStatus.
6. **Part (Repuesto):** name, sku, stock, purchasePrice, salePrice.
7. **Customer (Cliente):** email, fullName, phone.
8. **Technician (Técnico):** fullName, email, phone, active.
9. **Warranty (Garantía):** workOrderId, periodDays, expiresAt, status, isActive.
10. **Diagnostic:** workOrderId, technicianId, observations, faults, recommendedActions.
11. **AuditLog:** userId, action, entity, entityId, details.
12. **Notification:** workOrderId, toEmail, type, status.

## 4. Estados (Máquinas de Estado)

- **WorkOrder (Órdenes):** `INGRESADO` → `EN_REVISION` → `ESPERANDO_REPUESTO` → `EN_REPARACION` → `REPARADO` → `LISTO_PARA_ENTREGA` → `ENTREGADO`.
- **Appointments (Citas):** `pendiente`, `confirmada`, `cancelada`, `completada`.
- **Warranties (Garantías):** `vigente`, `vencida`.
- **Notifications:** `pendiente`, `enviada`, `fallida`.

## 5. Endpoints Disponibles

### Autenticación (`/auth`)
- `POST /auth/register`: Registra un administrador.
- `POST /auth/login`: Inicia sesión, devuelve JWT y Refresh Token.
- `POST /auth/logout`: Cierra la sesión activa.
- `GET /auth/me`: Obtiene el perfil del usuario autenticado.

### Productos e Inventario (`/products`)
- `GET /products`: Catálogo público (solo activos).
- `POST /products`: Crea un nuevo producto (Admin).
- `GET /products/admin/all`: Todos los productos (Admin).
- `GET /products/{id}`: Detalle de producto.
- `PUT /products/{id}`: Modificar producto.
- `PATCH /products/{id}/availability`: Cambiar estado (Activo/Inactivo).
- `GET /products/{id}/movements`: Historial de inventario.
- `POST /products/{id}/movements`: Registrar entrada/salida (IN/OUT).

### Servicios (`/services`)
- `GET /services`: Catálogo de servicios públicos.
- `POST /services`: Crear servicio.
- `GET /services/admin/all`: Todos los servicios.
- `PUT /services/{id}`: Modificar servicio.
- `PATCH /services/{id}/status`: Activar/Desactivar.

### Citas (`/appointments`)
- `POST /appointments`: Agendar cita (Público).
- `GET /appointments`: Listar citas.
- `PATCH /appointments/{id}/confirm`: Confirmar.
- `PATCH /appointments/{id}/cancel`: Cancelar.

### Órdenes de Servicio (`/work-orders`)
- `GET /work-orders/track/{guideNumber}`: Seguimiento público sin autenticación.
- `POST /work-orders`: Crear orden (Ingreso de dispositivo).
- `GET /work-orders`: Listar órdenes.
- `GET /work-orders/{id}`: Detalle de la orden.
- `PATCH /work-orders/{id}/status`: Cambiar estado (valida transición).
- `GET /work-orders/{id}/history`: Historial cronológico.
- `POST /work-orders/{id}/photos`: Registrar fotos (inicial/final).
- `POST /work-orders/{id}/exit-register`: Registro de salida y condiciones.
- `GET /work-orders/{id}/warranty`: Consultar garantía.
- `POST /work-orders/{id}/warranty`: Crear garantía.
- `GET /work-orders/{id}/notifications`: Notificaciones de la orden.

### Diagnósticos (`/work-orders/{id}/diagnostics`)
- `GET`: Listar diagnósticos.
- `POST`: Registrar diagnóstico técnico.

### Repuestos (`/parts`)
- `GET /parts`: Listar repuestos.
- `POST /parts`: Crear repuesto.
- `PUT /parts/{id}`: Modificar repuesto.
- `POST /work-orders/{id}/parts`: Asociar repuesto a orden (descuenta stock).

### Clientes y Técnicos (`/customers`, `/technicians`)
- Endpoints estándar CRUD (GET, POST, detalles).
- `/customers/{id}/work-orders`: Órdenes de un cliente.
- `/technicians/{id}/work-orders`: Órdenes asignadas a un técnico.
- `/technicians/{id}/status`: Activar/Desactivar técnico.

### Reportes y Auditoría
- `GET /reports/{type}`: Reportes por tipo (`services`, `inventory`, `orders-by-status`).
- `GET /audit`: Registros de auditoría del sistema.

## 6. Manejo de Errores
La API devuelve errores con el siguiente formato unificado:
```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Mensaje descriptivo",
    "details": {}
  }
}
```

## 7. Análisis de Mockups vs Backend

Tras analizar los mockups disponibles en el diseño (Stitch) y la API del backend, la correspondencia es la siguiente:

### Funcionalidades Completamente Soportadas
1. **TecnoFix - Landing & Catálogo:** Soportado por `GET /products` y `GET /services`.
2. **Detalle de Producto:** Soportado por `GET /products/{id}`.
3. **Agendamiento de Servicio Técnico:** Soportado por `POST /appointments`.
4. **Seguimiento de Reparación:** Soportado mediante `GET /work-orders/track/{guideNumber}`.
5. **Gestión de Orden de Servicio:** Totalmente soportado por el grupo de endpoints `/work-orders` (creación, cambio de estados, diagnóstico, repuestos, registro de salida).

### Funcionalidades con Soporte Parcial / Potencialmente Faltantes
- **Dashboard Administrativo:** La pantalla muestra gráficas y métricas. El backend dispone de `GET /reports/{type}`, que proporciona datos básicos de servicios y órdenes, pero dependiendo de la complejidad visual de los gráficos en el mockup, el frontend deberá realizar agregaciones o cruzar información de varios endpoints (como `/audit`, `/work-orders`, `/products`) para renderizar todos los widgets del dashboard, ya que no existe un endpoint del tipo `/dashboard/stats` que entregue todo consolidado en una sola llamada.

---
**NOTA:** El frontend está listo para iniciar la fase de desarrollo e implementación de pantallas conectadas a estos servicios, respetando las restricciones de arquitectura impuestas.
