// import { NextAuthOptions } from "next-auth";
// import AzureADProvider from "next-auth/providers/azure-ad";
// import { JWT } from "next-auth/jwt";

// const requiredEnvVars = {
//   AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID,
//   AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET,
//   AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID,
//   AZURE_AD_SCOPE: process.env.AZURE_AD_SCOPE,
//   AZURE_AD_ISSUER: process.env.AZURE_AD_ISSUER,
//   AZURE_AD_TOKEN_URI: process.env.AZURE_AD_TOKEN_URI,
//   NEXT_PUBLIC_BACKEND: process.env.NEXT_PUBLIC_BACKEND,
//   NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
// };

// Object.entries(requiredEnvVars).forEach(([key, value]) => {
//   if (!value) {
//     throw new Error(`Missing required environment variable: ${key}`);
//   }
// });

// interface MenuBlade {
//   redirectUrl: string;
//   allowedRoutes: string[];
// }

// interface GraphTokenResponse {
//   access_token: string;
//   refresh_token: string;
//   expires_in: number;
// }

// interface RotatedTokens {
//   access_token: string;
//   refresh_token: string;
//   expires_at: number;
// }

// async function fetchUserData(accessToken: string) {

//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_BACKEND}/api/get-user-role`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch user role");
//   }

//   return response.json();
// }

// async function refreshAccessToken(refreshToken: string): Promise<RotatedTokens> {

//   const response = await fetch(process.env.AZURE_AD_TOKEN_URI!, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: new URLSearchParams({
//       client_id: process.env.AZURE_AD_CLIENT_ID!,
//       client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
//       grant_type: "refresh_token",
//       refresh_token: refreshToken,
//       scope: process.env.AZURE_AD_SCOPE!,
//     }),
//   });

//   const tokens: GraphTokenResponse = await response.json();

//   return {
//     access_token: tokens.access_token,
//     refresh_token: tokens.refresh_token,
//     expires_at: Date.now() + tokens.expires_in * 1000,
//   };
// }

// export const authOptions: NextAuthOptions = {

//   providers: [
//     AzureADProvider({
//       clientId: process.env.AZURE_AD_CLIENT_ID!,
//       clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
//       tenantId: process.env.AZURE_AD_TENANT_ID!,
//       authorization: {
//         params: {
//           scope: process.env.AZURE_AD_SCOPE,
//         },
//       },
//       issuer: process.env.AZURE_AD_ISSUER,
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//     maxAge: 60 * 60 * 24 * 30,
//   },

//   secret: process.env.NEXTAUTH_SECRET,

//   pages: {
//     signIn: "/",   
//   },

//   callbacks: {

//     async jwt({ token, account }): Promise<JWT> {

//       // First Login
//       if (account) {

//         const userData = await fetchUserData(account.access_token!);

//         return {
//           ...token,
//           accessToken: account.access_token,
//           refreshToken: account.refresh_token,
//           expiresAt: account.expires_at! * 1000,
//           role: userData.role,
//           menuBlade: {
//             redirectUrl: userData.redirectUrl,
//             allowedRoutes: userData.allowedRoutes,
//           },
//         };
//       }

//       if (Date.now() < (token.expiresAt as number)) {
//         return token;
//       }

//       try {

//         const rotatedTokens = await refreshAccessToken(
//           token.refreshToken as string
//         );

//         token.accessToken = rotatedTokens.access_token;
//         token.refreshToken = rotatedTokens.refresh_token;
//         token.expiresAt = rotatedTokens.expires_at;

//         return token;

//       } catch (error) {

//         delete token.accessToken;
//         delete token.refreshToken;
//         delete token.expiresAt;

//         return {
//           ...token,
//           error: "RefreshAccessTokenError",
//         };
//       }
//     },

//     async session({ session, token }) {

//       if (token) {
//         session.user.role = token.role as string;
//         session.user.menuBlade = token.menuBlade;
//         session.user.accessToken = token.accessToken as string;
//       }

//       return session;
//     },
//   },

import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
 import { JWT } from "next-auth/jwt";

interface MenuBlade {
  redirectUrl: string;
  allowedRoutes: string[];
}

async function fetchUserData(accessToken: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND}/api/get-user-role`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user role");
  }

  return response.json();
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: process.env.AZURE_AD_SCOPE,
        },
      },
      issuer: process.env.AZURE_AD_ISSUER,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/",
  },

  callbacks: {

    async jwt({ token, account }): Promise<JWT> {

      if (account) {

        const userData = await fetchUserData(account.access_token!);

        token.accessToken = account.access_token;
        token.role = userData.role;

        token.menuBlade = {
          redirectUrl: userData.redirectUrl,
          allowedRoutes: userData.allowedRoutes,
        };

      }

      return token;
    },

    async session({ session, token }) {

      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).menuBlade = token.menuBlade;
        (session.user as any).accessToken = token.accessToken;
      }

      return session;
    },
  },
};