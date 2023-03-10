import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function Home({ providers }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session?.user?.accessToken && (
        <div>Access Token: {session.user.accessToken}</div>
      )}
      <main className={styles.main}>
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
      </main>
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
