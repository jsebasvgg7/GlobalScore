import { supabase } from '@/shared/services/supabase/client';

// ── Drop rates por significance_level ──────────────────────────────────────
const PLAYER_DROP_RATES_BASE = [
    { level: 5, weight: 0.5 },
    { level: 4, weight: 7.5 },
    { level: 3, weight: 12 },
    { level: 2, weight: 25 },
    { level: 1, weight: 55 },
];

const PLAYER_DROP_RATES_BOOST = [
    { level: 5, weight: 1.2 },
    { level: 4, weight: 14.5 },
    { level: 3, weight: 19 },
    { level: 2, weight: 25 },
    { level: 1, weight: 40.3 },
];

const LEG_REQUIREMENTS = {
    legendary_1: {
        slots: 30,
        req: [{ minStars: 4, count: 5 }],
    },
    legendary_2: {
        slots: 30,
        req: [
            { minStars: 3, count: 5 },
            { minStars: 4, count: 5 },
        ],
    },
    legendary_3: {
        slots: 30,
        req: [
            { minStars: 2, count: 5 },
            { minStars: 3, count: 5 },
            { minStars: 4, count: 5 },
        ],
    },
    legendary_4: {
        slots: 30,
        req: [
            { minStars: 2, count: 5 },
            { minStars: 3, count: 5 },
            { minStars: 4, count: 5 },
            { minStars: 5, count: 1 },
        ],
    },
    legendary_5: {
        slots: 30,
        req: [
            { minStars: 2, count: 5 },
            { minStars: 3, count: 5 },
            { minStars: 4, count: 5 },
            { minStars: 5, count: 5 },
        ],
    },
};

const LEG_ORDER = ['legendary_1', 'legendary_2', 'legendary_3', 'legendary_4', 'legendary_5'];

// ── Cartas ─────────────────────────────────────────────────────────────────

export async function getAlbumCards() {
    const { data, error } = await supabase
        .from('album_cards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getAlbumCardsByType(cardType) {
    const { data, error } = await supabase
        .from('album_cards')
        .select('*')
        .eq('card_type', cardType)
        .eq('is_active', true)
        // ── NUEVO: excluir cartas únicas del pool de drops ──────────────
        .eq('drop_enabled', true);

    if (error) throw error;
    return data;
}

// ── NUEVO: obtener todas las cartas especiales (para el álbum Edición Única) ──
// Todos los usuarios pueden ver qué cartas especiales existen.
// El frontend decide si mostrar el slot lleno o con candado según si el
// usuario tiene esa carta en su colección.
export async function getSpecialCards() {
    const { data, error } = await supabase
        .from('album_cards')
        .select('*')
        .eq('is_special', true)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data ?? [];
}

// ── NUEVO: entregar carta única directamente a un usuario (uso desde Admin) ──
// El trigger SQL ya lo hace automáticamente al publicar.
// Esta función es el fallback manual para el Admin si necesita re-entregar.
export async function deliverSpecialCard(cardId, userId) {
    // Verificar que la carta existe y es especial
    const { data: card, error: cardError } = await supabase
        .from('album_cards')
        .select('id, is_special, drop_enabled')
        .eq('id', cardId)
        .eq('is_special', true)
        .single();

    if (cardError || !card) throw new Error('Carta especial no encontrada');
    if (card.drop_enabled) throw new Error('Esta carta tiene drop_enabled=true — no es una carta única');

    const { error } = await supabase.from('album_collection').upsert(
        {
            user_id: userId,
            card_id: cardId,
            copies: 1,
            frame_level: 'legendary',
            first_obtained_at: new Date().toISOString(),
            last_obtained_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,card_id' }
    );

    if (error) throw error;
    return { success: true };
}

// ── Sobres ─────────────────────────────────────────────────────────────────

export async function getUserPacks(userId) {
    const { data, error } = await supabase
        .from('album_packs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function initUserPacks(userId) {
    const { data, error } = await supabase
        .from('album_packs')
        .upsert({ user_id: userId }, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ── Apertura de sobre ──────────────────────────────────────────────────────
// getAlbumCardsByType ya filtra drop_enabled = true, así que las cartas
// especiales nunca pueden aparecer en sobres. No hay cambio adicional aquí.

function rollPlayerByRarity(playerCards, boosted = false) {
    const rates = boosted ? PLAYER_DROP_RATES_BOOST : PLAYER_DROP_RATES_BASE;
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const { level, weight } of rates) {
        cumulative += weight;
        if (rand <= cumulative) {
            const pool = playerCards.filter((c) => c.significance_level === level);
            if (pool.length > 0) {
                return pool[Math.floor(Math.random() * pool.length)];
            }
        }
    }

    const fallback = playerCards.filter((c) => c.significance_level === 1);
    return fallback[Math.floor(Math.random() * fallback.length)] ?? null;
}

function rollRandom(cards) {
    if (!cards || cards.length === 0) return null;
    return cards[Math.floor(Math.random() * cards.length)];
}

export async function openPack(userId) {
    const packs = await getUserPacks(userId);
    if (!packs || packs.packs_available < 1) {
        throw new Error('No hay sobres disponibles');
    }

    // getAlbumCardsByType ya excluye drop_enabled = false (cartas únicas)
    const [players, teams, competitions, events] = await Promise.all([
        getAlbumCardsByType('player'),
        getAlbumCardsByType('team'),
        getAlbumCardsByType('competition'),
        getAlbumCardsByType('event'),
    ]);

    const boosted = packs.boost_active === true;
    const drawnPlayer = rollPlayerByRarity(players, boosted);
    const drawnTeam = rollRandom(teams);
    const drawnCompetition = rollRandom(competitions);
    const drawnEvent = rollRandom(events);
    const drawn = [drawnPlayer, drawnTeam, drawnCompetition, drawnEvent].filter(Boolean);

    const newTotalOpened = packs.total_packs_opened + 1;
    const boostTriggered = packs.total_packs_opened > 0 && newTotalOpened % 10 === 0;

    let newBoostActive = boosted;
    let newBoostRemaining = packs.boost_packs_remaining ?? 0;

    if (boostTriggered) {
        newBoostActive = true;
        newBoostRemaining = 3;
    } else if (boosted) {
        newBoostRemaining = newBoostRemaining - 1;
        if (newBoostRemaining <= 0) {
            newBoostActive = false;
            newBoostRemaining = 0;
        }
    }

    const { error: packError } = await supabase
        .from('album_packs')
        .update({
            packs_available: packs.packs_available - 1,
            total_packs_opened: newTotalOpened,
            total_packs_earned: packs.total_packs_earned,
            boost_active: newBoostActive,
            boost_packs_remaining: newBoostRemaining,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    if (packError) throw packError;

    for (const card of drawn) {
        await upsertCollectionCard(userId, card.id);
    }

    const { error: historyError } = await supabase.from('album_pack_history').insert({
        user_id: userId,
        card_player_id: drawnPlayer?.id ?? null,
        card_team_id: drawnTeam?.id ?? null,
        card_competition_id: drawnCompetition?.id ?? null,
        card_event_id: drawnEvent?.id ?? null,
        player_significance: drawnPlayer?.significance_level ?? null,
    });

    if (historyError) throw historyError;

    return {
        player: drawnPlayer,
        team: drawnTeam,
        competition: drawnCompetition,
        event: drawnEvent,
        boosted,
        boostTriggered,
    };
}

// ── Colección ──────────────────────────────────────────────────────────────

export async function getUserCollection(userId) {
    const { data, error } = await supabase
        .from('album_collection')
        .select(`
      *,
      card:card_id (*)
    `)
        .eq('user_id', userId);

    if (error) throw error;
    return data;
}

export async function upsertCollectionCard(userId, cardId) {
    const { data: existing } = await supabase
        .from('album_collection')
        .select('id, copies')
        .eq('user_id', userId)
        .eq('card_id', cardId)
        .maybeSingle();

    if (existing) {
        const newCopies = existing.copies + 1;
        const frameLevel = getFrameLevel(newCopies);

        const { error } = await supabase
            .from('album_collection')
            .update({
                copies: newCopies,
                frame_level: frameLevel,
                last_obtained_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

        if (error) throw error;
        return { isNew: false, copies: newCopies, frameLevel };
    }

    const { error } = await supabase.from('album_collection').insert({
        user_id: userId,
        card_id: cardId,
        copies: 1,
        frame_level: 'normal',
    });

    if (error) throw error;
    return { isNew: true, copies: 1, frameLevel: 'normal' };
}

export function getFrameLevel(copies) {
    if (copies >= 10) return 'legendary';
    if (copies >= 5) return 'gold';
    if (copies >= 3) return 'silver';
    return 'normal';
}

// ── Progreso de álbumes ────────────────────────────────────────────────────

export async function getAlbumDefinitions() {
    const { data, error } = await supabase
        .from('album_definitions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getUserAlbumProgress(userId) {
    const { data, error } = await supabase
        .from('album_progress')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data ?? [];
}

function assignLegendarySlots(albumId, playerCollection, usedGlobalIds) {
    const legDef = LEG_REQUIREMENTS[albumId];
    if (!legDef) return { usedIds: new Set(), uniquePlayers: 0, meetsAllReqs: false };

    const available = playerCollection.filter(
        (c) => !usedGlobalIds.has(c.card_id ?? c.id)
    );

    const sorted = [...available].sort(
        (a, b) => (b.card?.significance_level ?? 0) - (a.card?.significance_level ?? 0)
    );

    const assignedIds = new Set();
    let meetsAllReqs = true;
    const reqsSorted = [...legDef.req].sort((a, b) => b.minStars - a.minStars);

    for (const { minStars, count } of reqsSorted) {
        const candidates = sorted.filter(
            (c) =>
                (c.card?.significance_level ?? 0) >= minStars &&
                !assignedIds.has(c.card_id ?? c.id)
        );

        let filled = 0;
        for (const candidate of candidates) {
            if (filled >= count) break;
            assignedIds.add(candidate.card_id ?? candidate.id);
            filled++;
        }

        if (filled < count) meetsAllReqs = false;
    }

    const reqTotal = legDef.req.reduce((s, r) => s + r.count, 0);
    const generalNeeded = legDef.slots - reqTotal;
    const remaining = [...available]
        .filter((c) => !assignedIds.has(c.card_id ?? c.id))
        .sort((a, b) => (a.card?.significance_level ?? 0) - (b.card?.significance_level ?? 0));
    let generalFilled = 0;
    for (const c of remaining) {
        if (generalFilled >= generalNeeded) break;
        assignedIds.add(c.card_id ?? c.id);
        generalFilled++;
    }

    const uniquePlayers = assignedIds.size;
    const meetsPlayers = uniquePlayers >= legDef.slots;

    return {
        usedIds: assignedIds,
        uniquePlayers,
        meetsAllReqs: meetsAllReqs && meetsPlayers,
    };
}

// ── computeAndSyncAlbumProgress ───────────────────────────────────────────
export async function computeAndSyncAlbumProgress(userId) {
    const [collection, definitions, specialCards] = await Promise.all([
        getUserCollection(userId),
        getAlbumDefinitions(),
        getSpecialCards(),
    ]);

    const updates = [];

    // ── Cartas especiales: filtrar las que el usuario posee ────────────────
    const ownedSpecialCardIds = new Set(
        collection
            .filter((c) => c.card?.is_special === true)
            .map((c) => c.card_id)
    );

    // ── Álbumes legendarios ────────────────────────────────────────────────
    // Excluir cartas especiales del cómputo de álbumes legendarios/estrellas
    const playerCollection = collection.filter(
        (c) => c.card?.card_type === 'player' && !c.card?.is_special
    );

    const globalUsedIds = new Set();

    for (const albumId of LEG_ORDER) {
        const album = definitions.find((d) => d.id === albumId);
        if (!album) continue;

        const { usedIds, uniquePlayers, meetsAllReqs } = assignLegendarySlots(
            albumId,
            playerCollection,
            globalUsedIds
        );

        usedIds.forEach((id) => globalUsedIds.add(id));

        updates.push({
            album_id: albumId,
            unique_cards: uniquePlayers,
            is_completed: meetsAllReqs,
        });
    }

    // ── Álbumes no-legendarios (stars, cult) ───────────────────────────────
    for (const album of definitions) {
        if (LEG_ORDER.includes(album.id)) continue;

        // ── NUEVO: álbum especial ──────────────────────────────────────────
        if (album.id === 'special_unique') {
            // unique_cards = cuántas cartas especiales posee este usuario
            const ownedCount = ownedSpecialCardIds.size;
            // is_completed = posee TODAS las especiales existentes
            const isCompleted = specialCards.length > 0 && ownedCount >= specialCards.length;

            updates.push({
                album_id: album.id,
                unique_cards: ownedCount,
                is_completed: isCompleted,
            });
            continue;
        }

        let uniqueCards = 0;

        if (album.album_type === 'stars') {
            uniqueCards = collection.filter(
                (c) =>
                    c.card?.card_type === 'player' &&
                    c.card?.significance_level === album.star_filter &&
                    !c.card?.is_special   // excluir especiales de álbumes de estrellas
            ).length;
        } else if (album.album_type === 'cult') {
            uniqueCards = collection.filter(
                (c) => c.card?.card_type === album.required_card_type
            ).length;
        }

        updates.push({ album_id: album.id, unique_cards: uniqueCards, is_completed: false });
    }

    // ── Upsert progreso en Supabase ────────────────────────────────────────
    for (const update of updates) {
        const { error } = await supabase.from('album_progress').upsert(
            {
                user_id: userId,
                album_id: update.album_id,
                unique_cards: update.unique_cards,
                is_completed: update.is_completed ?? false,
                completed_at: update.is_completed ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,album_id' }
        );

        if (error) throw error;
    }

    return updates;
}

// ── Datos del álbum Edición Única para renderizado ─────────────────

export async function getSpecialAlbumData(userId) {
    const [specialCards, collection] = await Promise.all([
        getSpecialCards(),
        getUserCollection(userId),
    ]);

    // Usamos los IDs que ya sabemos que son especiales
    const specialCardIds = new Set(specialCards.map((c) => c.id));

    const ownedMap = new Map(
        collection
            .filter((c) => specialCardIds.has(c.card_id))
            .map((c) => [c.card_id, c])
    );

    return specialCards.map((card) => ({
        ...card,
        owned: ownedMap.has(card.id),
        displayName: ownedMap.has(card.id) ? card.name : '???',
        displayImage: ownedMap.has(card.id) ? card.image_path : null,
    }));
}

// ── Ranking — progreso legendarios ────────────────────────────────────────

export async function getAllUsersLegendaryProgress() {
    const { data, error } = await supabase
        .from('album_progress')
        .select('user_id, album_id, is_completed')
        .in('album_id', LEG_ORDER)
        .eq('is_completed', true);

    if (error) throw error;
    return data ?? [];
}

export async function getUserLegendaryCount(userId) {
    const { data, error } = await supabase
        .from('album_progress')
        .select('album_id')
        .eq('user_id', userId)
        .in('album_id', LEG_ORDER)
        .eq('is_completed', true);

    if (error) throw error;
    return (data ?? []).length;
}

// ── Historial de sobres ────────────────────────────────────────────────────

export async function getUserPackHistory(userId, limit = 20) {
    const { data, error } = await supabase
        .from('album_pack_history')
        .select(`
      *,
      player_card:card_player_id (*),
      team_card:card_team_id (*),
      competition_card:card_competition_id (*),
      event_card:card_event_id (*)
    `)
        .eq('user_id', userId)
        .order('opened_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data ?? [];
}

// ── Puntos y sobres ────────────────────────────────────────────────────────

export const awardPackToUser = async (userId) => {
    const { data: existing } = await supabase
        .from('album_packs')
        .select('id, packs_available, total_packs_earned')
        .eq('user_id', userId)
        .maybeSingle();

    if (existing) {
        const { error } = await supabase
            .from('album_packs')
            .update({
                packs_available: existing.packs_available + 1,
                total_packs_earned: existing.total_packs_earned + 1,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('album_packs')
            .insert({
                user_id: userId,
                packs_available: 1,
                total_packs_earned: 1,
            });
        if (error) throw error;
    }
};