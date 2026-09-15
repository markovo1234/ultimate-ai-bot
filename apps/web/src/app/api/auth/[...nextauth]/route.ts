import NextAuth, { type NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

// JWT sessions (no DB adapter): the `User` table in packages/database is owned by the
// bot (Discord user id as primary key, populated via ensureUser on bot interactions),
// so NextAuth doesn't persist its own User/Account rows here - it just needs the OAuth
// access token, kept in the encrypted JWT, to call Discord's API on the user's behalf
// (listing which guilds they administer) for the dashboard's guild picker.
export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: 'identify guilds' } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
