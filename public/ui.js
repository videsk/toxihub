/**
 * UI.js - UI interaction functions for Toxiproxy client
 * This file handles all UI interactions independent of the API logic
 */

import ToxiproxyClient from './client.js';

// DOM Elements
const elements = {
  serverStatusBadge: document.getElementById('server-status-badge'),
  proxiesList: document.getElementById('proxies-list'),
  proxySelect: document.getElementById('toxic-proxy'),
  toxicAttributes: document.getElementById('toxic-attributes'),
  apiResponse: document.getElementById('api-response'),
  startServerBtn: document.getElementById('start-server-btn'),
  stopServerBtn: document.getElementById('stop-server-btn'),
  refreshBtn: document.getElementById('refresh-btn'),
  resetBtn: document.getElementById('reset-btn'),
  createProxyForm: document.getElementById('create-proxy-form'),
  toxicTypeSelect: document.getElementById('toxic-type'),
  addToxicForm: document.getElementById('add-toxic-form')
};

/**
 * Updates server status badge
 * @param {Object} data - Server status object
 */
function updateServerStatus(data) {
  if (!elements.serverStatusBadge) return;

  const statusMap = {
    'running': { className: 'badge bg-success', text: 'Running' },
    'stopped': { className: 'badge bg-danger', text: 'Stopped' },
    'error': { className: 'badge bg-secondary', text: 'Error' }
  };

  const status = statusMap[data.status] || statusMap.error;
  elements.serverStatusBadge.className = status.className;
  elements.serverStatusBadge.textContent = status.text;
}

/**
 * Renders the attributes of a toxic
 * @param {Object} attributes - Toxic attributes
 * @returns {string} HTML representing the attributes
 */
function renderToxicAttributes(attributes) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return '';
  }

  let html = '<div class="mt-1"><span class="text-terminal-dim">Attributes:</span><ul class="ml-4 text-terminal-green">';

  for (const key in attributes) {
    html += `<li>- ${key}: <span class="text-terminal-cyan">${attributes[key]}</span></li>`;
  }

  html += '</ul></div>';
  return html;
}

/**
 * Renders a collection of toxics for a proxy
 * @param {string} proxyName - Name of the proxy
 * @param {Array} toxics - Array of toxic objects
 * @returns {string} HTML representing the toxics
 */
function renderToxics(proxyName, toxics) {
  if (!toxics || toxics.length === 0) {
    return '<div class="text-terminal-dim text-sm border border-dashed border-terminal-dim p-2 rounded">// No toxics configured</div>';
  }

  let html = '<div class="space-y-2 mt-1">';

  for (const toxic of toxics) {
    html += `
    <div class="border border-terminal-red/40 rounded overflow-hidden">
      <div class="bg-terminal-red/10 px-2 py-1 flex justify-between items-center border-b border-terminal-red/30">
        <div class="text-terminal-red font-bold flex items-center">
          <i class="fas fa-radiation mr-1"></i> ${toxic.name}
        </div>
        <button class="proxy-button delete-btn delete-toxic-btn text-xs" data-proxy="${proxyName}" data-toxic="${toxic.name}">
          REMOVE
        </button>
      </div>
      <div class="p-2 bg-gray-800/30 text-xs">
        <div class="grid grid-cols-2 gap-1">
          <p><span class="text-terminal-dim">Type:</span> <span class="text-terminal-yellow">${toxic.type}</span></p>
          <p><span class="text-terminal-dim">Stream:</span> <span class="text-terminal-yellow">${toxic.stream}</span></p>
          <p><span class="text-terminal-dim">Toxicity:</span> <span class="text-terminal-yellow">${toxic.toxicity}</span></p>
        </div>
        ${renderToxicAttributes(toxic.attributes)}
      </div>
    </div>
    `;
  }

  html += '</div>';
  return html;
}

/**
 * Updates the list of proxies in the UI
 * @param proxies
 * @param proxyClient
 */
function updateProxiesList(proxies, proxyClient) {
  if (!elements.proxiesList) return;

  if (!proxies || Object.keys(proxies).length === 0) {
    elements.proxiesList.innerHTML = '<div class="text-terminal-dim p-3 border border-terminal-dim rounded">// No proxies found</div>';
    return;
  }

  let html = '';

  for (const name in proxies) {
    const proxy = proxies[name];
    const statusClass = proxy.enabled ? 'terminal-green' : 'terminal-red';
    const statusText = proxy.enabled ? 'ENABLED' : 'DISABLED';
    const toggleBtnClass = proxy.enabled ? 'disable-btn' : 'enable-btn';
    const toggleBtnText = proxy.enabled ? 'DISABLE' : 'ENABLE';

    html += `
    <div class="border border-terminal-dim rounded mb-4 overflow-hidden">
      <div class="bg-gray-800/40 px-3 py-2 border-b border-terminal-dim flex justify-between items-center">
        <div class="flex items-center">
          <span class="text-terminal-cyan font-bold">${name}</span>
          <span class="ml-2 px-2 py-0.5 text-xs text-${statusClass} border border-${statusClass} rounded-sm">${statusText}</span>
        </div>
        <div class="space-x-2">
          <button class="proxy-button ${toggleBtnClass} toggle-proxy-btn" data-proxy="${name}">
            ${toggleBtnText}
          </button>
          <button class="proxy-button delete-btn delete-proxy-btn" data-proxy="${name}">
            DELETE
          </button>
        </div>
      </div>
      <div class="p-3 bg-gray-900/50">
        <div class="text-terminal-green grid grid-cols-1 gap-1">
          <p><span class="text-terminal-dim inline-block w-24">Listen:</span> ${proxy.listen}</p>
          <p><span class="text-terminal-dim inline-block w-24">Upstream:</span> ${proxy.upstream}</p>
          
          <div class="mt-2">
            <p class="text-terminal-dim mb-1">Toxics:</p>
            ${renderToxics(name, proxy.toxics)}
          </div>
        </div>
      </div>
    </div>
    `;
  }

  elements.proxiesList.innerHTML = html;

  // Attach event listeners to new buttons
  attachProxyEventListeners(proxyClient);
}

/**
 * Attaches event listeners to proxy action buttons
 */
function attachProxyEventListeners(proxyClient) {
  document.querySelectorAll('.toggle-proxy-btn').forEach(btn => {

    btn.addEventListener('click', async (e) => {
      const proxyName = e.target.dataset.proxy;
      await proxyClient.toggleProxy(proxyName);
      proxyClient.proxies();
    });
  });

  document.querySelectorAll('.delete-proxy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const proxyName = e.target.dataset.proxy;
      await proxyClient.deleteProxy(proxyName);
      proxyClient.proxies();
    });
  });

  document.querySelectorAll('.delete-toxic-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const proxyName = e.target.dataset.proxy;
      const toxicName = e.target.dataset.toxic;
      await proxyClient.removeToxic(proxyName, toxicName);
      proxyClient.proxies();
    });
  });
}

/**
 * Updates the proxy selection dropdown
 * @param {Object} proxies - Proxies object from API
 */
function updateProxySelect(proxies) {
  if (!elements.proxySelect) return;

  let options = '<option value="">Select a proxy</option>';

  for (const name in proxies) {
    options += `<option value="${name}">${name}</option>`;
  }

  elements.proxySelect.innerHTML = options;
}

/**
 * Renders attribute inputs for selected toxic type
 * @param {string} toxicType - Type of toxic
 */
function renderToxicAttributeInputs(toxicType) {
  if (!elements.toxicAttributes) return;

  const attributes = ToxiproxyClient.toxicAttributes[toxicType];

  if (!attributes) {
    elements.toxicAttributes.innerHTML = '<div class="text-terminal-yellow text-sm"><i class="fas fa-exclamation-triangle mr-1"></i> No attributes for this toxic</div>';
    return;
  }

  let html = '';

  for (const attr of attributes) {
    html += `
    <div class="mb-3">
      <label for="attr-${attr.name}" class="text-terminal-green block mb-1">${attr.label}</label>
      <input type="${attr.type}" class="toxic-attr-input" id="attr-${attr.name}" name="${attr.name}" value="${attr.default}">
    </div>
    `;
  }

  elements.toxicAttributes.innerHTML = html;
}

/**
 * Collects attribute values from input fields
 * @param {string} toxicType - Type of toxic
 * @returns {Object} Collected attribute values
 */
function collectAttributeValues(toxicType) {
  const attributes = ToxiproxyClient.toxicAttributes[toxicType];
  if (!attributes) return {};

  const result = {};

  for (const attr of attributes) {
    const input = document.getElementById(`attr-${attr.name}`);
    if (input) {
      result[attr.name] = input.type === 'number' ? Number(input.value) : input.value;
    }
  }

  return result;
}

/**
 * Shows API response in the UI
 * @param {Object} data - API response data
 */
function showResponse(data) {
  if (!elements.apiResponse) return;
  elements.apiResponse.textContent = JSON.stringify(data, null, 2);
}

// Initialize event listeners
function initializeEventListeners(proxyClient) {
  // UI action buttons
  elements.startServerBtn?.addEventListener('click', () => proxyClient.startServer());

  elements.stopServerBtn?.addEventListener('click', () => proxyClient.stopServer());

  elements.refreshBtn?.addEventListener('click', () => {
      proxyClient.status();
      proxyClient.proxies();
  });

  elements.resetBtn?.addEventListener('click', () => proxyClient.reset());

  // Form submissions
  elements.createProxyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('proxy-name')?.value;
    const listen = document.getElementById('listen-address')?.value;
    const upstream = document.getElementById('upstream-address')?.value;

    await proxyClient.createProxy(name, listen, upstream);
    proxyClient.proxies();
  });

  elements.toxicTypeSelect?.addEventListener('change', (e) => {
    renderToxicAttributeInputs(e.target.value);
  });

  elements.addToxicForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const proxyName = document.getElementById('toxic-proxy')?.value;
    const toxicType = document.getElementById('toxic-type')?.value;
    const stream = document.getElementById('toxic-stream')?.value;
    const toxicity = parseFloat(document.getElementById('toxic-toxicity')?.value || '1.0');
    const attributes = collectAttributeValues(toxicType);
    const toxicName = `${toxicType}_${stream}`;

    const toxic = { type: toxicType, toxicName, toxicity, attributes, stream };
    await proxyClient.addToxic(proxyName, toxic);
    proxyClient.proxies();
  });
}

// Export all needed functions for main.js
export {
  updateServerStatus,
  updateProxiesList,
  updateProxySelect,
  renderToxicAttributeInputs,
  collectAttributeValues,
  showResponse,
  initializeEventListeners
};