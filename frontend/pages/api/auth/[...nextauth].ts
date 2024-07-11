import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify";

const scopes = [
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
].join(',');

const params = {
  scope: scopes
}

const LOGIN_URL = "https://accounts.spotify.com/authorize?" + new URLSearchParams(params).toString();

interface Session {
  accessToken: string;
  expires: string;
  user: {
    name: string;
    email: string;
    image: string;
  }
}


async function refreshAccessToken(token: any) {
  const params = new URLSearchParams()
  params.append("grant_type", "refresh_token")
  params.append("refresh_token", token.refreshToken)

  const base64 = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_SECRET).toString('base64')

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      'Authorization': 'Basic ' + base64
    },
    body: params
  })
  const data = await response.json()
  return {
    ...token,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? token.refreshToken,
    accessTokenExpires: Date.now() + data.expires_in * 1000
  }
}


export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
      authorization: LOGIN_URL,
    }),
  ],
  pages: {
    signIn: "/signin"
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }: { token: any, account: any }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at
        return token
      }
      // access token has not expired
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires * 1000) {
        return token
      }

      // access token has expired
      return await refreshAccessToken(token)
    },
    async session({ session, token, user }: { session: any, token: any, user: any }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken
      return session as Session
    },
    authorized({ token, session }: { token: any, session: any }) {
      if (token && session.access_token) return true // If there is a token and access_token, the user is authorized
    }
  },
}

export default NextAuth(authOptions)