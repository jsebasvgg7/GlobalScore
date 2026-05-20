import { useState, useEffect, useCallback } from 'react';
import { getUserPacks } from '../services/albums.service';

export function useAlbumPacks(userId) {
    const [packs, setPacks] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPacks = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await getUserPacks(userId);
            setPacks(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPacks();
    }, [fetchPacks]);

    const barPercent = packs
        ? (packs.total_packs_opened % 10) * 10
        : 0;

    return {
        packs,
        loading,
        error,
        barPercent,
        packsAvailable: packs?.packs_available ?? 0,
        boostActive: packs?.boost_active ?? false,
        boostPacksRemaining: packs?.boost_packs_remaining ?? 0,
        refresh: fetchPacks,
    };
}