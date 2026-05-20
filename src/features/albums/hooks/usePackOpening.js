import { useState, useCallback } from 'react';
import { openPack } from '../services/albums.service';

export function usePackOpening({ onPackOpened } = {}) {
    const [isOpening, setIsOpening] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [phase, setPhase] = useState('idle');
    const open = useCallback(async (userId) => {
        if (isOpening) return;
        setIsOpening(true);
        setError(null);
        setPhase('animating');

        try {
            const cards = await openPack(userId);
            setResult(cards);
            setPhase('revealing');
            onPackOpened?.();
        } catch (err) {
            setError(err);
            setPhase('idle');
        } finally {
            setIsOpening(false);
        }
    }, [isOpening, onPackOpened]);

    const reset = useCallback(() => {
        setResult(null);
        setPhase('idle');
        setError(null);
    }, []);

    const playerStars = result?.player?.significance_level ?? null;
    const isGoat = playerStars === 5;
    const isLegend = playerStars === 4;

    return {
        open,
        reset,
        isOpening,
        result,
        error,
        phase,
        isGoat,
        isLegend,
        setPhase,
    };
}