import { useEffect, useState } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(localStorage.getItem('ngo_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('ngo_theme', theme);
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
};
