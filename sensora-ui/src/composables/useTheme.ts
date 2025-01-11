import { ref } from 'vue'

export enum Theme {
  Light = 'light',
  Dark = 'dark',
  OS = 'os',
}

export function useTheme() {
  const theme = ref<Theme>(getTheme())

  function getTheme(): Theme {
    const storedTheme = localStorage.getItem('theme') as Theme | null
    return storedTheme && Object.values(Theme).includes(storedTheme)
      ? storedTheme
      : getOSPreference()
  }

  function getOSPreference(): Theme.Light | Theme.Dark {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.Dark : Theme.Light
  }

  function applyTheme(themeValue: Theme.Light | Theme.Dark) {
    const html = document.documentElement
    if (themeValue === Theme.Dark) {
      html.classList.add(Theme.Dark)
      html.classList.remove(Theme.Light)
    } else {
      html.classList.add(Theme.Light)
      html.classList.remove(Theme.Dark)
    }
  }

  function setTheme(newTheme: Theme.Light | Theme.Dark): boolean {
    if (theme.value !== newTheme) {
      theme.value = newTheme
      localStorage.setItem('theme', newTheme)
      applyTheme(newTheme)
      return true
    }
    return false
  }

  function setOSTheme(): boolean {
    if (theme.value === Theme.OS) {
      return false
    }
    const osTheme = getOSPreference()
    theme.value = Theme.OS
    localStorage.setItem('theme', Theme.OS)
    applyTheme(osTheme)
    return true
  }

  if (theme.value !== Theme.OS) {
    applyTheme(theme.value)
  } else {
    applyTheme(getOSPreference())
  }

  return { Theme, theme, setTheme, setOSTheme }
}
