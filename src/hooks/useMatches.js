import { useEffect, useState } from "react";
import API from "../api/api";

export default function useMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = async () => {
    setLoading(true);
    const res = await API.get("/matches");
    setMatches(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadMatches();
  }, []);

  return { matches, loading, reload: loadMatches };
}
