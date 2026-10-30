import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from '../services/supabase/client';

let state = { show: true };
const listeners = new Set();

export const setProbabilityStore = (show) => {
  state = { show };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state.show;

export const useShowProbabilities = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const useProbabilityToggle = (currentUser) => {
  const show = useShowProbabilities();
  const userId = currentUser?.id;

  useEffect(() => {
    if (!userId) return;
    let active = true;

    supabase
      .from('user_preferences')
      .select('show_probabilities')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active || error) return;
        if (typeof data?.show_probabilities === 'boolean') {
          setProbabilityStore(data.show_probabilities);
        }
      });

    return () => { active = false; };
  }, [userId]);

  const toggle = async () => {
    if (!userId) return;
    const previous = state.show;
    const next = !previous;
    setProbabilityStore(next);

    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        { user_id: userId, show_probabilities: next, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Error saving show_probabilities:', error);
      setProbabilityStore(previous);
    }
  };

  return { show, toggle };
};
