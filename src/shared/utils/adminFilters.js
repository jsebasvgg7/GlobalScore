export const NO_LEAGUE = '__none__';

export const MATCH_SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'league-asc', label: 'Liga A → Z' },
  { value: 'league-desc', label: 'Liga Z → A' },
];

const compareText = (a, b) =>
  a.localeCompare(b, 'es', { sensitivity: 'base' });

const matchStamp = (m) => `${m.date || ''}T${m.time || '00:00'}`;

const compareRecent = (a, b) => matchStamp(b).localeCompare(matchStamp(a));

export const getMatchLeagueOptions = (matches) => {
  const counts = new Map();
  let withoutLeague = 0;
  (matches || []).forEach((m) => {
    const name = m.league?.trim();
    if (!name) { withoutLeague += 1; return; }
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  const options = [...counts.entries()]
    .map(([label, count]) => ({ value: label, label, count }))
    .sort((a, b) => compareText(a.label, b.label));
  if (withoutLeague) {
    options.push({ value: NO_LEAGUE, label: 'Sin liga', count: withoutLeague });
  }
  return options;
};

const sortMatches = (list, sortBy) => {
  const sorted = [...list];
  const byLeague = (dir) => (a, b) => {
    const la = a.league?.trim() || '';
    const lb = b.league?.trim() || '';
    if (!la && lb) return 1;
    if (la && !lb) return -1;
    return compareText(la, lb) * dir || compareRecent(a, b);
  };
  switch (sortBy) {
    case 'oldest': return sorted.sort((a, b) => -compareRecent(a, b));
    case 'league-asc': return sorted.sort(byLeague(1));
    case 'league-desc': return sorted.sort(byLeague(-1));
    default: return sorted.sort(compareRecent);
  }
};

export const getFilteredItems = (activeSection, searchTerm, filterStatus, data, matchOptions = {}) => {
  const { league: leagueFilter = 'all', sortBy = 'recent' } = matchOptions;
  const { matches, leagues, awards, achievements, titles, users, crownHistory, banners, globalUsers, trophyHistory, bots } = data;
  const term = searchTerm.toLowerCase();

  switch (activeSection) {
    case 'matches': {
      const visible = (matches || []).filter(m => {
        const matchesSearch = !term ||
          m.home_team?.toLowerCase().includes(term) ||
          m.away_team?.toLowerCase().includes(term) ||
          m.league?.toLowerCase().includes(term);
        const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
        const matchesLeague = leagueFilter === 'all' ||
          (leagueFilter === NO_LEAGUE ? !m.league?.trim() : m.league?.trim() === leagueFilter);
        return matchesSearch && matchesStatus && matchesLeague;
      });
      return sortMatches(visible, sortBy);
    }

    case 'leagues':
      return (leagues || []).filter(l => {
        const matchesSearch = !term || l.name?.toLowerCase().includes(term);
        const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
        return matchesSearch && matchesStatus;
      });

    case 'awards':
      return (awards || []).filter(a => {
        const matchesSearch = !term || a.name?.toLowerCase().includes(term);
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchesSearch && matchesStatus;
      });

    case 'achievements':
      return (achievements || []).filter(a =>
        !term || a.name?.toLowerCase().includes(term)
      );

    case 'titles':
      return (titles || []).filter(t =>
        !term || t.name?.toLowerCase().includes(term)
      );

    case 'crowns': {
      const filteredTop10 = (users || []).filter(u =>
        !term || u.name?.toLowerCase().includes(term)
      );
      const filteredHistory = (crownHistory || []).filter(h =>
        !term || h.users?.name?.toLowerCase().includes(term)
      );
      return { top10: filteredTop10, history: filteredHistory };
    }

    case 'trophies': {
      const filteredTop10 = (globalUsers || []).filter(u =>
        !term || u.name?.toLowerCase().includes(term)
      );
      const filteredHistory = (trophyHistory || []).filter(h =>
        !term || h.users?.name?.toLowerCase().includes(term)
      );
      return { top10: filteredTop10, history: filteredHistory };
    }

    case 'banners':
      return (banners || []).filter(b =>
        !term || b.name?.toLowerCase().includes(term)
      );

    case 'bots':
      return (bots || []).filter(b =>
        !term || b.name?.toLowerCase().includes(term)
      );

    default:
      return [];
  }
};

export const calculateStats = (data) => {
  const { matches, leagues, awards, achievements, titles, crownHistory, banners, trophyHistory, bots } = data;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const crownsThisMonth = (crownHistory || []).filter(h => {
    const month = h.awarded_at?.slice(0, 7);
    return month === currentMonth;
  }).length;

  return {
    matches: {
      total: (matches || []).length,
      pending: (matches || []).filter(m => m.status === 'pending').length,
      finished: (matches || []).filter(m => m.status === 'finished').length,
    },
    leagues: {
      total: (leagues || []).length,
      active: (leagues || []).filter(l => l.status === 'active').length,
      finished: (leagues || []).filter(l => l.status === 'finished').length,
    },
    awards: {
      total: (awards || []).length,
      active: (awards || []).filter(a => a.status === 'active').length,
      finished: (awards || []).filter(a => a.status === 'finished').length,
    },
    achievements: {
      total: (achievements || []).length,
    },
    titles: {
      total: (titles || []).length,
    },
    crowns: {
      total: (crownHistory || []).length,
      thisMonth: crownsThisMonth,
    },
    trophies: {
      total: (trophyHistory || []).length,   // ← NUEVO
    },
    banners: {
      total: (banners || []).length,
    },
    bots: {
      total: (bots || []).length,
    },
  };
};