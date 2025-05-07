/**
 * ToxiproxyClient - A JavaScript client for interacting with the Toxiproxy API wrapper
 */
class ToxiproxyClient extends EventTarget {

  constructor(options = {}) {
    super();
    this.options = { ...ToxiproxyClient.defaults, ...options };
  }

  /**
   * Make a request to the API
   * @param {string} endpoint - The API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<object>} - Response data
   * @private
   */
  async request(endpoint, options = {}) {
    const { hostname } = this.options;
    const url = `${hostname}${endpoint}`;
    
    if (!options.headers) options.headers = { 'Content-Type': 'application/json' };

    const response = await fetch(url, options);
    if (response.status === 204) return { success: true };
    const data = await response.json();
    this.dispatchEvent(new CustomEvent('toxic:request', { detail: data }));
    return data;
  }

  /**
   * Check the status of the Toxiproxy server
   * @returns {Promise<object>} - Server status information
   */
  async status() {
    const data = await this.request('/status');
    this.dispatchEvent(new CustomEvent('toxic:status', { detail: data }));
    return data;
  }

  /**
   * Start the Toxiproxy server
   * @returns {Promise<object>} - Response data
   */
  async startServer() {
    const data = await this.request('/status', { method: 'POST' });
    await this.status().catch(() => {});
    return data;
  }

  /**
   * Stop the Toxiproxy server
   * @returns {Promise<object>} - Response data
   */
  async stopServer() {
    const data = await this.request('/status', { method: 'DELETE' });
    await this.status().catch(() => {});
    return data;
  }

  /**
   * Reset all Toxiproxy state (removes all toxics but keeps proxies)
   * @returns {Promise<object>} - Response data
   */
  async reset() {
    return this.request('/status', { method: 'PUT' });
  }

  /**
   * Get all proxies
   * @returns {Promise<object>} - Map of proxy names to proxy objects
   */
  async proxies() {
    const data = await this.request('/proxies');
    this.dispatchEvent(new CustomEvent('toxic:proxies', { detail: data }));
    return data;
  }

  /**
   * Get a specific proxy by name
   * @param {string} name - Proxy name
   * @returns {Promise<object>} - Proxy object
   */
  async proxy(name) {
    return this.request(`/proxies/${name}`);
  }

  /**
   * Create a new proxy
   * @param {string} name - Proxy name
   * @param {string} listen - Listen address (e.g., "127.0.0.1:8474")
   * @param {string} upstream - Upstream address (e.g., "127.0.0.1:6379")
   * @returns {Promise<object>} - Created proxy object
   */
  async createProxy(name, listen, upstream) {
    return this.request('/proxies', { method: 'POST', body: JSON.stringify({ name, listen, upstream }) });
  }

  /**
   * Toggle a proxy's enabled status
   * @param {string} name - Proxy name
   * @returns {Promise<object>} - Updated proxy object
   */
  async toggleProxy(name) {
    return this.request(`/proxies/${name}/toggle`, { method: 'PATCH' });
  }

  /**
   * Delete a proxy
   * @param {string} name - Proxy name
   * @returns {Promise<object>} - Response data
   */
  async deleteProxy(name) {
    return this.request(`/proxies/${name}`, { method: 'DELETE' });
  }

  /**
   * Get all toxics for a proxy
   * @param {string} proxyName - Proxy name
   * @returns {Promise<array>} - Array of toxic objects
   */
  async getToxics(proxyName) {
    const data = await this.request(`/proxies/${proxyName}/toxics`);
    this.dispatchEvent(new CustomEvent('toxic:toxics', { detail: data }));
    return data;
  }

  /**
   * Add a toxic to a proxy
   * @param {string} proxyName - Proxy name
   * @param {object} toxic - Toxic configuration
   * @param {string} toxic.type - Toxic type (e.g., "latency", "bandwidth")
   * @param {string} [toxic.toxicName] - Custom name for the toxic (defaults to type_stream)
   * @param {string} [toxic.stream="downstream"] - Stream direction ("upstream" or "downstream")
   * @param {number} [toxic.toxicity=1.0] - Toxicity level (0-1)
   * @param {object} [toxic.attributes={}] - Toxic-specific attributes
   * @returns {Promise<object>} - Created toxic object
   */
  async addToxic(proxyName, toxic) {
    return this.request(`/proxies/${proxyName}/toxics`, {
      method: 'POST',
      body: JSON.stringify({
        type: toxic.type,
        name: toxic.toxicName,
        stream: toxic.stream || 'downstream',
        toxicity: isNaN(Number(toxic.toxicity)) ? toxic.toxicity : 1.0,
        attributes: toxic.attributes || {}
      })
    });
  }

  /**
   * Update a toxic
   * @param {string} proxyName - Proxy name
   * @param {string} toxicName - Toxic name
   * @param {number} [toxicity] - New toxicity value (0-1)
   * @param {object} [attributes] - New toxic-specific attributes
   * @returns {Promise<object>} - Updated toxic object
   */
  async updateToxic(proxyName, toxicName, toxicity, attributes) {
    const body = {};
    if (isNaN(Number(toxicity))) body.toxicity = toxicity;
    if (attributes) body.attributes = attributes;

    return this.request(`/proxies/${proxyName}/toxics/${toxicName}`, { method: 'PATCH', body: JSON.stringify(body) });
  }

  /**
   * Remove a toxic
   * @param {string} proxyName - Proxy name
   * @param {string} toxicName - Toxic name
   * @returns {Promise<object>} - Response data
   */
  async removeToxic(proxyName, toxicName) {
    return this.request(`/proxies/${proxyName}/toxics/${toxicName}`, { method: 'DELETE' });
  }

  /**
   * Add a latency toxic (helper method)
   * @param {string} proxyName - Proxy name
   * @param {number} [latency=1000] - Latency in milliseconds
   * @param {number} [jitter=0] - Jitter in milliseconds
   * @param {string} [stream="downstream"] - Stream direction
   * @param {number} [toxicity=1.0] - Toxicity level (0-1)
   * @returns {Promise<object>} - Created toxic object
   */
  async addLatencyToxic(proxyName, latency = 1000, jitter = 0, stream = 'downstream', toxicity = 1.0) {
    return this.request(`/proxies/${proxyName}/latency`, {
      method: 'POST',
      body: JSON.stringify({ latency, jitter, stream, toxicity })
    });
  }

  /**
   * Add a bandwidth toxic (helper method)
   * @param {string} proxyName - Proxy name
   * @param {number} [rate=1000] - Rate in KB/s
   * @param {string} [stream="downstream"] - Stream direction
   * @param {number} [toxicity=1.0] - Toxicity level (0-1)
   * @returns {Promise<object>} - Created toxic object
   */
  async addBandwidthToxic(proxyName, rate = 1000, stream = 'downstream', toxicity = 1.0) {
    return this.request(`/proxies/${proxyName}/bandwidth`, {
      method: 'POST',
      body: JSON.stringify({ rate, stream, toxicity })
    });
  }

  /**
   * Add a timeout toxic (helper method)
   * @param {string} proxyName - Proxy name
   * @param {number} [timeout=10000] - Timeout in milliseconds
   * @param {string} [stream="downstream"] - Stream direction
   * @param {number} [toxicity=1.0] - Toxicity level (0-1)
   * @returns {Promise<object>} - Created toxic object
   */
  async addTimeoutToxic(proxyName, timeout = 10000, stream = 'downstream', toxicity = 1.0) {
    return this.request(`/proxies/${proxyName}/timeout`, {
      method: 'POST',
      body: JSON.stringify({ timeout, stream, toxicity })
    });
  }

  /**
   * Execute a custom CLI command
   * @param {string[]} args - CLI arguments
   * @returns {Promise<object>} - Response with command output
   */
  async execute(args) {
    return this.request('/cli', { method: 'POST', body: JSON.stringify({ args }) });
  }

  static get toxicAttributes() {
    return {
        latency: [
            { name: 'latency', type: 'number', default: 1000, label: 'Latency (ms)' },
            { name: 'jitter', type: 'number', default: 0, label: 'Jitter (ms)' }
        ],
        bandwidth: [
            { name: 'rate', type: 'number', default: 1000, label: 'Rate (KB/s)' }
        ],
        slow_close: [
            { name: 'delay', type: 'number', default: 1000, label: 'Delay (ms)' }
        ],
        timeout: [
            { name: 'timeout', type: 'number', default: 10000, label: 'Timeout (ms)' }
        ],
        reset_peer: [
            { name: 'timeout', type: 'number', default: 0, label: 'Timeout (ms)' }
        ],
        slicer: [
            { name: 'average_size', type: 'number', default: 64, label: 'Average Size (bytes)' },
            { name: 'size_variation', type: 'number', default: 32, label: 'Size Variation (bytes)' },
            { name: 'delay', type: 'number', default: 10, label: 'Delay (microseconds)' }
        ],
        limit_data: [
            { name: 'bytes', type: 'number', default: 1024, label: 'Bytes' }
        ]
    };
  }

  static get defaults() {
    return {
      hostname: 'http://localhost:7072',
    }
  }

}

export default ToxiproxyClient;