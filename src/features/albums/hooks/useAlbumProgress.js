import { useState, useEffect, useCallback } from 'react';
import { getUserAlbumProgress } from '../services/albums.service';
import { LEGENDARY_ALBUM_IDS } from '../types/albums.types';

export function useAlbumProgress(userId) {
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProgress = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await getUserAlbumProgress(userId);
            setProgress(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    const getAlbumProgress = (albumId) =>
        progress.find(p => p.album_id === albumId) ?? null;

    const legendaryCompleted = progress.filter(
        p => LEGENDARY_ALBUM_IDS.includes(p.album_id) && p.is_completed
    ).length;

    return {
        progress,
        loading,
        error,
        getAlbumProgress,
        legendaryCompleted,
        refresh: fetchProgress,
    };
}