import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LoginButton() {
  const { data: session } = useSession();

  console.log("data", session);

  useEffect(() => {
    const fetchJWT = async () => {
      const res = fetch("/api/token");
      const resJson = await res.json();
      console.log("resJson", resJson);
    };

    session && fetchJWT();
  }, []);

  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <img src={session.user.image} />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
