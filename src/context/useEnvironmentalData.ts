import { useContext } from 'react';
import { EnvironmentalContext } from './environmentalContextDef';
import type { EnvironmentalContextValue } from './environmentalContextDef';

export const useEnvironmentalData = (): EnvironmentalContextValue => {
  const context = useContext(EnvironmentalContext);
  if (!context) {
    throw new Error('useEnvironmentalData must be used within an EnvironmentalProvider');
  }
  return context;
};
