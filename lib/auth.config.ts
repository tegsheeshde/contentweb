import type { NextAuthConfig } from "next-auth";

// Edge-safe config — no DB or Node.js-only imports
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/watch") ||
        nextUrl.pathname.startsWith("/subscribe");

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.subscribed = (user as { subscribed?: boolean }).subscribed ?? false;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { subscribed?: boolean }).subscribed = (token.subscribed as boolean) ?? false;
        (session.user as { isAdmin?: boolean }).isAdmin = (token.isAdmin as boolean) ?? false;
      }
      return session;
    },
  },
  providers: [],
  session: { strategy: "jwt" },
};
