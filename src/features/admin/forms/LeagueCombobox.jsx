import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getLeagueOptions } from '@/shared/utils/logoHelper.js';

const MAX_RECENT = 8;
const recentLeagues = [];

const normalize = (text) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const rememberLeague = (name) => {
    const clean = (name || '').trim();
    if (!clean) return;
    const known = getLeagueOptions().find(o => normalize(o) === normalize(clean));
    const label = known || clean;
    const index = recentLeagues.findIndex(l => normalize(l) === normalize(label));
    if (index !== -1) recentLeagues.splice(index, 1);
    recentLeagues.unshift(label);
    recentLeagues.splice(MAX_RECENT);
};

export default function LeagueCombobox({ name, value, onChange, placeholder, styles: s }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const listRef = useRef(null);
    const listId = useId();
    const options = useMemo(() => getLeagueOptions(), []);

    const items = useMemo(() => {
        const query = normalize(value);
        const recentKeys = new Set(recentLeagues.map(normalize));
        const pool = [
            ...recentLeagues,
            ...options.filter(o => !recentKeys.has(normalize(o))),
        ];
        const matches = pool
            .filter(o => normalize(o).includes(query))
            .map(label => ({ label, recent: recentKeys.has(normalize(label)) }));
        const exact = pool.some(o => normalize(o) === query);
        if (query && !exact) matches.push({ label: value.trim(), custom: true });
        return matches;
    }, [value, options, open]);

    useEffect(() => {
        if (!open) return;
        listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
    }, [active, open]);

    const pick = (item) => {
        onChange({ target: { name, value: item.label, type: 'text' } });
        setOpen(false);
    };

    const handleInput = (e) => {
        onChange(e);
        setActive(0);
        setOpen(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) { setOpen(true); return; }
            setActive(i => Math.min(i + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            if (open && items[active]) {
                e.preventDefault();
                pick(items[active]);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div className={s.comboWrap}>
            <input
                className={s.input}
                name={name}
                value={value}
                placeholder={placeholder}
                autoComplete="off"
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={open && items[active] ? `${listId}-${active}` : undefined}
                onChange={handleInput}
                onFocus={() => { setActive(0); setOpen(true); }}
                onClick={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={handleKeyDown}
            />
            {open && items.length > 0 && (
                <ul id={listId} className={s.comboList} role="listbox" ref={listRef}>
                    {items.map((item, i) => (
                        <li
                            key={item.custom ? '__custom' : item.label}
                            id={`${listId}-${i}`}
                            role="option"
                            aria-selected={i === active}
                            className={`${s.comboOption} ${i === active ? s.comboOptionActive : ''}`}
                            onMouseDown={(e) => { e.preventDefault(); pick(item); }}
                            onMouseEnter={() => setActive(i)}
                        >
                            {item.custom
                                ? <span className={s.comboCustom}>Usar «{item.label}»</span>
                                : <span>{item.label}</span>}
                            {item.recent && <span className={s.comboTag}>reciente</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
