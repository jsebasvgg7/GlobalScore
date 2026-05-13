import { useState, useEffect, useCallback, useRef } from 'react';
import {
  deriveKey,
  encrypt,
  decrypt,
  fetchNotes,
  createNoteRecord,
  updateNoteRecord,
  deleteNoteRecord,
} from '../services/notes.service';

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
      const data = await fetchNotes(currentUser.id);

      // Descifrar en paralelo
      const decrypted = await Promise.all(
        data.map(async (n) => ({
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
      const data = await createNoteRecord({ user_id: currentUser.id, title_enc, content_enc, color });

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

      await updateNoteRecord(id, updates);

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
      await deleteNoteRecord(id);
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