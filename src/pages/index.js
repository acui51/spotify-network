import Playlists from "@/components/Playlists";
import { useSpotifyPlaylists } from "@/hooks/useSpotifyPlaylists";
import styles from "@/styles/Home.module.css";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";

export default function Home({ providers }) {
  const { data: session, status } = useSession();
  console.log("session", session, status);
  const { data: playlistData, loading: playlistLoading } =
    useSpotifyPlaylists(session);

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
        <Playlists playlists={playlistData} />
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
}
