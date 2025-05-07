# Toxiproxy API Wrapper

A Node.js wrapper API for Toxiproxy that provides an easy-to-use RESTful interface to control Toxiproxy functionality.

## Overview

This project creates a simple REST API server to manage Toxiproxy instances. It allows you to:

- Start and stop the Toxiproxy server
- Create, update, and delete proxies
- Add, modify, and remove toxics (network conditions like latency, bandwidth limitations, etc.)
- Execute custom CLI commands
- Easily apply common network conditions through simplified endpoints

## Prerequisites

- Node.js (v14 or later)
- Toxiproxy installed on your system
  - `toxiproxy-server` binary should be available in your PATH
  - `toxiproxy-cli` binary should be available in your PATH

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

## Configuration

You can configure the wrapper using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Port for the wrapper API server |
| TOXIPROXY_HOST | localhost | Host where Toxiproxy server runs |
| TOXIPROXY_PORT | 8474 | Port for the Toxiproxy server |
| TOXIPROXY_CLI | toxiproxy-cli | Path to the toxiproxy-cli executable |
| TOXIPROXY_SERVER | toxiproxy-server | Path to the toxiproxy-server executable |
| AUTO_START_SERVER | false | Whether to auto-start the Toxiproxy server if not running |
| LOG_LEVEL | info | Logging level (debug, info, warn, error) |

## API Endpoints

### Server Management

- `GET /api/status` - Check if Toxiproxy server is running
- `POST /api/start` - Start the Toxiproxy server (if AUTO_START_SERVER is true)
- `POST /api/stop` - Stop the Toxiproxy server (only if started by this wrapper)

### Proxy Management

- `GET /api/proxies` - List all proxies
- `POST /api/proxies` - Create a new proxy
- `GET /api/proxies/:name` - Get details of a specific proxy
- `POST /api/proxies/:name/toggle` - Toggle a proxy enabled/disabled
- `DELETE /api/proxies/:name` - Delete a proxy

### Toxic Management

- `GET /api/proxies/:name/toxics` - List all toxics for a proxy
- `POST /api/proxies/:name/toxics` - Add a new toxic to a proxy
- `POST /api/proxies/:name/toxics/:toxicName` - Update a toxic
- `DELETE /api/proxies/:name/toxics/:toxicName` - Remove a toxic

### Helper Endpoints

- `POST /api/proxies/:name/latency` - Add latency toxic (simplified)
- `POST /api/proxies/:name/bandwidth` - Add bandwidth limitation toxic (simplified)
- `POST /api/proxies/:name/timeout` - Add timeout toxic (simplified)

### Other

- `POST /api/reset` - Reset all proxies and toxics
- `POST /api/cli` - Execute a custom toxiproxy-cli command

## Usage Examples

### Create a proxy

```bash
curl -X POST http://localhost:3000/api/proxies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "redis_proxy",
    "listen": "127.0.0.1:26379",
    "upstream": "127.0.0.1:6379"
  }'
```

### Add latency to a proxy

```bash
curl -X POST http://localhost:3000/api/proxies/redis_proxy/latency \
  -H "Content-Type: application/json" \
  -d '{
    "latency": 500,
    "jitter": 50
  }'
```

### Toggle a proxy on/off

```bash
curl -X POST http://localhost:3000/api/proxies/redis_proxy/toggle
```

### Delete a toxic

```bash
curl -X DELETE http://localhost:3000/api/proxies/redis_proxy/toxics/latency_downstream
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

For more details about each toxic and their specific attributes, see the [Toxiproxy documentation](https://github.com/Shopify/toxiproxy#toxics).

## Development

For development with auto-restart on code changes:

```bash
npm run dev
```

## License

MIT
