import axios from "axios";

const Playlists = ({ playlists, setFocusedPlaylist }) => {
  const fetchTrackFeatures = async (id) => {
    const { data } = await axios.get(`/api/playlists/${id}`);
    const items = data.items;
    const features = await Promise.all(
      items.map((item) => axios.get(`/api/features/${item.track.id}`))
    );

    const transformedFeatures = features.map(({ data }) => {
      const trackItem = items.find((item) => data.id === item.track.id);
      return {
        metadata: trackItem?.track,
        features: {
          acousticness: data.acousticness,
          danceability: data.danceability,
          energy: data.energy,
          instrumentalness: data.instrumentalness,
          key: data.key,
          liveness: data.liveness,
          loudness: data.loudness,
          mode: data.mode,
          speechiness: data.speechiness,
          tempo: data.tempo,
          time_signature: data.time_signature,
          valence: data.valence,
        },
      };
    });

    setFocusedPlaylist(transformedFeatures);
  };

  return (
    <div className="flex flex-col w-64">
      {playlists?.items &&
        playlists.items.map((playlist) => {
          return (
            <div
              onClick={() => fetchTrackFeatures(playlist.id)}
              key={playlist.id}
              className="cursor-pointer"
            >
              {playlist.name}
            </div>
          );
        })}
    </div>
  );
};

export default Playlists;
