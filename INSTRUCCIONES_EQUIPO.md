# Guía de Integración - Proyecto Frontend TecnoFix

¡Hola! Este documento describe el estado actual del frontend de TecnoFix y establece las bases para que puedas continuar con el desarrollo del Panel de Administración de forma limpia y ordenada.

## 1. Lo que se ha implementado hasta ahora

Actualmente, el repositorio cuenta con el **Portal de Clientes** implementado y diseñado (Catálogo, Agendar Citas, Seguimiento). 
* Todo el diseño se basó en los mockups de alta fidelidad, utilizando Tailwind CSS y `shadcn/ui`.
* Las llamadas al API están preparadas usando Axios y TanStack Query (React Query) en la carpeta `src/api`.
* *Nota:* Por ahora el portal público está usando datos mock de prueba como fallback para visualizar la UI mientras se estabilizan los datos reales de la base de datos del backend.

## 2. Arquitectura de Rutas y Layouts

Para mantener el código ordenado y separar responsabilidades, hemos dividido la aplicación a nivel de enrutamiento (React Router):

### Portal del Cliente (Público)
* Utiliza el `ClientLayout` (que incluye el Header público y Footer).
* Rutas principales: `/`, `/catalogo`, `/agendar`, `/seguimiento`, `/productos/:id`.
* **Seguridad:** El portal público NO requiere autenticación ni login.

### Panel de Administración (Tu responsabilidad)
Para desarrollar el panel interno sin afectar el portal público, te sugiero la siguiente estructura:
1. Crea un **`AdminLayout`** en `src/layouts/AdminLayout.tsx` (Este tendrá el sidebar, nav interno, etc.).
2. Toda la sección administrativa debe estar anidada bajo la ruta **`/admin`**.
3. Rutas sugeridas: 
   * `/admin/login` (Vista aislada sin layout o con layout de Auth)
   * `/admin/dashboard`
   * `/admin/ordenes`
   * `/admin/inventario`

Al separar esto, garantizamos que el cliente nunca vea los botones de login del admin, y que las credenciales de los empleados queden totalmente aisladas.

## 3. Configuración y Conexión con Backend

Cuando clones este repositorio para trabajar:

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Variables de entorno:
   Si el backend de Tecnotaller está corriendo en tu máquina en el puerto `3000` (por defecto), no necesitas configurar nada.
   Si tu backend corre en otro puerto (ej. `8080`), crea un archivo `.env` en la raíz del proyecto con la siguiente variable:
   ```env
   VITE_API_URL=http://localhost:8080/api/v1
   ```

3. Levanta el servidor:
   ```bash
   npm run dev
   ```

