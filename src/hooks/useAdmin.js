import { useState } from "react";
import API from "../api/api";

export default function useAdmin() {
  const [loading, setLoading] = useState(false);

  const createLeague = async (data) => {
    setLoading(true);
    await API.post("/admin/league", data);
    setLoading(false);
  };

  const createAward = async (data) => {
    setLoading(true);
    await API.post("/admin/award", data);
    setLoading(false);
  };

  return {
    loading,
    createLeague,
    createAward
  };
}
