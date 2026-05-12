import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/shared/services/supabase/client';

// ── Constantes de cifrado ────────────────────────────────────────
const SALT = 'GlobalScore_Notes_v1';
const ITERATIONS = 100_000;
const KEY_LEN = 256;

// ── Derivar clave AES desde el authId del usuario ────────────────
async function deriveKey(authId) {
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
async function encrypt(text, key) {
  if (!text) return '';
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const buf = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, enc.encode(text));

  // Guardar IV + ciphertext como base64 separados por '.'
  const toB64 = (arr) => btoa(String.fromCharCode(...new Uint8Array(arr)));
  return `${toB64(iv)}.${toB64(buf)}`;
}

// ── Descifrar texto ──────────────────────────────────────────────
async function decrypt(cipher, key) {
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

// ════════════════════════════════════════════════════════════════
//  HOOK PRINCIPAL
// ════════════════════════════════════════════════════════════════
export function useNotes(currentUser) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const keyRef = useRef(null);           // clave AES en memoria, no en estado

  // ── Inicializar clave al montar ──────────────────────────────
  useEffect(() => {
    if (!currentUser?.auth_id) return;
    (async () => {
      keyRef.current = await deriveKey(currentUser.auth_id);
      await loadNotes();
    })();
  }, [currentUser?.auth_id]);            // eslint-disable-line

  // ── Cargar y descifrar notas ─────────────────────────────────
  const loadNotes = useCallback(async () => {
    if (!currentUser?.id || !keyRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (err) throw err;

      // Descifrar en paralelo
      const decrypted = await Promise.all(
        (data || []).map(async (n) => ({
          ...n,
          title: await decrypt(n.title_enc, keyRef.current),
          content: await decrypt(n.content_enc, keyRef.current),
        }))
      );
      setNotes(decrypted);
    } catch (e) {
      setError('Error al cargar notas');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // ── Crear nota ───────────────────────────────────────────────
  const createNote = useCallback(async ({ title = '', content = '', color = 'purple' }) => {
    if (!currentUser?.id || !keyRef.current) return null;
    setSaving(true);
    try {
      const [title_enc, content_enc] = await Promise.all([
        encrypt(title, keyRef.current),
        encrypt(content, keyRef.current),
      ]);
      const { data, error: err } = await supabase
        .from('notes')
        .insert({ user_id: currentUser.id, title_enc, content_enc, color })
        .select()
        .single();
      if (err) throw err;

      const newNote = { ...data, title, content };
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    } catch (e) {
      setError('Error al crear nota');
      console.error(e);
      return null;
    } finally {
      setSaving(false);
    }
  }, [currentUser?.id]);

  // ── Actualizar nota ──────────────────────────────────────────
  const updateNote = useCallback(async (id, { title, content, color, is_pinned }) => {
    if (!keyRef.current) return false;
    setSaving(true);
    try {
      const updates = {};
      if (title !== undefined) updates.title_enc = await encrypt(title, keyRef.current);
      if (content !== undefined) updates.content_enc = await encrypt(content, keyRef.current);
      if (color !== undefined) updates.color = color;
      if (is_pinned !== undefined) updates.is_pinned = is_pinned;

      const { error: err } = await supabase.from('notes').update(updates).eq('id', id);
      if (err) throw err;

      setNotes((prev) =>
        prev.map((n) => n.id === id ? { ...n, title: title ?? n.title, content: content ?? n.content, ...updates } : n)
          .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned))
      );
      return true;
    } catch (e) {
      setError('Error al actualizar nota');
      console.error(e);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Eliminar nota ────────────────────────────────────────────
  const deleteNote = useCallback(async (id) => {
    try {
      const { error: err } = await supabase.from('notes').delete().eq('id', id);
      if (err) throw err;
      setNotes((prev) => prev.filter((n) => n.id !== id));
      return true;
    } catch (e) {
      setError('Error al eliminar nota');
      console.error(e);
      return false;
    }
  }, []);

  // ── Toggle pin ───────────────────────────────────────────────
  const togglePin = useCallback(async (id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    await updateNote(id, { is_pinned: !note.is_pinned });
  }, [notes, updateNote]);

  return {
    notes,
    loading,
    saving,
    error,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  };
}