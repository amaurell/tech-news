import { AppError } from './AppError.js'

export class ExternalApiError extends AppError {
  constructor (message) {
    super(message, 502, 'EXTERNAL_API_ERROR')
  }
}
