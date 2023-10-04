import { useMemo } from 'react';
import { Getter } from './types';
import { createSelector } from './createSelector';
import { useSelector } from './useSelector';

export function useCreateSelector<T>(callback: (get: Getter) => T): T {
  const selector = useMemo(() => createSelector(callback), [callback]);

  return useSelector(selector);
}
