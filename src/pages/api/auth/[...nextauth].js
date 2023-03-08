import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_API_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_API_CLIENT_SECRET,
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
      return token;
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
