# Toxihub

Un wrapper API en Node.js para Toxiproxy que proporciona una interfaz RESTful completa para controlar la funcionalidad de Toxiproxy con una interfaz web estilo terminal.

<div align="center">
  <img src="https://raw.githubusercontent.com/videsk/toxihub/main/public/toxiproxy.png" alt="Logo de Toxihub" width="150"/>
  
  [![Versión NPM](https://img.shields.io/npm/v/@videsk/toxihub.svg)](https://www.npmjs.com/package/@videsk/toxihub)
  [![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Cliente Web](https://img.shields.io/badge/Cliente%20Web-toxihub.videsk.io-green.svg)](https://toxihub.videsk.io)
</div>

## Características

- 🚀 **API RESTful fácil de usar** como wrapper para Toxiproxy
- 🖥️ **Interfaz web estilo terminal** para gestionar proxies y tóxicos
- 🔄 **Gestión automática del servidor** con capacidades de auto-inicio
- 📡 **Gestión en tiempo real** de proxies y tóxicos
- 🎯 **Inyección simplificada de tóxicos** con endpoints de ayuda
- 🔧 **Ejecución de comandos CLI** a través de endpoints API
- 🌐 **CORS habilitado** para fácil integración
- 📦 **Soporte para ejecutable independiente**

## Cliente Web en Vivo

Accede a la interfaz web en: [https://toxihub.videsk.io](https://toxihub.videsk.io)

## Prerrequisitos

- Node.js (v14 o posterior)
- Toxiproxy instalado en tu sistema
  - El binario `toxiproxy-server` debe estar disponible en tu PATH
  - El binario `toxiproxy-cli` debe estar disponible en tu PATH

## Instalación

### Paquete NPM

```bash
npm install @videsk/toxihub
```

### Desde el Código Fuente

```bash
git clone https://github.com/videsk/toxihub.git
cd toxihub
npm install
npm start
```

### Binario Independiente

Descarga el binario pre-compilado para tu plataforma desde la página de releases.

## Configuración

Configura Toxihub usando variables de entorno o un archivo `.env`:

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| PORT | 7072 | Puerto para el servidor API wrapper |
| TOXIPROXY_HOST | localhost | Host donde corre el servidor Toxiproxy |
| TOXIPROXY_PORT | 8474 | Puerto para el servidor Toxiproxy |
| TOXIPROXY_CLI | toxiproxy-cli | Ruta al ejecutable toxiproxy-cli |
| TOXIPROXY_SERVER | toxiproxy-server | Ruta al ejecutable toxiproxy-server |
| AUTO_START_SERVER | true | Si se debe auto-iniciar el servidor Toxiproxy si no está corriendo |
| LOG_LEVEL | info | Nivel de logging (debug, info, warn, error) |

Ejemplo de archivo `.env`:
```env
PORT=7072
TOXIPROXY_HOST=localhost
TOXIPROXY_PORT=8474
AUTO_START_SERVER=true
LOG_LEVEL=info
```

## Endpoints de la API

### Gestión del Servidor

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/status` | Verificar si el servidor Toxiproxy está corriendo |
| POST | `/status` | Iniciar el servidor Toxiproxy |
| DELETE | `/status` | Detener el servidor Toxiproxy |
| PUT | `/status` | Reiniciar todos los proxies y tóxicos |

### Gestión de Proxies

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/proxies` | Listar todos los proxies |
| POST | `/proxies` | Crear un nuevo proxy |
| GET | `/proxies/:name` | Obtener detalles de un proxy específico |
| PATCH | `/proxies/:name/toggle` | Alternar un proxy habilitado/deshabilitado |
| DELETE | `/proxies/:name` | Eliminar un proxy |

### Gestión de Tóxicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/proxies/:name/toxics` | Listar todos los tóxicos de un proxy |
| POST | `/proxies/:name/toxics` | Agregar un nuevo tóxico a un proxy |
| POST | `/proxies/:name/toxics/:toxicName` | Actualizar un tóxico |
| DELETE | `/proxies/:name/toxics/:toxicName` | Eliminar un tóxico de un proxy |

### Endpoints de Ayuda

Estos endpoints proporcionan interfaces simplificadas para condiciones de red comunes:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/proxies/:name/latency` | Agregar tóxico de latencia (simplificado) |
| POST | `/proxies/:name/bandwidth` | Agregar tóxico de limitación de ancho de banda (simplificado) |
| POST | `/proxies/:name/timeout` | Agregar tóxico de timeout (simplificado) |

### Otros

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/cli` | Ejecutar un comando personalizado de toxiproxy-cli |

## Interfaz Web

Accede a la interfaz web integrada navegando a `http://localhost:7072` (o tu puerto configurado). La UI estilo terminal proporciona:

- Monitoreo del estado del servidor en tiempo real
- Gestión visual de proxies
- Configuración interactiva de tóxicos
- Visualización en vivo de respuestas API
- Alternado y eliminación de proxies con un clic

## Cliente JavaScript

Toxihub incluye un cliente JavaScript para interacción programática:

```javascript
import ToxiproxyClient from '@videsk/toxihub/client';

const client = new ToxiproxyClient({
  hostname: 'http://localhost:7072'
});

// Verificar estado del servidor
const status = await client.status();

// Crear un proxy
await client.createProxy('redis_proxy', '127.0.0.1:26379', '127.0.0.1:6379');

// Agregar latencia
await client.addLatencyToxic('redis_proxy', 500, 50);

// Alternar proxy
await client.toggleProxy('redis_proxy');
```

## Ejemplos de Uso

### Crear un proxy

```bash
curl -X POST http://localhost:7072/proxies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "redis_proxy",
    "listen": "127.0.0.1:26379",
    "upstream": "127.0.0.1:6379"
  }'
```

### Agregar latencia a un proxy

```bash
curl -X POST http://localhost:7072/proxies/redis_proxy/latency \
  -H "Content-Type: application/json" \
  -d '{
    "latency": 500,
    "jitter": 50
  }'
```

### Alternar un proxy encendido/apagado

```bash
curl -X POST http://localhost:7072/proxies/redis_proxy/toggle
```

### Eliminar un tóxico

```bash
curl -X DELETE http://localhost:7072/proxies/redis_proxy/toxics/latency_downstream
```

## Tipos de Tóxicos Disponibles

Toxiproxy soporta los siguientes tipos de tóxicos:

- `latency`: Agregar retraso a todos los datos
- `bandwidth`: Limitar ancho de banda
- `slow_close`: Retrasar el cierre del socket TCP
- `timeout`: Detener todos los datos y cerrar la conexión después de un timeout
- `reset_peer`: Simular reset TCP
- `slicer`: Cortar datos TCP en trozos más pequeños
- `limit_data`: Cerrar conexión después de enviar cierta cantidad de bytes

Cada tóxico puede configurarse con atributos específicos como cantidad de latencia, tasa de ancho de banda, duración del timeout, etc.

## Desarrollo

Para desarrollo con auto-reinicio al cambiar código:

```bash
npm run dev
```

### Construir Ejecutables Independientes

Construir para todas las plataformas:
```bash
npm run build
```

Construcciones específicas por plataforma:
```bash
npm run build:linux
npm run build:win
npm run build:mac
```

## Soporte Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 7072
CMD ["npm", "start"]
```

## Contribuir

1. Haz fork del repositorio
2. Crea tu rama de características (`git checkout -b feature/caracteristica-increible`)
3. Haz commit de tus cambios (`git commit -m 'Agregar alguna característica increíble'`)
4. Haz push a la rama (`git push origin feature/caracteristica-increible`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Agradecimientos

- [Toxiproxy](https://github.com/Shopify/toxiproxy) - La herramienta subyacente para simulación de caos de red
- Construido con ❤️ por [Videsk](https://github.com/videsk)

## Soporte

- Crea un issue para reportes de bugs o solicitudes de características
- Visita [https://toxihub.videsk.io](https://toxihub.videsk.io) para la demostración en vivo
- Documentación disponible en la página principal del proyecto