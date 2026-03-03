import { useState, useCallback, useEffect, useRef } from "react";

export interface AsyncState<T> {
  result: T | null;
  loading: boolean;
}

export interface UseAsyncOptions<Args extends unknown[]> {
  /**
   * Whether to execute the async function immediately on mount
   */
  immediate?: boolean;
  /**
   * Arguments to pass to the async function if immediate is true
   */
  immediateArgs?: Args;
}

/**
 * Configuration for the API call, including the AbortSignal for cancellation
 */
export interface ApiConfig {
  signal?: AbortSignal;
}

/**
 * Hook to handle asynchronous operations with built-in cancellation support
 * * @param asyncFunction - The service function to execute
 * @param options - Configuration options for the hook
 * @returns State object and the execute function
 */
export const useAsyncService = <T, Args extends unknown[]>(
  asyncFunction: (
    ...args: [...Args, ApiConfig]
  ) => Promise<{ data: T }>,
  options?: UseAsyncOptions<Args>,
) => {
  const [state, setState] = useState<AsyncState<T>>({
    result: null,
    loading: options?.immediate ?? false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<AsyncState<T>> => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new controller for the current request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Execute the function passing the signal as the last argument
        const response = await asyncFunction(...args, {
          signal: controller.signal,
        });

        const successState: AsyncState<T> = {
          result: response.data,
          loading: false,
        };

        // Update state only if the request wasn't aborted
        if (!controller.signal.aborted) {
          setState(successState);
        }
        return successState;
      } catch (err: any) {
        // Ignore the error if it was manually canceled
        if (
          err.name === "CanceledError" ||
          controller.signal.aborted
        ) {
          return { result: null, loading: false };
        }

        const errorState: AsyncState<T> = {
          result: null,
          loading: false,
        };

        setState(errorState);
        return errorState;
      }
    },
    [asyncFunction],
  );

  const hasExecuted = useRef(false);

  useEffect(() => {
    if (!options?.immediate || hasExecuted.current) return;

    hasExecuted.current = true;
    const args = (options.immediateArgs ?? []) as Args;
    execute(...args);

    // Cleanup: abort the request if the component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, options?.immediate, options?.immediateArgs]);

  return { ...state, execute };
};
