'use client'

import { useCallback, useEffect, useState } from 'react'

import { THEME_BG } from './theme-config'

function apply(t) {
  const d = document.documentElement
  d.dataset.theme = t
  d.style.colorScheme = t
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', THEME_BG[t]))
}

export function useTheme() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
    // Follow the OS setting until the visitor picks a theme themselves.
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (e) => {
      let saved = null
      try {
        saved = localStorage.getItem('theme')
      } catch {}
      if (saved) return
      const t = e.matches ? 'light' : 'dark'
      apply(t)
      setTheme(t)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setTheme((cur) => {
      const t = cur === 'dark' ? 'light' : 'dark'
      apply(t)
      try {
        localStorage.setItem('theme', t)
      } catch {}
      return t
    })
  }, [])

  return [theme, toggle]
}
