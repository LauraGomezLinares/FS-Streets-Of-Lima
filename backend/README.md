# Streets of Lima — Backend (AP2)

Backend para cumplir los requerimientos 1–9 de la consigna: API REST + DB relacional + JWT + OTP + Admin + WebSockets.

## 1. Instalar

```bash
cd streets-of-lima-backend
npm install
```

## 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con:
- Tu `DATABASE_URL` (puedes crear una Postgres gratis en [Neon](https://neon.tech) o [Railway](https://railway.app) en 2 minutos)
- Tu `JWT_SECRET` (cualquier string largo random)
- Tus credenciales SMTP para el OTP (con Gmail: crea una [App Password](https://myaccount.google.com/apppasswords))

## 3. Crear las tablas en la base de datos

```bash
npx prisma migrate dev --name init
```

Esto lee `prisma/schema.prisma` y crea todas las tablas automáticamente.

## 4. Crear tu primer usuario ADMIN

Por ahora no hay endpoint para crear admins (por seguridad). Dos opciones:

**Opción A (recomendada):** registra un usuario normal desde `/auth/register`, y luego en `npx prisma studio` (abre una GUI en el navegador) cambias manualmente su columna `role` de `PLAYER` a `ADMIN`.

**Opción B:** corre `npx prisma studio` y crea el registro directamente ahí.

## 5. Levantar el servidor

```bash
npm run dev
```

Debe quedar corriendo en `http://localhost:4000`.

## Flujo de autenticación (cómo conectarlo a tu frontend actual)

Tu `AuthContext.js` actual hace todo con `localStorage`. Los cambios son:

1. **Login (paso 1):** `POST /auth/login` con `{ email, password }` → si las credenciales son correctas, el backend manda el OTP al correo y responde `{ otpRequired: true, userId }`. Aquí necesitas un paso extra en tu `LoginModal.js`: mostrar un input para el código.
2. **Login (paso 2):** `POST /auth/verify-otp` con `{ userId, code }` → si el código es correcto, responde `{ token, user }`. Ahí guardas el `token` (en lugar de guardar la sesión completa como ahora) y lo usas en cada request:
   ```js
   fetch("http://localhost:4000/users/me", {
     headers: { Authorization: `Bearer ${token}` }
   })
   ```
3. **Registro:** `POST /auth/register` con `{ username, email, password }` → responde `{ token, user }` directo (sin OTP, pero puedes agregárselo igual si quieres).
4. **Admin:** tu `ProtectedRoute.js` ya no debe comparar el email a mano. En vez de eso, decodifica el JWT (o llama a `/users/me`) y revisa `user.role === "ADMIN"`. El backend YA rechaza con 403 a cualquiera que no sea admin, así que aunque alguien edite el frontend, no puede entrar a `/admin/*`.
5. **AdminDashboard:** cambia el `useEffect` que lee `localStorage.getItem("sol_users")` por:
   ```js
   fetch("http://localhost:4000/admin/users", {
     headers: { Authorization: `Bearer ${token}` }
   })
   ```
6. **WebSockets:** en tu frontend instala `socket.io-client` y conéctate así:
   ```js
   import { io } from "socket.io-client";
   const socket = io("http://localhost:4000", { auth: { token } });
   socket.on("notification", (data) => triggerToast(data.message));
   ```

## Endpoints disponibles

| Método | Ruta                     | Protegido | Descripción |
|--------|---------------------------|-----------|--------------|
| POST   | /auth/register            | No        | Crea usuario, devuelve JWT |
| POST   | /auth/login                | No (rate-limited) | Valida credenciales, envía OTP |
| POST   | /auth/verify-otp           | No (rate-limited) | Valida OTP, devuelve JWT |
| POST   | /auth/resend-otp           | No (rate-limited) | Reenvía un nuevo OTP |
| GET    | /users/me                  | JWT       | Datos del usuario logueado |
| GET    | /admin/users               | JWT + ADMIN | Lista todos los usuarios |
| PATCH  | /admin/users/:id/ban       | JWT + ADMIN | Banea/desbanea a un usuario |
| GET    | /admin/stats               | JWT + ADMIN | Stats para el Dashboard |

## Pendiente / ideas para completar el resto de la consigna

- Endpoints de `characters` y `purchases` (la tabla ya existe en el schema, solo falta el controller/route — es el mismo patrón que `auth.controller.js`).
- Endpoint para `battle_pass` (subir XP, reclamar recompensa) — también usa la tabla `BattlePassProgress` ya creada.
- Sistema de amistades (`Friendship`) — la tabla ya está, falta el endpoint de aceptar/rechazar.
- Deploy: Render o Railway para este backend + su base de datos; Vercel/Netlify para el front (Requerimiento 10).

¡Con esto ya tienes JWT, OTP, base de datos relacional, módulo admin con dashboard, seguridad extra (rate limit + logs) y WebSockets corriendo! El resto es repetir el mismo patrón para characters/purchases/friends.
