import { useState, useEffect, useCallback } from "react";

/**
 * Generic data-fetching hook.
 * @param {Function} apiFunction - Axios API function to call
 * @param {Object} params - Query parameters
 * @param {boolean} immediate - Whether to fetch immediately
 */
export function useFetch(apiFunction, params = {}, immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetch = useCallback(
    async (overrideParams) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunction(overrideParams || params);
        setData(response.data.data);
        return response.data.data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, JSON.stringify(params)]
  );

  useEffect(() => {
    if (immediate) fetch();
  }, [immediate, fetch]);

  return { data, loading, error, refetch: fetch };
}

export default useFetch;
