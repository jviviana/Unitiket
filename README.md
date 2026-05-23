# UniTicket - Sistema de Gestión de Incidencias

## 📋 Descripción del Proyecto
**UniTicket** es una plataforma moderna diseñada para agilizar y organizar la gestión de incidencias en laboratorios (equipos de cómputo, problemas de red, fallos de software, etc.). 

El sistema facilita la comunicación entre los usuarios que experimentan problemas y el equipo técnico encargado de solucionarlos, manteniendo un historial claro y un control visual del estado de cada incidencia.

## 🏗️ Arquitectura y Tecnologías
Este proyecto ha sido construido utilizando una **Arquitectura Desacoplada (Frontend y Backend separados)**, lo que representa el estándar moderno en desarrollo web. Esto permite que el sistema sea rápido, seguro y altamente escalable.

### 🎨 Frontend (La Interfaz de Usuario)
Construido para ser ágil y ofrecer una experiencia fluida sin recargas de página.
- **React.js & Vite:** Librería principal y empaquetador utilizados para construir una Single Page Application (SPA) dinámica y reactiva.
- **Node.js & npm:** Entorno utilizado durante el desarrollo para gestionar las dependencias y compilar el código moderno.
- **Axios:** Cliente HTTP para comunicarse con la API del backend de forma asíncrona.
- **Diseño:** Interfaz de usuario moderna construida con CSS puro, aplicando una paleta de colores personalizada (Verde Esmeralda) y principios de diseño interactivo.

### 🧠 Backend (El Cerebro y la API)
El motor de reglas de negocio, encargado de la seguridad y el procesamiento de datos.
- **Python 3 & Django:** Framework robusto elegido por su velocidad de desarrollo y seguridad integrada.
- **Django REST Framework (DRF):** Herramienta que convierte los modelos de la base de datos en una API REST (JSON) que el frontend puede entender y consumir.
- **Simple JWT:** Sistema de autenticación seguro mediante "Tokens" para gestionar de forma segura quién está conectado y qué nivel de permisos tiene.

### 🗄️ Infraestructura y DevOps
- **PostgreSQL:** Base de datos relacional robusta encargada de almacenar usuarios, roles y el historial completo de tickets.
- **Docker & Docker Compose:** Sistema de contenedores que empaqueta la base de datos y el backend. Permite levantar todo el entorno de producción o desarrollo con un solo comando (`docker-compose up`), sin importar en qué computadora se ejecute.
- **Jenkins:** Servidor de automatización (CI/CD). A través del archivo `Jenkinsfile` (Pipeline como Código), el servidor detecta automáticamente los cambios en este repositorio de GitHub y compila las nuevas imágenes de Docker para despliegue.

## 👥 Roles del Sistema
La plataforma está dividida en dos niveles de acceso:
1. **Usuario Estándar (Estudiante / Docente):**
   - Puede crear su cuenta libremente.
   - Puede reportar una nueva incidencia detallando: ubicación, identificador del equipo y la descripción del fallo.
   - Tiene un tablero de control privado donde visualiza únicamente el estado de los tickets que él mismo ha reportado.
2. **Técnico / Administrador:**
   - Tiene acceso global a la plataforma.
   - Puede visualizar todos los tickets creados por cualquier usuario en la institución.
   - Tiene permisos para gestionar la incidencia: cambiar su estado (*Abierto*, *En Progreso*, *Resuelto*) y añadir comentarios de resolución técnicos para cerrar el flujo de trabajo.