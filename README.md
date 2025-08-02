# Sistema de Reclamaciones - Prueba Técnica

Hola, soy Elmer, esta es mi prueba técnica. En el frontend he implementado una aplicación Angular con Angular Material que permite gestionar reclamaciones de manera intuitiva y moderna. En el backend he desarrollado una API REST con Spring Boot que maneja la lógica de negocio, incluyendo operaciones CRUD para reclamaciones, estados y adjuntos, con persistencia en PostgreSQL.

## 🚀 Tecnologías Utilizadas

### Frontend
- **Angular 20** - Framework web moderno
- **Angular Material** - Componentes UI con Material Design
- **TypeScript** - Lenguaje tipado para mejor desarrollo
- **SCSS** - Estilos avanzados
- **Nginx** - Servidor web para producción

### Backend
- **Spring Boot 3.4.0** - Framework Java para APIs REST
- **Spring Data JPA** - ORM para manejo de datos
- **PostgreSQL** - Base de datos relacional
- **Java 21** - Última versión LTS de Java
- **Maven** - Gestión de dependencias

### DevOps
- **Docker & Docker Compose** - Contenedorización y orquestación
- **Multi-stage builds** - Optimización de imágenes Docker

## 📋 Funcionalidades

### Gestión de Reclamaciones
- ✅ Crear nuevas reclamaciones
- ✅ Ver listado de reclamaciones con paginación
- ✅ Ver detalles completos de una reclamación
- ✅ Agregar estados/seguimientos a reclamaciones
- ✅ Subir archivos adjuntos
- ✅ Filtros y búsqueda

### Características Técnicas
- 🔄 API REST completa con validaciones
- 🗄️ Base de datos relacional con JPA
- 🎨 Interfaz moderna y responsiva
- 🐳 Arquitectura contenerizada
- 🔧 Configuración de red Docker optimizada

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Docker](https://www.docker.com/get-started) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.0 o superior)

Para verificar que tienes Docker instalado correctamente:

```bash
docker --version
docker-compose --version
```

## 🚀 Cómo Ejecutar la Aplicación

### Paso 1: Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd reto-tecnico
```

### Paso 2: Construir y Ejecutar los Contenedores

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker-compose up --build
```

Este comando:
- 📦 Construye las imágenes Docker para frontend y backend
- 🗄️ Descarga e inicia PostgreSQL
- 🔗 Configura la red interna entre contenedores
- 🚀 Levanta todos los servicios

### Paso 3: Esperar a que los Servicios Estén Listos

El proceso puede tomar unos minutos la primera vez. Verás logs similares a:

```
postgres_db  | database system is ready to accept connections
claims_api   | Started ApiApplication in X.XXX seconds
claims_app   | Configuration complete; ready for start up
```

### Paso 4: Acceder a la Aplicación

Una vez que todos los contenedores estén ejecutándose:

- **Frontend (Angular)**: http://localhost:4200
- **API (Spring Boot)**: http://localhost:5003/api/claims
- **Documentación Swagger**: http://localhost:5003/swagger-ui/index.html
- **Base de Datos**: Puerto 5433 (acceso externo)

## 🔍 Verificar que Todo Funciona

### Probar la API directamente:
```bash
curl http://localhost:5003/api/claims
```

### Probar la API a través del frontend:
```bash
curl http://localhost:4200/api/claims
```

## 📱 Uso de la Aplicación

1. **Página Principal**: Navega a http://localhost:4200
2. **Dashboard**: Ve el resumen de reclamaciones
3. **Nueva Reclamación**: Crea reclamaciones con título, descripción y cliente
4. **Detalle**: Haz clic en cualquier reclamación para ver detalles completos
5. **Seguimiento**: Agrega estados y adjuntos a las reclamaciones

## 📚 Documentación de la API (Swagger)

La API incluye documentación interactiva generada automáticamente con **Swagger/OpenAPI 3**:

### Acceder a Swagger UI:
```
http://localhost:5003/swagger-ui/index.html
```

### Características de la documentación:
- 📖 **Endpoints completos**: Todos los endpoints REST documentados
- 🧪 **Pruebas interactivas**: Ejecuta requests directamente desde el navegador  
- 📋 **Esquemas de datos**: Modelos de request/response detallados
- ✅ **Validaciones**: Reglas de validación para cada campo
- 🔍 **Ejemplos**: Ejemplos de uso para cada endpoint

### Endpoints principales disponibles:

#### Reclamaciones (`/api/claims`)
- `GET /api/claims` - Listar todas las reclamaciones
- `POST /api/claims` - Crear nueva reclamación  
- `GET /api/claims/{id}` - Obtener reclamación por ID
- `POST /api/claims/{id}/status` - Agregar estado a reclamación
- `POST /api/claims/{id}/attachments` - Subir archivo adjunto

#### Estados (`/api/estados`)
- `GET /api/estados` - Listar todos los estados disponibles

### Cómo usar Swagger UI:
1. Abre http://localhost:5003/swagger-ui/index.html
2. Explora los endpoints disponibles
3. Haz clic en cualquier endpoint para ver detalles
4. Usa "Try it out" para probar endpoints
5. Introduce parámetros y ejecuta requests
6. Ve las respuestas en tiempo real

## 🛑 Detener la Aplicación

Para detener todos los contenedores:

```bash
docker-compose down
```

Para eliminar también los volúmenes (datos de la base de datos):

```bash
docker-compose down -v
```

## 🔧 Comandos Útiles

### Ver logs de un servicio específico:
```bash
docker-compose logs -f claims-api    # Backend
docker-compose logs -f claims-app    # Frontend
docker-compose logs -f postgres      # Base de datos
```

### Reiniciar un servicio específico:
```bash
docker-compose restart claims-api
```

### Ejecutar comandos dentro de un contenedor:
```bash
docker-compose exec claims-api bash
docker-compose exec postgres psql -U postgres -d myapp
```

## 🏗️ Arquitectura del Proyecto

```
reto-tecnico/
├── api/                          # Backend Spring Boot
│   ├── src/main/java/com/example/api/
│   │   ├── controller/          # Controladores REST
│   │   ├── service/            # Lógica de negocio
│   │   ├── repository/         # Acceso a datos
│   │   ├── entity/             # Entidades JPA
│   │   └── dto/                # Objetos de transferencia
│   ├── Dockerfile              # Imagen Docker del backend
│   └── pom.xml                 # Dependencias Maven
├── claims-app/                  # Frontend Angular
│   ├── src/app/
│   │   ├── pages/              # Páginas principales
│   │   ├── core/               # Servicios y modelos
│   │   └── shared/             # Componentes compartidos
│   ├── Dockerfile              # Imagen Docker del frontend
│   └── nginx.conf              # Configuración proxy
├── docker-compose.yml          # Orquestación de servicios
└── README.md                   # Este archivo
```

## 🐳 Configuración de Red Docker

La aplicación utiliza una red Docker personalizada (`app-network`) que permite:

- **Comunicación interna**: Los contenedores se comunican usando nombres de servicio
- **Proxy inverso**: Nginx redirige `/api/*` al backend automáticamente  
- **Aislamiento**: Red segura e independiente del host

## 🔍 Solución de Problemas

### Puerto ocupado:
Si ves errores de "puerto en uso", puedes cambiar los puertos en `docker-compose.yml`

### Contenedor no inicia:
```bash
docker-compose logs [nombre-servicio]
```

### Limpiar todo y empezar de nuevo:
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Base de datos vacía:
La aplicación incluye datos de ejemplo que se cargan automáticamente al iniciar.

## 🌐 Aplicación Desplegada

La aplicación está desplegada en Google Cloud Platform y está disponible en línea:

### 🔗 URLs de Producción

- **🌐 Frontend (Angular)**: [https://claims-frontend-272736630388.us-central1.run.app](https://claims-frontend-272736630388.us-central1.run.app)
- **⚡ API REST (Spring Boot)**: [https://claims-api-272736630388.us-central1.run.app](https://claims-api-272736630388.us-central1.run.app)
- **📚 API Documentation**: [https://claims-api-272736630388.us-central1.run.app/swagger-ui/index.html](https://claims-api-272736630388.us-central1.run.app/swagger-ui/index.html)
- **🗄️ Base de datos**: PostgreSQL en Google Cloud SQL

### 🏗️ Infraestructura de Despliegue

- **Frontend**: Containerizado con Angular y Nginx, desplegado en Google Cloud Run
- **Backend**: Containerizado con Spring Boot, desplegado en Google Cloud Run  
- **Base de datos**: Google Cloud SQL con PostgreSQL 15
- **Registro de imágenes**: Google Container Registry (GCR)
- **Auto-scaling**: Ambos servicios escalan automáticamente según demanda

### 🚀 Características del Despliegue

- ✅ **Auto-scaling**: Cloud Run escala automáticamente según demanda
- ✅ **HTTPS**: Certificados SSL automáticos
- ✅ **Alta disponibilidad**: Infraestructura distribuida de Google Cloud
- ✅ **Monitoreo**: Logs centralizados en Google Cloud Console
- ✅ **Seguridad**: Base de datos con acceso restringido y variables de entorno

### � Script de Despliegue

El despliegue se realiza mediante el script automatizado `deploy/manual-deploy.sh` que:

1. Configura servicios de Google Cloud Platform
2. Crea instancia de Cloud SQL con PostgreSQL  
3. Construye y sube imagen Docker al Artifact Registry
4. Despliega API en Cloud Run con variables de entorno
5. Construye y sube frontend a Cloud Storage
6. Configura bucket web estático con CORS

## �📞 Soporte

Si tienes algún problema ejecutando la aplicación, verifica:

1. ✅ Docker está ejecutándose
2. ✅ Los puertos 4200, 5003 y 5433 están libres
3. ✅ Tienes suficiente espacio en disco
4. ✅ No hay otros servicios usando los mismos puertos

---

**¡Gracias por revisar mi prueba técnica!** 🚀

*Esta aplicación demuestra mis habilidades en desarrollo full-stack moderno con tecnologías actuales, mejores prácticas de DevOps y despliegue en la nube.*