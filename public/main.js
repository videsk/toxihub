const API_BASE_URL = 'http://localhost:7072';

// Toxic type attribute definitions
const toxicAttributes = {
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

// API Functions
async function fetchServerStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        const data = await response.json();
        updateServerStatus(data);
        return data;
    } catch (error) {
        console.error('Error fetching server status:', error);
        updateServerStatus({ status: 'error' });
        return { status: 'error' };
    }
}

async function startServer() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`, { method: 'POST' });
        const data = await response.json();
        showResponse(data);
        fetchServerStatus();
        fetchProxies();
        return data;
    } catch (error) {
        console.error('Error starting server:', error);
        showResponse({ error: 'Failed to start server' });
    }
}

async function stopServer() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`, { method: 'DELETE' });
        const data = await response.json();
        showResponse(data);
        fetchServerStatus();
        return data;
    } catch (error) {
        console.error('Error stopping server:', error);
        showResponse({ error: 'Failed to stop server' });
    }
}

async function resetState() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`, { method: 'PUT' });
        showResponse({ message: 'Reset successful' });
        fetchProxies();
        return true;
    } catch (error) {
        console.error('Error resetting state:', error);
        showResponse({ error: 'Failed to reset state' });
        return false;
    }
}

async function fetchProxies() {
    try {
        const response = await fetch(`${API_BASE_URL}/proxies`);
        const data = await response.json();
        updateProxiesList(data);
        updateProxySelect(data);
        return data;
    } catch (error) {
        console.error('Error fetching proxies:', error);
        updateProxiesList({});
        updateProxySelect({});
        return {};
    }
}

async function createProxy(name, listen, upstream) {
    try {
        const response = await fetch(`${API_BASE_URL}/proxies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, listen, upstream })
        });
        const data = await response.json();
        showResponse(data);
        fetchProxies();
        return data;
    } catch (error) {
        console.error('Error creating proxy:', error);
        showResponse({ error: 'Failed to create proxy' });
        return null;
    }
}

async function toggleProxy(name) {
    try {
        const response = await fetch(`${API_BASE_URL}/proxies/${name}/toggle`, { method: 'PATCH' });
        const data = await response.json();
        showResponse(data);
        fetchProxies();
        return data;
    } catch (error) {
        console.error('Error toggling proxy:', error);
        showResponse({ error: `Failed to toggle proxy ${name}` });
        return null;
    }
}

async function deleteProxy(name) {
    try {
        const response = await fetch(`${API_BASE_URL}/proxies/${name}`, {
            method: 'DELETE'
        });
        showResponse({ message: `Proxy ${name} deleted` });
        fetchProxies();
        return true;
    } catch (error) {
        console.error('Error deleting proxy:', error);
        showResponse({ error: `Failed to delete proxy ${name}` });
        return false;
    }
}

async function addToxic(proxyName, toxicType, toxicName, stream, toxicity, attributes) {
    try {
        const response = await fetch(`${API_BASE_URL}/proxies/${proxyName}/toxics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: toxicType,
                name: toxicName,
                stream,
                toxicity,
                attributes
            })
        });
        const data = await response.json();
        showResponse(data);
        fetchProxies();
        return data;
    } catch (error) {
        console.error('Error adding toxic:', error);
        showResponse({ error: 'Failed to add toxic' });
        return null;
    }
}

async function deleteToxic(proxyName, toxicName) {
    try {
        const response = await fetch(`${API_BASE_URL}/proxies/${proxyName}/toxics/${toxicName}`, {
            method: 'DELETE'
        });
        showResponse({ message: `Toxic ${toxicName} deleted from ${proxyName}` });
        fetchProxies();
        return true;
    } catch (error) {
        console.error('Error deleting toxic:', error);
        showResponse({ error: `Failed to delete toxic ${toxicName}` });
        return false;
    }
}

// UI Functions
function updateServerStatus(data) {
    const badge = document.getElementById('server-status-badge');
    if (data.status === 'running') {
        badge.className = 'badge bg-success';
        badge.textContent = 'Running';
    } else if (data.status === 'stopped') {
        badge.className = 'badge bg-danger';
        badge.textContent = 'Stopped';
    } else {
        badge.className = 'badge bg-secondary';
        badge.textContent = 'Error';
    }
}

function updateProxiesList(proxies) {
    const list = document.getElementById('proxies-list');
    if (!proxies || Object.keys(proxies).length === 0) {
        list.innerHTML = '<div class="alert alert-info">No proxies found</div>';
        return;
    }

    let html = '';
    for (const name in proxies) {
        const proxy = proxies[name];
        const statusClass = proxy.enabled ? 'success' : 'danger';
        const statusText = proxy.enabled ? 'Enabled' : 'Disabled';

        html += `
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5>${name} <span class="badge bg-${statusClass} status-badge">${statusText}</span></h5>
                <div class="proxy-controls">
                    <button class="btn btn-sm btn-${proxy.enabled ? 'warning' : 'success'} toggle-proxy-btn" data-proxy="${name}">
                        ${proxy.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button class="btn btn-sm btn-danger delete-proxy-btn" data-proxy="${name}">Delete</button>
                </div>
            </div>
            <div class="card-body">
                <p><strong>Listen:</strong> ${proxy.listen}</p>
                <p><strong>Upstream:</strong> ${proxy.upstream}</p>
                
                <h6>Toxics:</h6>
                ${renderToxics(name, proxy.toxics)}
            </div>
        </div>
        `;
    }
    list.innerHTML = html;

    // Add event listeners to buttons
    document.querySelectorAll('.toggle-proxy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const proxyName = e.target.dataset.proxy;
            toggleProxy(proxyName);
        });
    });

    document.querySelectorAll('.delete-proxy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const proxyName = e.target.dataset.proxy;
            deleteProxy(proxyName);
        });
    });

    document.querySelectorAll('.delete-toxic-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const proxyName = e.target.dataset.proxy;
            const toxicName = e.target.dataset.toxic;
            deleteToxic(proxyName, toxicName);
        });
    });
}

function renderToxics(proxyName, toxics) {
    if (!toxics || toxics.length === 0) {
        return '<div class="alert alert-light">No toxics configured</div>';
    }

    let html = '<div class="row">';
    for (const toxic of toxics) {
        html += `
        <div class="col-md-6">
            <div class="card toxic-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${toxic.name}</h6>
                    <button class="btn btn-sm btn-danger delete-toxic-btn" data-proxy="${proxyName}" data-toxic="${toxic.name}">Remove</button>
                </div>
                <div class="card-body">
                    <p><strong>Type:</strong> ${toxic.type}</p>
                    <p><strong>Stream:</strong> ${toxic.stream}</p>
                    <p><strong>Toxicity:</strong> ${toxic.toxicity}</p>
                    ${renderToxicAttributes(toxic.attributes)}
                </div>
            </div>
        </div>
        `;
    }
    html += '</div>';
    return html;
}

function renderToxicAttributes(attributes) {
    if (!attributes || Object.keys(attributes).length === 0) {
        return '';
    }

    let html = '<strong>Attributes:</strong><ul>';
    for (const key in attributes) {
        html += `<li>${key}: ${attributes[key]}</li>`;
    }
    html += '</ul>';
    return html;
}

function updateProxySelect(proxies) {
    const select = document.getElementById('toxic-proxy');
    let options = '<option value="">Select a proxy</option>';

    for (const name in proxies) {
        options += `<option value="${name}">${name}</option>`;
    }

    select.innerHTML = options;
}

function renderToxicAttributeInputs(toxicType) {
    const container = document.getElementById('toxic-attributes');
    const attributes = toxicAttributes[toxicType];

    if (!attributes) {
        container.innerHTML = '<div class="alert alert-warning">No attributes for this toxic</div>';
        return;
    }

    let html = '';
    for (const attr of attributes) {
        html += `
        <div class="mb-3">
            <label for="attr-${attr.name}" class="form-label">${attr.label}</label>
            <input type="${attr.type}" class="form-control" id="attr-${attr.name}" name="${attr.name}" value="${attr.default}">
        </div>
        `;
    }

    container.innerHTML = html;
}

function collectAttributeValues(toxicType) {
    const attributes = toxicAttributes[toxicType];
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

function showResponse(data) {
    const container = document.getElementById('api-response');
    container.textContent = JSON.stringify(data, null, 2);
}

// Event Listeners
document.getElementById('start-server-btn').addEventListener('click', startServer);
document.getElementById('stop-server-btn').addEventListener('click', stopServer);
document.getElementById('refresh-btn').addEventListener('click', () => {
    fetchServerStatus();
    fetchProxies();
});
document.getElementById('reset-btn').addEventListener('click', resetState);

document.getElementById('create-proxy-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('proxy-name').value;
    const listen = document.getElementById('listen-address').value;
    const upstream = document.getElementById('upstream-address').value;
    createProxy(name, listen, upstream);
});

document.getElementById('toxic-type').addEventListener('change', (e) => {
    renderToxicAttributeInputs(e.target.value);
});

document.getElementById('add-toxic-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const proxyName = document.getElementById('toxic-proxy').value;
    const toxicType = document.getElementById('toxic-type').value;
    const stream = document.getElementById('toxic-stream').value;
    const toxicity = parseFloat(document.getElementById('toxic-toxicity').value);
    const attributes = collectAttributeValues(toxicType);
    const toxicName = `${toxicType}_${stream}`;

    addToxic(proxyName, toxicType, toxicName, stream, toxicity, attributes);
});

// Initialize
fetchServerStatus();
fetchProxies();