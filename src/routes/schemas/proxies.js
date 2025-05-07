export const createProxySchema = {
  $id: 'proxies',
  type: 'object',
  properties: {
    name: { type: 'string' },
    upstream: { type: 'string' },
    listen: { type: 'string' },
    enabled: { type: 'boolean' },
    timeout: { type: 'integer' },
    attributes: {
      type: 'object',
      properties: {
        proxyType: { type: 'string' },
        proxyName: { type: 'string' }
      }
    }
  },
  required: ['name', 'upstream', 'listen'],
  additionalProperties: false
}

