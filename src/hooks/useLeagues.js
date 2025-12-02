import { useState, useEffect } from "react";
import API from "../api/api";

export default function useLeagues() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeagues = async () => {
    setLoading(true);
    const res = await API.get("/leagues");
    setLeagues(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadLeagues();
  }, []);

  return { leagues, loading, reload: loadLeagues };
}
