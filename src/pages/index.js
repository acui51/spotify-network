import Playlists from "@/components/Playlists";
import { useSpotifyPlaylists } from "@/hooks/useSpotifyPlaylists";
import styles from "@/styles/Home.module.css";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { cosineSim } from "@/utils/cosineSimilarity";

export default function Home({ providers }) {
  const { data: session, status } = useSession();
  const { data: playlistData, loading: playlistLoading } =
    useSpotifyPlaylists(session);
  const [focusedPlaylist, setFocusedPlaylist] = useState([]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className={styles.main}>
        {Object.values(providers).map((provider) => {
          return status === "unauthenticated" ? (
            <button key={provider.name} onClick={() => signIn()}>
              Log in to {provider.name}
            </button>
          ) : (
            <button key={provider.name} onClick={() => signOut()}>
              Log out of {provider.name}
            </button>
          );
        })}
        <div className="flex">
          <Playlists
            playlists={playlistData}
            setFocusedPlaylist={setFocusedPlaylist}
          />
          <div className="w-full">
            <div>Selected a playlist!</div>
            <button onClick={() => getGraphData(focusedPlaylist)}>
              Calculate graphData
            </button>
          </div>
        </div>
      </div>
    </>
  );

  function getGraphData(tracks) {
    const graphData = { nodes: [], links: [] };
    let minWeight = 1;
    let maxWeight = 0;
    for (let i = 0; i < tracks.length; i++) {
      const trackName = tracks[i].metadata.name;
      graphData.nodes.push({ id: trackName, group: 1 });
      const trackFeature = tracks[i].features;
      for (let j = i + 1; j < tracks.length; j++) {
        const compTrackName = tracks[j].metadata.name;
        const compTrackFeature = tracks[j].features;
        const weight = cosineSim(
          Object.values(trackFeature),
          Object.values(compTrackFeature)
        );
        minWeight = Math.min(minWeight, weight);
        maxWeight = Math.max(maxWeight, weight);
        graphData.links.push({
          source: trackName,
          target: compTrackName,
          value: weight,
        });
      }
    }

    // normalize weights
    for (let i = 0; i < graphData.links.length; i++) {
      const link = graphData.links[i];
      link.value = (link.value - minWeight) / (maxWeight - minWeight);
    }

    // filter for only strong relations
    graphData.links = graphData.links.filter((link) => link.value > 0.99);

    return graphData;
  }
}

export async function getServerSideProps() {
  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
}
