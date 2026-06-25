const required = ['PORT']
for (const key of required) {
  if (!process.env[key]) throw new Error(`Variável de ambiente ausente: ${key}`)
}

export const env = {
  PORT: Number(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV ?? 'production',
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX ?? 30),
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:4001',
}
