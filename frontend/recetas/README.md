# ¿Y HOY QUÉ? - Aplicación de Recetas Personalizadas

¡Bienvenido al repositorio del proyecto "¿Y HOY QUÉ?", una aplicación web diseñada para ayudarte a descubrir recetas deliciosas utilizando los ingredientes que tienes en casa! Esta herramienta tiene como objetivo facilitar la experiencia culinaria del usuario, ofreciendo recetas personalizadas y promoviendo una comunidad de cocina colaborativa.

## 💡 Descripción del Proyecto

La aplicación "¿Y HOY QUÉ?" es una plataforma web donde los usuarios pueden buscar recetas utilizando los ingredientes que ya tienen en casa. Además, pueden compartir sus propias recetas, marcar sus favoritas, comentar y valorar las recetas de otros usuarios. La comunidad es el alma del proyecto, permitiendo la colaboración y la inspiración entre amantes de la cocina.

## 🚧 Funcionalidades Implementadas

- **Búsqueda por Ingredientes**: Introduce los ingredientes que tienes disponibles y descubre recetas que puedas preparar con ellos.
- **Creación de Recetas**: Los usuarios registrados pueden crear sus propias recetas y compartirlas con la comunidad.
- **Favoritos**: Guarda tus recetas favoritas para encontrarlas rápidamente más tarde.
- **Comunidad y Comentarios**: Comenta y valora las recetas que otros usuarios comparten.
- **Paginación Clásica**: Navega fácilmente entre diferentes recetas gracias a la implementación de paginación clásica.
- **Registro e Inicio de Sesión**: Registro de usuarios, autenticación y protección de rutas con JSON Web Tokens (JWT).
- **Panel de Filtros**: Filtra las recetas según categorías, dificultad, tiempo de preparación, tipo de dieta, y más.
- **Filtrar Recetas Guardadas o Creadas**: Filtra entre recetas guardadas (favoritas) y recetas creadas por el usuario.
- **Perfil del Usuario**: Edita tu perfil, sube una foto, cambia contraseña, y maneja la información básica de tu cuenta.

## 💻 Tecnologías Utilizadas

- **Frontend**:
  - [React](https://reactjs.org/): Creación de componentes interactivos y SPA.
  - [Tailwind CSS](https://tailwindcss.com/): Estilos modernos y responsivos.
  - [Framer Motion](https://www.framer.com/motion/): Animaciones fluidas.
  - [Vite](https://vitejs.dev/): Empaquetador y servidor de desarrollo rápido para React.
- **Backend**:
  - [Node.js](https://nodejs.org/): Entorno para ejecutar JavaScript del lado del servidor.
  - [Express.js](https://expressjs.com/): Framework para la creación de la API RESTful.
  - [MongoDB](https://www.mongodb.com/): Base de datos NoSQL para almacenar la información de recetas y usuarios.
  - [JWT (JSON Web Tokens)](https://jwt.io/): Para la autenticación segura de los usuarios.
  - [Multer](https://github.com/expressjs/multer): Middleware para manejar la subida de archivos de imagen.
  - [Cloudinary](https://cloudinary.com/): Almacenamiento de imágenes en la nube y optimización de contenido multimedia.
- **Otros**:
  - [Axios](https://axios-http.com/): Realización de solicitudes HTTP.
  - [React Hook Form](https://react-hook-form.com/): Manejo de formularios en el frontend.
  - [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/): Animaciones al hacer scroll.

## 🛠️ Pasos para Levantar el Proyecto

### Prerrequisitos

Asegúrate de tener instalados los siguientes programas en tu máquina:

- **Node.js**: Versión 14+.
- **npm** o **yarn**: Gestor de paquetes.
- **MongoDB**: Puedes usar una instalación local o una base de datos en la nube (como [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).

### Instalación y Configuración

1. **Clona el Repositorio**

   ```bash
   git clone https://github.com/Ceballos1988/yhoyque.git
   cd yhoyque
   ```

2. **Instala las Dependencias**

   - Para el servidor backend:
     ```bash
     cd backend
     npm install
     ```
   - Para el frontend:
     ```bash
     cd ../frontend
     npm install
     ```

3. **Configuración del Entorno**

   - Crea un archivo `.env` en la carpeta `backend` con las siguientes variables de entorno:
     ```env
     PORT=5000
     MONGO_URI=mongodb+srv://mariaceballos:SDHC72FwS5qAQFCY@cluster0.fvw0n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     JWT_SECRET=miSuperSecreto123
     CLOUDINARY_CLOUD_NAME=dnlyti3zm
     CLOUDINARY_API_KEY=973268654584737
     CLOUDINARY_API_SECRET=lmmQDnUXjphY9JYmO4VZPMG7Ixc
     ```

4. **Levanta el Servidor**

   - Inicia el servidor backend:
     ```bash
     cd backend
     npm run dev
     ```
   - Inicia el cliente frontend:
     ```bash
     cd ../frontend
     npm run dev
     ```

5. **Accede a la Aplicación**
   - La aplicación frontend está disponible en [http://localhost:5173](http://localhost:5173).
   - El backend corre en [http://localhost:5000](http://localhost:5000) para el manejo de las APIs.

## 🛡️ Comandos útiles

- **Levantar el Backend en modo desarrollo**
  ```bash
  npm run dev
  ```
- **Levantar el Frontend**
  ```bash
  npm run dev
  ```
- **Testear el Backend**
  ```bash
  npm test
  ```

## 📍 Información Adicional

- **Futuras Funcionalidades**:
  - Vista de administrador para gestionar recetas y usuarios.
  - Botón de aviso de uso incorrecto de la plataforma.
  - Implementación de listas de compras para los usuarios.
  - Distinción de ingredientes faltantes en recetas.
  - Recomendaciones de recetas basadas en los gustos del usuario.

- **Manejo de Imágenes**:
  - Las imágenes subidas por los usuarios se almacenan en [Cloudinary](https://cloudinary.com/).
  - Para la gestión de las imágenes en el servidor se utiliza `Multer`, que permite la carga de archivos desde el frontend hacia el backend, y posteriormente la subida a Cloudinary.

