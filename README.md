# 🎮 Streets of Lima - Web Frontend (AP1)

## 📖 Descripción del Proyecto
Esta es la aplicación web Front-end para **Streets of Lima**, un juego de peleas/brawler. Este proyecto adapta los requerimientos web a la interfaz inmersiva de un videojuego multijugador. 

El proyecto cumple con los criterios de desarrollo Single Page Application (SPA), enrutamiento, consumo de APIs locales, responsividad adaptativa y un sistema de autenticación simulado con protección de rutas.

---

## 🛠️ Detalles Técnicos y Tecnologías
El proyecto ha sido desarrollado utilizando las siguientes tecnologías obligatorias y complementarias:
* **React:** Librería principal para la construcción de interfaces.
* **React Router DOM:** Para la navegación sin recarga de páginas (SPA) y protección de rutas.
* **Tailwind CSS:** Framework de estilos utilitarios para un diseño 100% a medida y responsivo.
* **Framer Motion:** Librería de animaciones utilizada para transiciones de modales, efectos de *hover* en tarjetas y feedback visual (estilo *Marvel Rivals* / juegos modernos).
* **Context API & LocalStorage:** Utilizados para crear un estado global de autenticación persistente (`AuthContext`), simulando sesiones de usuario reales.
* **Fetch API:** Para el consumo asíncrono de un archivo JSON local (`Characters.json`).

---

## 🗺️ Arquitectura y Páginas

El proyecto consta de una navegación principal y componentes modulares:

1. **Lobby / Menú Principal (`/`):** 
   - Funciona como el `Home`. Contiene el Leaderboard, selección de personaje, árbol de habilidades (interactivo) y emparejamiento.
   - **Responsive Inteligente:** Al detectar pantallas táctiles/móviles, el Lobby se bloquea mostrando una pantalla de "PC EXCLUSIVE" (ya que el juego requiere teclado/ratón), pero permite seguir navegando por las tiendas mediante un menú hamburguesa.
2. **Street Market (`/cosmetics_store`):**
   - Consume el archivo `Characters.json` de manera asíncrona usando `useEffect` y `fetch`.
   - Implementa `SkeletonLoaders` para manejar los tiempos de carga de la API simulada.
3. **Sunnys Store (`/premium_store`):** 
   - Tienda de moneda premium con diseño estructurado en pilares y animaciones escalonadas.
4. **Combo Pass (`/battle_pass`):** 
   - Sistema de pase de batalla con scroll horizontal nativo, lógica de recompensas (Free/Premium) y notificaciones tipo "Toast" dinámicas.
5. **Error 404 (`*`):** 
   - Página de error personalizada temática ("Yapesito") para manejar rutas inexistentes.

---

## 🚀 Cómo correr el proyecto localmente

1. Clona el repositorio en tu máquina local.
2. Abre una terminal en la carpeta raíz del proyecto.
3. Instala las dependencias necesarias ejecutando:
 - npm install
4. Nota: Asegúrate de tener instalados react-router-dom y framer-motion.
5. Inicia el servidor de desarrollo:
- npm start
6. El proyecto se abrirá automáticamente en `http://localhost:3000`.

---

## 🔐 Usuarios de Prueba y MODO ADMINISTRADOR (Dashboard Privado)

El sistema de login está simulado en el Front-end usando LocalStorage. Puedes registrar cualquier cuenta nueva desde el modal interactivo de **LOG IN -> REGISTER**, pero hemos preparado usuarios específicos para revisión:

### 👤 Usuario Estándar (Jugador)
Puedes crear tu propia cuenta en el botón de registro, o usar cualquier credencial falsa, ya que el sistema la guardará localmente. Intenta darle clic al botón "SKILL TREE" o a los botones "+" de añadir amigos sin estar logueado para ver el sistema de bloqueo de rutas/acciones.

### 🛡️ MODO ADMINISTRADOR (Dashboard Protegido)
Para evaluar la **Protección de Rutas** y el **Dashboard Privado** (Requisitos de rúbrica), existe un panel secreto de gestión de servidor. 

**Cómo acceder:**
1. Abre el modal de **LOG IN**.
2. Ve a la pestaña **REGISTER** (si es la primera vez en ese navegador) y crea una cuenta usando **ESTE CORREO EXACTO**:
   - **Email:** `admin@streetsoflima.com`
   - **Password:** `admin123` *(o cualquier contraseña mayor a 6 caracteres)*
3. Inicia sesión.
4. Abre el panel de **Perfil** (haciendo clic en el avatar arriba a la derecha).
5. Verás que ha aparecido un botón verde exclusivo: `[ SYSTEM ADMIN ]`.
6. Haz clic para entrar al **Dashboard Privado** (ruta `/admin`). Esta ruta está protegida por un `<ProtectedRoute>`. Si intentas entrar directamente por la URL sin ser este usuario, el sistema te regresará al inicio.