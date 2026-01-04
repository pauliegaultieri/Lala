import NextAuth from "next-auth";
import { upsertUserOnLogin } from "@/lib/firestore-admin";

function RobloxProvider(options) {
  return {
    id: "roblox",
    name: "Roblox",
    type: "oauth",
    authorization: {
      url: "https://authorize.roblox.com/",
      params: {
        scope: "openid profile",
        response_type: "code",
      },
    },
    token: {
      url: "https://apis.roblox.com/oauth/v1/token",
      async request({ client, params, checks, provider }) {
        const baseUrl = "https://sabrvalues.com";
        const redirectUri = `${baseUrl}/api/auth/callback/roblox`;
        const response = await fetch("https://apis.roblox.com/oauth/v1/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: provider.clientId,
            client_secret: provider.clientSecret,
            code: params.code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          }),
        });
        const tokens = await response.json();
        return { tokens };
      },
    },
    userinfo: {
      url: "https://apis.roblox.com/oauth/v1/userinfo",
      async request({ tokens, provider }) {
        const response = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });
        const userInfo = await response.json();
        
        // Fetch avatar thumbnail
        try {
          const thumbnailResponse = await fetch(
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userInfo.sub}&size=150x150&format=Png&isCircular=false`
          );
          const thumbnailData = await thumbnailResponse.json();
          if (thumbnailData.data?.[0]?.imageUrl) {
            userInfo.picture = thumbnailData.data[0].imageUrl;
          }
        } catch (e) {
          // Avatar fetch failed, continue without it
        }
        
        return userInfo;
      },
    },
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    checks: ["state"],
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name || profile.preferred_username,
        email: null,
        image: profile.picture || null,
        robloxId: profile.sub,
        username: profile.preferred_username,
        displayName: profile.name,
        nickname: profile.nickname,
        profileUrl: profile.profile,
        createdAt: profile.created_at,
      };
    },
    ...options,
  };
}

export const authOptions = {
  providers: [
    RobloxProvider({
      clientId: process.env.ROBLOX_CLIENT_ID,
      clientSecret: process.env.ROBLOX_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create or update user in Firestore on every sign in
      try {
        await upsertUserOnLogin(user.robloxId, {
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.image,
          profileUrl: user.profileUrl,
        });
        // User synced successfully
      } catch (error) {
        // Failed to sync user to Firestore
        // Don't block sign in if Firestore fails
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.robloxId = user.robloxId;
        token.username = user.username;
        token.displayName = user.displayName;
        token.profileUrl = user.profileUrl;
        token.image = user.image;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.robloxId = token.robloxId;
      session.user.username = token.username;
      session.user.displayName = token.displayName;
      session.user.profileUrl = token.profileUrl;
      session.user.image = token.image;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
