import { useState, useEffect } from 'react';
import { getAlbumDefinitions } from '../services/albums.service';

export function useAlbumDefinitions() {
    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function fetch() {
            try {
                const data = await getAlbumDefinitions();
                if (!cancelled) setDefinitions(data);
            } catch (err) {
                if (!cancelled) setError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetch();
        return () => { cancelled = true; };
    }, []);

    const legendary = definitions.filter(d => d.album_type === 'legendary');
    const stars = definitions.filter(d => d.album_type === 'stars');
    const cult = definitions.filter(d => d.album_type === 'cult');

    return { definitions, legendary, stars, cult, loading, error };
}