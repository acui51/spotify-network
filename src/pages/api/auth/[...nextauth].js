import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

async function refreshAccessToken(token) {
  try {
    // Get refreshed access token
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body:
        "grant_type=refresh_token&refresh_token=" +
        token.refreshToken +
        "&client_id=" +
        process.env.SPOTIFY_API_CLIENT_ID +
        "&client_secret=" +
        process.env.SPOTIFY_API_CLIENT_SECRET,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const resJson = await res.json();
    return {
      ...token,
      accessToken: resJson.access_token,
      accessTokenExpires: Date.now() + resJson.expires_in * 1000,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_API_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_API_CLIENT_SECRET,
      secret: process.env.SECRET,
      scope: "user-top-read",
    }),
  ],
  session: { jwt: true },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000,
        };
      }

      // Return previous token if the access token hasn't expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, refresh
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.user.accessToken = token.accessToken;
        session.user.username = token.username;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
