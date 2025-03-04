import { onMounted, onUnmounted, ref } from 'vue'

export function usePullToRefresh(callback: () => Promise<void>) {
  const isRefreshing = ref(false)
  let startY = 0
  let isDragging = false

  const onStart = (e: TouchEvent | MouseEvent) => {
    if (window.scrollY > 0 || isRefreshing.value) return
    isDragging = true
    startY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  }

  const onMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging) return
    const currentY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
    if (currentY - startY > 100 && !isRefreshing.value) {
      isDragging = false
      onPull()
    }
  }

  const onEnd = () => {
    isDragging = false
  }

  const onPull = async () => {
    isRefreshing.value = true
    try {
      await callback()
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error)
    } finally {
      isRefreshing.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('touchstart', onStart)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onEnd)
    window.addEventListener('mousedown', onStart)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
  })

  onUnmounted(() => {
    window.removeEventListener('touchstart', onStart)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onEnd)
    window.removeEventListener('mousedown', onStart)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onEnd)
  })

  return { isRefreshing }
}
