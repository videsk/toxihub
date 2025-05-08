import ToxiproxyClient from './client.js';
import { updateServerStatus, showResponse, updateProxySelect, updateProxiesList, initializeEventListeners } from './ui.js';

const options = JSON.parse(localStorage.getItem('options') || '{}');

const proxyClient = new ToxiproxyClient(options);
export default proxyClient;

proxyClient.addEventListener('toxic:request', event => showResponse(event.detail));

proxyClient.addEventListener('toxic:proxies', event => {
    const data = event.detail;
    updateProxiesList(data, proxyClient);
    updateProxySelect(data);
});

proxyClient.addEventListener('toxic:status', event => {
    const data = event.detail;
    updateServerStatus(data);
});

initializeEventListeners(proxyClient);