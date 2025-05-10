import { ElMessage } from 'element-plus'
import { type ErrorMessage } from '@/types/error'

export class ErrorHandler {
  static showMessage({ type = 'error', message, duration = 3000 }: ErrorMessage) {
    ElMessage({
      message,
      type,
      duration,
    })
  }

  static showError(message: string) {
    this.showMessage({ type: 'error', message })
  }

  static showSuccess(message: string) {
    this.showMessage({ type: 'success', message })
  }
}
