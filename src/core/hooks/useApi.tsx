import { AxiosResponse } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

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

export const useApi = <T, P>(apiCall: (param: P) => Promise<AxiosResponse<T>>, options?: UseApiOptions<P>): UseApiResult<T, P> => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Data<T>>(null);
    const [error, setError] = useState<CustomError>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

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
                if (options?.onError) {
                    options.onError(err as Error);
                }
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [apiCall, options]
    );

    useEffect(() => {
        if (options?.autoFetch && options.params) {
            fetch(options.params).catch(() => { });
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetch, options?.autoFetch, options?.params])

    return { loading, data, error, fetch }
}