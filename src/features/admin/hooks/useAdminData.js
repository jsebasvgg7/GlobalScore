// src/features/admin/hooks/useAdminData.js
import { useState, useEffect } from 'react';
import { loadAllAdminData } from '../services/admin.service';

export const useAdminData = () => {
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [awards, setAwards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [titles, setTitles] = useState([]);
  const [users, setUsers] = useState([]);
  const [crownHistory, setCrownHistory] = useState([]);
  const [banners, setBanners] = useState([]);
  const [globalUsers, setGlobalUsers] = useState([]);
  const [trophyHistory, setTrophyHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadAllAdminData();
      setMatches(data.matches);
      setLeagues(data.leagues);
      setAwards(data.awards);
      setAchievements(data.achievements);
      setTitles(data.titles);
      setUsers(data.users);
      setCrownHistory(data.crownHistory);
      setBanners(data.banners);
      setGlobalUsers(data.globalUsers);
      setTrophyHistory(data.trophyHistory);
    } catch (err) {
      console.error('Error loading data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    matches,
    leagues,
    awards,
    achievements,
    titles,
    users,
    crownHistory,
    banners,
    globalUsers,
    trophyHistory,
    loading,
    loadData,
  };
};