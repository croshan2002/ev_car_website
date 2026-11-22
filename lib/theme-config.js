// Plain module (no 'use client') so the server layout can read these values.
export const THEME_BG = { dark: '#07080b', light: '#eceef1' }

// Runs in <head> before first paint so the page never flashes the wrong theme.
export const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`
