/**
 * ToxiproxyClient - A JavaScript client for interacting with the Toxiproxy API wrapper
 */
class ToxiproxyClient {
  /**
   * Create a new ToxiproxyClient instance
   * @param {string} baseUrl - The base URL of the Toxiproxy wrapper API (default: http://localhost:3000/api)
   */
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a request to the API
   * @param {string} endpoint - The API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<object>} - Response data
   * @private
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Set default headers if not provided
    if (!options.headers) {
      options.headers = {
        'Content-Type': 'application/json'
      };
    }
    
    try {
      const response = await fetch(url, options);
      
      // For 204 No Content responses
      if (response.status === 204) {
        return { success: true };
      }
      
      // For all other responses
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error in request to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Check the status of the Toxiproxy server
   * @returns {Promise<object>} - Server status information
   */
  async getStatus() {
    return this._request('/status');
  }

  /**
   * Start the Toxiproxy server
   * @returns {Promise<object>} - Response data
   */
  async startServer() {
    return this._request('/start', { method: 'POST' });
  }

  /**
   * Stop the Toxiproxy server
   * @returns {Promise<object>} - Response data
   */
  async stopServer() {
    return this._request('/stop', { method: 'POST' });
  }

  /**
   * Reset all Toxiproxy state (removes all toxics but keeps proxies)
   * @returns {Promise<object>} - Response data
   */
  async reset() {
    return this._request('/reset', { method: 'POST' });
  }

  /**
   * Get all proxies
   * @returns {Promise<object>} - Map of proxy names to proxy objects
   */
  async getProxies() {
    return this._request('/proxies');
  }

  /**
   * Get a specific proxy by name
   * @param {string} name - Proxy name
   * @returns {Promise<object>} - Proxy object
   */
  async getProxy(name) {
    return this._request(`/proxies/${name}`);
  }

  /**
   * Create a new proxy
   * @param {string} name - Proxy name
   * @param {string} listen - Listen address (e.g., "127.0.0.1:8474")
   * @param {string} upstream - Upstream address (e.g., "127.0.0.1:6379")
   * @returns {Promise<object>} - Created proxy object
   */
  async createProxy(name, listen, upstream) {
    return this._request('/proxies', {
      method: 'POST',
      body: JSON.stringify({ name, listen, upstream })
    });
  }

  /**
   * Toggle a proxy's enabled status
   * @param {string} name - Proxy name
   * @returns {Promise<object>} - Updated proxy object
   */
  async toggleProxy(name) {
    return this._request(`/proxies/${name}/toggle`, {
      method: 'POST'
    });
  }

  /**
   * Delete a proxy
   * @param {string} name - Proxy name
   * @returns {Promise<object>} - Response data
   */
  async deleteProxy(name) {
    return this._request(`/proxies/${name}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get all toxics for a proxy
   * @param {string} proxyName - Proxy name
   * @returns {Promise<array>} - Array of toxic objects
   */
  async getToxics(proxyName) {
    return this._request(`/proxies/${proxyName}/toxics`);
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
    return this._request(`/proxies/${proxyName}/toxics`, {
      method: 'POST',
      body: JSON.stringify({
        type: toxic.type,
        toxicName: toxic.toxicName,
        stream: toxic
