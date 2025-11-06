import React from 'react';

export function getStrictContext<T>() {
  const context = React.createContext<T | undefined>(undefined);

  function useContext() {
    const value = React.useContext(context);
    if (value === undefined) {
      throw new Error('useContext must be used within a Provider');
    }
    return value;
  }

  return [context.Provider, useContext] as const;
}
