import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useRanking(filter = "global") {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, [filter]);

  const loadRanking = async () => {
    setLoading(true);

    let query = supabase.from("profiles").select("*");

    if (filter === "monthly") {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      query = supabase
        .rpc("ranking_mensual", { mes: month, ano: year }); // Necesita función SQL
    }

    const { data, error } = await query.order("points", { ascending: false });

    if (!error) setRanking(data || []);
    setLoading(false);
  };

  return { ranking, loading };
}
