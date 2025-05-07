export default {
  port: process.env.PORT || 7072,
  toxiproxyHost: process.env.TOXIPROXY_HOST || 'localhost',
  toxiproxyPort: process.env.TOXIPROXY_PORT || 8474,
  toxiproxyCli: process.env.TOXIPROXY_CLI || 'toxiproxy-cli',
  toxiproxyServer: process.env.TOXIPROXY_SERVER || 'toxiproxy-server',
  autoStartServer: process.env.AUTO_START_SERVER === 'true' || true,
  logLevel: process.env.LOG_LEVEL || 'info'
};