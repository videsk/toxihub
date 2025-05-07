// This script will override the rendering functions in main.js to apply our new styles
document.addEventListener('DOMContentLoaded', function() {
    // Store original functions to call after our style modifications
    const originalRenderToxicAttributeInputs = window.renderToxicAttributeInputs;

    // Override the updateProxiesList function to style the buttons properly
    window.updateProxiesList = function(proxies) {
        const list = document.getElementById('proxies-list');
        if (!proxies || Object.keys(proxies).length === 0) {
            list.innerHTML = '<div class="text-terminal-dim p-3 border border-terminal-dim rounded">// No proxies found</div>';
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
    };

    // Override renderToxics function to style toxics better
    window.renderToxics = function(proxyName, toxics) {
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
    };

    // Override renderToxicAttributes for the toxic details
    window.renderToxicAttributes = function(attributes) {
        if (!attributes || Object.keys(attributes).length === 0) {
            return '';
        }

        let html = '<div class="mt-1"><span class="text-terminal-dim">Attributes:</span><ul class="ml-4 text-terminal-green">';
        for (const key in attributes) {
            html += `<li>- ${key}: <span class="text-terminal-cyan">${attributes[key]}</span></li>`;
        }
        html += '</ul></div>';
        return html;
    };

    // Override the renderToxicAttributeInputs to style attribute inputs
    window.renderToxicAttributeInputs = function(toxicType) {
        const container = document.getElementById('toxic-attributes');
        const attributes = toxicAttributes[toxicType];

        if (!attributes) {
            container.innerHTML = '<div class="text-terminal-yellow text-sm"><i class="fas fa-exclamation-triangle mr-1"></i> No attributes for this toxic</div>';
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

        container.innerHTML = html;
    };
});