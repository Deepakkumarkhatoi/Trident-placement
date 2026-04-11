import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {

  interface Session {
    user: {
      email?: string;
      role?: string;
      regdno?: string;
      accessToken?: string;
      menuBlade?: {
        redirectUrl: string;
        allowedRoutes: string[];
      };
    };
  }
}

declare module "next-auth/jwt" {

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    role?: string;
    regdno?: string;
    menuBlade?: {
      redirectUrl: string;
      allowedRoutes: string[];
    };
  }

}