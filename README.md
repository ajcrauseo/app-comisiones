# Comisiones de Celes 💅

Aplicación web para la gestión y control de servicios realizados y el cálculo automático de comisiones. Diseñada para ser rápida, segura y fácil de usar desde dispositivos móviles.

## 🚀 Características

- **Gestión de Servicios:** Registro de fecha, cliente y monto.
- **Cálculo Automático:** Cálculo de comisiones basado en un porcentaje configurable.
- **Filtros por Mes:** Visualización histórica de servicios y ganancias mensuales.
- **Seguridad:** 
  - Acceso protegido por contraseña.
  - Sesiones seguras mediante variables de entorno.
  - Middleware de protección de rutas.
  - Encabezados de seguridad HTTP (CSP, HSTS, etc.).
- **Diseño Responsive:** Optimizado para smartphones y tablets.

## 🛠️ Tecnologías

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Base de Datos:** PostgreSQL (vía `@vercel/postgres` o `pg`)
- **Estilos:** Vanilla CSS (Moderno y ligero)
- **Iconos:** [Lucide React](https://lucide.dev/)

## ⚙️ Configuración

Para ejecutar este proyecto localmente o en producción, necesitas configurar las siguientes variables de entorno en un archivo `.env.local`:

```bash
# Conexión a la base de datos
POSTGRES_URL="postgres://usuario:password@host:puerto/dbname"

# Seguridad de la aplicación
APP_PASSWORD="tu_contraseña_para_login"
SESSION_SECRET="una_cadena_aleatoria_para_la_sesion"
```

## 🛠️ Desarrollo Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📦 Despliegue en Vercel

La aplicación está optimizada para desplegarse en [Vercel](https://vercel.com):

1. Conecta tu repositorio a un nuevo proyecto en Vercel.
2. En la sección **Storage**, crea una base de datos **Postgres**.
3. Asegúrate de configurar `APP_PASSWORD` y `SESSION_SECRET` en las **Environment Variables** del proyecto.
4. La aplicación inicializará automáticamente las tablas en el primer acceso.

## 🔒 Seguridad Aplicada

Este proyecto ha sido auditado y mejorado con las siguientes medidas:
- Validación de sesiones en todas las **Server Actions**.
- Uso de **Middleware** para proteger el acceso a rutas privadas.
- Implementación de **CSP (Content Security Policy)** para prevenir ataques XSS.
- Desactivación de contraseñas por defecto en el código fuente.
