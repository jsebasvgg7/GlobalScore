import { useState, useEffect } from 'react';

/**
 * useMediaQuery
 * Returns true while the given CSS media query matches.
 * 
 * @param {string} query — e.g. '(max-width: 768px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(
        () => window.matchMedia(query).matches
    );

    useEffect(() => {
        const mq = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);

        // Modern browsers
        if (mq.addEventListener) {
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
        // Safari < 14 fallback
        mq.addListener(handler);
        return () => mq.removeListener(handler);
    }, [query]);

    return matches;
}
