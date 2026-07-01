import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'error' | 'warning' | 'success' | 'info'
}

const toasts = ref<Toast[]>([])
let nextId = 0
const TOAST_DURATION = 6000

export function useToast() {
  function show(message: string, type: Toast['type'] = 'warning') {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), TOAST_DURATION)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function clearAll() {
    toasts.value = []
  }

  return { toasts, show, dismiss, clearAll }
}
