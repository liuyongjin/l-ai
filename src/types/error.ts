export interface ErrorMessage {
  type: 'error' | 'success' | 'warning' | 'info'
  message: string
  duration?: number
}
