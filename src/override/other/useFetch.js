import React, {useState, useEffect} from "react";
import {debounce} from "./debounce";

const preventFetchTooMuchOnDEV = false // TODO: remove this at end of dev

export const useFetch = (url, options) => {
    const [response, setResponse] = useState(null)
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const shouldFetch = options ? options.shouldFetch : true;
    const shouldDebounce = options ? options.shouldDebounce : false;
    const debounceTime = options ? options.debounceTime : 200;

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const doFetch = async () => {
            setLoading(true);
            try {
                const res = await fetch(url, options);
                const json = await res.json();
                if (!signal.aborted) {
                    setResponse(json);
                }
            } catch (e) {
                if (!signal.aborted) {
                    setError(e);
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };
        let exec = doFetch

        if (shouldFetch && !(preventFetchTooMuchOnDEV && !!response)) {
            if (shouldDebounce) {
                exec = debounce(doFetch, debounceTime)
            }
            exec()
        }

        return () => {
            abortController.abort();
        };
    }, [url, shouldFetch]);

    return {response, error, loading};
};
