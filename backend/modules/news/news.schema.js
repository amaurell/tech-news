export const searchSchema = {
  querystring: {
    type: 'object',
    properties: {
      topic:    { type: 'string', minLength: 1, maxLength: 50 },
      q:        { type: 'string', minLength: 1, maxLength: 100 },
      quantity: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
      language: { type: 'string', minLength: 2, maxLength: 5, default: 'pt' },
      country:  { type: 'string', minLength: 2, maxLength: 5, default: 'br' },
    },
    anyOf: [
      { required: ['topic'] },
      { required: ['q'] }
    ],
    additionalProperties: false
  }
}

export const articleSchema = {
  querystring: {
    type: 'object',
    properties: {
      uuid: { type: 'string', minLength: 1 },
    },
    required: ['uuid'],
    additionalProperties: false
  }
}
