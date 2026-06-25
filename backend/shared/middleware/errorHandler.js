export function errorHandler (error, request, reply) {
  const statusCode = error.statusCode ?? 500
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Erro interno do servidor'
    : error.message

  reply.code(statusCode).send({
    ok: false,
    error: { code: error.code ?? 'ERROR', message }
  })
}
