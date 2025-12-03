import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Guardar preferencia
    localStorage.setItem('darkMode', isDark);
    
    // Aplicar clase al HTML root
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    
    // Añadir clase de transición temporal
    root.classList.add('dark-mode-transition');
    
    const timer = setTimeout(() => {
      root.classList.remove('dark-mode-transition');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  return { isDark, toggleDarkMode };
};