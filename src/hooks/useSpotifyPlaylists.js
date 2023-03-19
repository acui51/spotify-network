import axios from "axios";
import { useEffect, useState } from "react";

export function useSpotifyPlaylists(session) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = async () => {
    const res = await axios.get("/api/playlists");
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    if (session) {
      fetchPlaylists();
    }
  }, [session]);

  return { data, loading };
}
