import { useState, useEffect, useCallback } from 'react';
import { getAlbumCards } from '../services/albums.service';

export function useAlbumCards() {
    const [allCards, setAllCards] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCards = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAlbumCards();
            setAllCards(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    return { allCards, loading, refresh: fetchCards };
}