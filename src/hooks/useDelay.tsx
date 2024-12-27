import { useState, useCallback } from 'react';

interface UseDelayReturn {
  loading: boolean;
  withDelay: <T>(promise: Promise<T>) => Promise<T>;
}

const useDelay = (minimumLoadingTime = 1000): UseDelayReturn => {
  const [loading, setLoading] = useState(false);

  const withDelay = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      setLoading(true);
      const startTime = Date.now();

      try {
        const result = await promise;
        const remainingTime = minimumLoadingTime - (Date.now() - startTime);

        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }

        return result;
      } catch (error) {
        const remainingTime = minimumLoadingTime - (Date.now() - startTime);
        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [minimumLoadingTime]
  );

  return { loading, withDelay };
};

export default useDelay;
