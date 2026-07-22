import { useEffect, useState } from 'react'

const STORAGE_KEY = 'talentflow-theme'

function getInitialDarkMode() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem(STORAGE_KEY, darkMode ? 'dark' : 'light')
  }, [darkMode])

  return [darkMode, setDarkMode]
}
