import { useState, useEffect } from "react";
import API from "../api/api";

export default function useRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRanking = async () => {
    setLoading(true);
    const res = await API.get("/ranking");
    setRanking(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadRanking();
  }, []);

  return { ranking, loading, reload: loadRanking };
}
