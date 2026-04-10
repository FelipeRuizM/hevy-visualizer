import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type UnitType = 'kg' | 'lbs';

interface SettingsContextType {
  unit: UnitType;
  toggleUnit: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unit, setUnit] = useState<UnitType>('kg');

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'kg' ? 'lbs' : 'kg'));
  };

  return (
    <SettingsContext.Provider value={{ unit, toggleUnit }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
