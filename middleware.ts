import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      // Phase 3 constraint: "Only verified users can access dashboard — add check to session/middleware logic"
      if (!token) return false;
      return !!token.emailVerified;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
