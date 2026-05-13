import { supabase } from '@/shared/services/supabase/client';

// ── Constantes de cifrado ────────────────────────────────────────
const SALT = 'GlobalScore_Notes_v1';
const ITERATIONS = 100_000;
const KEY_LEN = 256;

// ── Derivar clave AES desde el authId del usuario ────────────────
export async function deriveKey(authId) {
    const enc = new TextEncoder();
    const keyMat = await crypto.subtle.importKey(
        'raw', enc.encode(authId), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: enc.encode(SALT), iterations: ITERATIONS, hash: 'SHA-256' },
        keyMat,
        { name: 'AES-CBC', length: KEY_LEN },
        false,
        ['encrypt', 'decrypt']
    );
}

// ── Cifrar texto ─────────────────────────────────────────────────
export async function encrypt(text, key) {
    if (!text) return '';
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const buf = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, enc.encode(text));
    const toB64 = (arr) => btoa(String.fromCharCode(...new Uint8Array(arr)));
    return `${toB64(iv)}.${toB64(buf)}`;
}

// ── Descifrar texto ──────────────────────────────────────────────
export async function decrypt(cipher, key) {
    if (!cipher) return '';
    try {
        const [ivB64, dataB64] = cipher.split('.');
        const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const iv = fromB64(ivB64);
        const data = fromB64(dataB64);
        const buf = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, data);
        return new TextDecoder().decode(buf);
    } catch {
        return '[contenido ilegible]';
    }
}

// ── CRUD ─────────────────────────────────────────────────────────

export const fetchNotes = async (userId) => {
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const createNoteRecord = async (noteData) => {
    const { data, error } = await supabase
        .from('notes')
        .insert(noteData)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateNoteRecord = async (noteId, updates) => {
    const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', noteId);
    if (error) throw error;
};

export const deleteNoteRecord = async (noteId) => {
    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
    if (error) throw error;
};
