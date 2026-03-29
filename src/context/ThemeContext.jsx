import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  // ── Modo claro/oscuro ──────────────────────────────────────────
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('app-theme') || 'light'
  );

  // ── Estilo visual: 'brutalist' | 'neumorphism' ─────────────────
  const [visualStyle, setVisualStyle] = useState(() =>
    localStorage.getItem('app-visual-style') || 'brutalist'
  );

  // Aplicar tema claro/oscuro
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Aplicar estilo visual
  useEffect(() => {
    document.documentElement.setAttribute('data-style', visualStyle);
    localStorage.setItem('app-visual-style', visualStyle);
  }, [visualStyle]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const toggleVisualStyle = () =>
    setVisualStyle(prev => (prev === 'brutalist' ? 'neumorphism' : 'brutalist'));

  const setStyle = (style) => {
    if (style === 'brutalist' || style === 'neumorphism') setVisualStyle(style);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, visualStyle, toggleVisualStyle, setStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};