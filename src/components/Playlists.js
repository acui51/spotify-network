import axios from "axios";

const Playlists = ({
  setSelectedPlaylistName,
  playlists,
  setFocusedPlaylist,
}) => {
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
    <div className="flex flex-col w-72 px-3 h-screen overflow-y-scroll">
      <div className='text-xl pl-1 pb-1'> Playlists </div>
      {playlists?.items &&
        playlists.items.map((playlist) => {
          return (
            <div
              onClick={() => {
                fetchTrackFeatures(playlist.id);
                setSelectedPlaylistName(playlist.name);
              }}
              key={playlist.id}
              className="cursor-pointer"
            >
              <div className="bg-white bg-opacity-50 py-2 px-4 rounded">
                {" "}
                {playlist.name}{" "}
              </div>
              <div className="pt-2"></div>
            </div>
          );
        })}
    </div>
  );
};

export default Playlists;
