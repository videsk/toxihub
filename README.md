# Toxihub

A Node.js wrapper API for Toxiproxy that provides a comprehensive RESTful interface to control Toxiproxy functionality with a terminal-style web UI.

<div align="center">
  <img src="https://raw.githubusercontent.com/videsk/toxihub/main/public/toxiproxy.png" alt="Toxihub Logo" width="150"/>
  
  [![NPM Version](https://img.shields.io/npm/v/@videsk/toxihub.svg)](https://www.npmjs.com/package/@videsk/toxihub)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Web Client](https://img.shields.io/badge/Web%20Client-toxihub.videsk.io-green.svg)](https://toxihub.videsk.io)
</div>

## Features

- 🚀 **Easy-to-use RESTful API** wrapper for Toxiproxy
- 🖥️ **Web-based terminal UI** for managing proxies and toxics
- 🔄 **Automatic server management** with auto-start capabilities  
- 📡 **Real-time proxy and toxic management**
- 🎯 **Simplified toxic injection** with helper endpoints
- 🔧 **CLI command execution** through API endpoints
- 🌐 **CORS-enabled** for easy integration
- 📦 **Standalone executable** support

## Live Web Client

Access the web interface at: [https://toxihub.videsk.io](https://toxihub.videsk.io)

## Prerequisites

- Node.js (v14 or later)
- Toxiproxy installed on your system
  - `toxiproxy-server` binary should be available in your PATH
  - `toxiproxy-cli` binary should be available in your PATH

## Installation

### NPM Package

```bash
npm install @videsk/toxihub
```

### From Source

```bash
git clone https://github.com/videsk/toxihub.git
cd toxihub
npm install
npm start
```

### Standalone Binary

Download the pre-built binary for your platform from the releases page.

## Configuration

Configure Toxihub using environment variables or a `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 7072 | Port for the wrapper API server |
| TOXIPROXY_HOST | localhost | Host where Toxiproxy server runs |
| TOXIPROXY_PORT | 8474 | Port for the Toxiproxy server |
| TOXIPROXY_CLI | toxiproxy-cli | Path to the toxiproxy-cli executable |
| TOXIPROXY_SERVER | toxiproxy-server | Path to the toxiproxy-server executable |
| AUTO_START_SERVER | true | Whether to auto-start the Toxiproxy server if not running |
| LOG_LEVEL | info | Logging level (debug, info, warn, error) |

Example `.env` file:
```env
PORT=7072
TOXIPROXY_HOST=localhost
TOXIPROXY_PORT=8474
AUTO_START_SERVER=true
LOG_LEVEL=info
```

## API Endpoints

### Server Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status` | Check if Toxiproxy server is running |
| POST | `/status` | Start the Toxiproxy server |
| DELETE | `/status` | Stop the Toxiproxy server |
| PUT | `/status` | Reset all proxies and toxics |

### Proxy Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/proxies` | List all proxies |
| POST | `/proxies` | Create a new proxy |
| GET | `/proxies/:name` | Get details of a specific proxy |
| PATCH | `/proxies/:name/toggle` | Toggle a proxy enabled/disabled |
| DELETE | `/proxies/:name` | Delete a proxy |

### Toxic Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/proxies/:name/toxics` | List all toxics for a proxy |
| POST | `/proxies/:name/toxics` | Add a new toxic to a proxy |
| POST | `/proxies/:name/toxics/:toxicName` | Update a toxic |
| DELETE | `/proxies/:name/toxics/:toxicName` | Remove a toxic from a proxy |

### Helper Endpoints

These endpoints provide simplified interfaces for common network conditions:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/proxies/:name/latency` | Add latency toxic (simplified) |
| POST | `/proxies/:name/bandwidth` | Add bandwidth limitation toxic (simplified) |
| POST | `/proxies/:name/timeout` | Add timeout toxic (simplified) |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cli` | Execute a custom toxiproxy-cli command |

## Web Interface

Access the built-in web interface by navigating to `http://localhost:7072` (or your configured port). The terminal-style UI provides:

- Real-time server status monitoring
- Visual proxy management
- Interactive toxic configuration
- Live API response display
- One-click proxy toggling and deletion

## JavaScript Client

Toxihub includes a JavaScript client for programmatic interaction:

```javascript
import ToxiproxyClient from '@videsk/toxihub/client';

const client = new ToxiproxyClient({
  hostname: 'http://localhost:7072'
});

// Check server status
const status = await client.status();

// Create a proxy
await client.createProxy('redis_proxy', '127.0.0.1:26379', '127.0.0.1:6379');

// Add latency
await client.addLatencyToxic('redis_proxy', 500, 50);

// Toggle proxy
await client.toggleProxy('redis_proxy');
```

## Usage Examples

### Create a proxy

```bash
curl -X POST http://localhost:7072/proxies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "redis_proxy",
    "listen": "127.0.0.1:26379",
    "upstream": "127.0.0.1:6379"
  }'
```

### Add latency to a proxy

```bash
curl -X POST http://localhost:7072/proxies/redis_proxy/latency \
  -H "Content-Type: application/json" \
  -d '{
    "latency": 500,
    "jitter": 50
  }'
```

### Toggle a proxy on/off

```bash
curl -X POST http://localhost:7072/proxies/redis_proxy/toggle
```

### Delete a toxic

```bash
curl -X DELETE http://localhost:7072/proxies/redis_proxy/toxics/latency_downstream
```

## Available Toxic Types

Toxiproxy supports the following toxic types:

- `latency`: Add delay to all data  
- `bandwidth`: Limit bandwidth  
- `slow_close`: Delay the TCP socket from closing  
- `timeout`: Stop all data and close the connection after a timeout  
- `reset_peer`: Simulate TCP reset  
- `slicer`: Slice TCP data into smaller bits  
- `limit_data`: Close connection after sending a certain number of bytes  

Each toxic can be configured with specific attributes like latency amount, bandwidth rate, timeout duration, etc.

## Development

For development with auto-restart on code changes:

```bash
npm run dev
```

### Building Standalone Executables

Build for all platforms:
```bash
npm run build
```

Platform-specific builds:
```bash
npm run build:linux
npm run build:win
npm run build:mac
```

## Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 7072
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Toxiproxy](https://github.com/Shopify/toxiproxy) - The underlying tool for network chaos simulation
- Built with ❤️ by [Videsk](https://github.com/videsk)

## Support

- Create an issue for bug reports or feature requests
- Visit [https://toxihub.videsk.io](https://toxihub.videsk.io) for the live demo
- Documentation available at project homepage