import { useState, useEffect } from "react";
import API from "../api/api";

export default function useAwards() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAwards = async () => {
    setLoading(true);
    const res = await API.get("/awards");
    setAwards(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadAwards();
  }, []);

  return { awards, loading, reload: loadAwards };
}
