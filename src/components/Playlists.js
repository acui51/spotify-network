import axios from "axios";

const Playlists = ({ playlists }) => {
  console.log("playlists", playlists);

  const fetchTrackFeatures = async (id) => {
    const { data } = await axios.get(`/api/playlists/${id}`);
    const items = data.items;
    const features = await Promise.all(
      items.map((item) => axios.get(`/api/features/${item.track.id}`))
    );
    console.log("features", features);
  };

  return (
    <div className="flex flex-col">
      {playlists?.items &&
        playlists.items.map((playlist) => {
          return (
            <div onClick={() => fetchTrackFeatures(playlist.id)}>
              {playlist.name}
            </div>
          );
        })}
    </div>
  );
};

export default Playlists;
