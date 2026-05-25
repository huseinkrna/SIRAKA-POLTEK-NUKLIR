import { createContext, useState, useContext } from 'react';

// Membuat wadah Context
const LanguageContext = createContext();

// Membuat Provider untuk membungkus aplikasi
export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('ID'); // Default bahasa Indonesia

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook agar halaman lain gampang memanggilnya
export const useLanguage = () => useContext(LanguageContext);