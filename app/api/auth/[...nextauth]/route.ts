import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/business.manage",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Forces it to use the secret
});

export { handler as GET, handler as POST };