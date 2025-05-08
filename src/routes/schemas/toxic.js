export default {
  $id: 'toxic',
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [
        'bandwidth',
        'latency',
        'slicer',
        'timeout',
        'slow_close',
        'slow_start',
        'limit_data',
        'reset',
        'corrupt',
        'delay',
        'echo',
      ],
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    stream: {
      type: 'string',
      enum: ['upstream', 'downstream'],
      default: 'downstream',
    },
    toxicity: {
      type: 'number',
      minimum: 0,
      maximum: 1,
    },
    attributes: {
      type: 'object',
      additionalProperties: true,
    },
  },
  required: ['type', 'name'],
}