import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import prisma from './app/lib/prisma';

export const authConfig = {
  pages: {
    signIn: '/signin'
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [
    Credentials({
      async authorize (credentials) {
        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash('string', salt)

        console.log('password hash', password)
        console.log('credentials', credentials)

        return {
          id: '1',
          name: 'TestUser',
          email: 'test@email.com'
        }
      },
    }),
    GoogleProvider
  ],
} satisfies NextAuthConfig;

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig
});