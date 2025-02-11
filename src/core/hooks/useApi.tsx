import { AxiosResponse } from "axios";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

type Data<T> = T | null;
type CustomError = Error | null;

interface UseApiOptions<P> {
    autoFetch?: boolean;
    params?: P;
    onError?: (error: Error) => void;
}

interface UseApiResult<T, P> {
    loading: boolean;
    data: Data<T>;
    error: CustomError;
    fetch: (params: P) => Promise<AxiosResponse<T>>;
}

export const useApi = <T, P>(
    apiCall: (param: P) => Promise<AxiosResponse<T>>,
    options?: UseApiOptions<P>
): UseApiResult<T, P> => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Data<T>>(null);
    const [error, setError] = useState<CustomError>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);

    const fetch = useCallback(
        async (params: P): Promise<AxiosResponse<T>> => {
            setLoading(true);
            setError(null);

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            try {
                const response = await apiCall(params);
                setData(response.data);
                return response;
            } catch (err) {
                setError(err as Error);
                if (memoizedOptions?.onError) {
                    memoizedOptions.onError(err as Error);
                }
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [apiCall, memoizedOptions]
    );

    useEffect(() => {
        if (memoizedOptions?.autoFetch && memoizedOptions.params) {
            fetch(memoizedOptions.params).catch(() => { });
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetch, memoizedOptions?.autoFetch, memoizedOptions?.params]);

    return { loading, data, error, fetch };
};