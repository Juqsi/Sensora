import { ref } from 'vue'

export function useTheme() {
  const theme = ref<'light' | 'dark' | 'os'>(
    (localStorage.getItem('theme') as 'light' | 'dark' | 'os' | null) ?? getOSPreference(),
  )

  function getOSPreference(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function applyTheme(themeValue: 'light' | 'dark') {
    const html = document.documentElement
    if (themeValue === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
  }

  function setTheme(newTheme: 'light' | 'dark'): boolean {
    if (theme.value !== newTheme) {
      theme.value = newTheme
      localStorage.setItem('theme', newTheme)
      applyTheme(newTheme)
      return true
    }
    return false
  }

  function setOSTheme(): boolean {
    if (localStorage.getItem('theme') === 'os') {
      return false
    }
    const osTheme = getOSPreference()
    if (theme.value !== osTheme) {
      theme.value = osTheme
      localStorage.setItem('theme', 'os')
      applyTheme(osTheme)
    }
    return true
  }

  if (theme.value !== 'os') {
    applyTheme(theme.value)
  } else {
    applyTheme(getOSPreference())
  }

  return { theme, setTheme, setOSTheme }
}
