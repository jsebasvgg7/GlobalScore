import { useState, useEffect, useCallback } from 'react';
import { getUserCollection } from '../services/albums.service';

export function useAlbumCollection(userId) {
    const [collection, setCollection] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCollection = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await getUserCollection(userId);
            setCollection(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchCollection();
    }, [fetchCollection]);

    const byType = (type) =>
        collection.filter(item => item.card?.card_type === type);

    const byStars = (level) =>
        collection.filter(
            item =>
                item.card?.card_type === 'player' &&
                item.card?.significance_level === level
        );

    const hasCard = (cardId) => collection.some(item => item.card_id === cardId);

    const uniquePlayers = collection.filter(
        item => item.card?.card_type === 'player'
    );

    const stars4 = byStars(4);
    const stars5 = byStars(5);

    return {
        collection,
        loading,
        error,
        byType,
        byStars,
        hasCard,
        uniquePlayers,
        stars4Count: stars4.length,
        stars5Count: stars5.length,
        refresh: fetchCollection,
    };
}