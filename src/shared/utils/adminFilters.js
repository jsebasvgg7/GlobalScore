
export const getFilteredItems = (activeSection, searchTerm, filterStatus, data) => {
  const { matches, leagues, awards, achievements, titles, users, crownHistory, banners } = data;
  const term = searchTerm.toLowerCase();

  switch (activeSection) {
    case 'matches':
      return (matches || []).filter(m => {
        const matchesSearch = !term ||
          m.home_team?.toLowerCase().includes(term) ||
          m.away_team?.toLowerCase().includes(term) ||
          m.league?.toLowerCase().includes(term);
        const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
        return matchesSearch && matchesStatus;
      });

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

    case 'banners':
      return (banners || []).filter(b =>
        !term || b.name?.toLowerCase().includes(term)
      );

    default:
      return [];
  }
};

export const calculateStats = (data) => {
  const { matches, leagues, awards, achievements, titles, crownHistory, banners } = data;

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
    banners: {
      total: (banners || []).length,   // ← NUEVO
    },
  };
};