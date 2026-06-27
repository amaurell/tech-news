const required = ['PORT']
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Variável de ambiente ausente: ${key}`)
    process.exit(1)
  }
}

export const env = {
  PORT: Number(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV ?? 'production',
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX ?? 30),
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'true',
}
