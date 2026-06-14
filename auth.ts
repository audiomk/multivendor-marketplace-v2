import { MongoDBAdapter } from '@auth/mongodb-adapter'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from './lib/db'
import client from './lib/db/client'
import User from './lib/db/models/user.model'
import NextAuth, { type DefaultSession } from 'next-auth'
import authConfig from './auth.config'

declare module 'next-auth' {
  interface Session {
    user: {
      role: string
      vendorProfile?: {
        storeName: string
        storeSlug: string
        isApproved: boolean
        stripeAccountId: string
        commission: number
      } | null
    } & DefaultSession['user']
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    signIn: '/sign-in',
    newUser: '/sign-up',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: MongoDBAdapter(client),
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        await connectToDatabase()
        if (credentials == null) return null

        const user = await User.findOne({ email: credentials.email })
        if (user && user.password) {
          const isMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          if (isMatch) {
            return {
              id:            user._id,
              name:          user.name,
              email:         user.email,
              role:          user.role,
              vendorProfile: user.vendorProfile ?? null,
            }
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        // Fresh login — pull full user from DB to get vendorProfile
        await connectToDatabase()
        const dbUser = await User.findById(user.id).lean() as any

        if (dbUser && !dbUser.name) {
          await User.findByIdAndUpdate(user.id, {
            name: user.name || user.email!.split('@')[0],
          })
        }

        token.name          = dbUser?.name || user.email!.split('@')[0]
        // Normalize role — accept both 'admin' and 'Admin'
token.role = dbUser?.role || 'User'
        token.vendorProfile = dbUser?.vendorProfile ?? null
      }

      if (session?.user?.name && trigger === 'update') {
        token.name = session.user.name
        // Re-fetch vendorProfile on session update too
        await connectToDatabase()
        const dbUser = await User.findById(token.sub).lean() as any
        token.role          = dbUser?.role          ?? token.role
        token.vendorProfile = dbUser?.vendorProfile ?? null
      }

      return token
    },

    session: async ({ session, user, trigger, token }) => {
      session.user.id            = token.sub as string
      session.user.role          = token.role as string
      session.user.name          = token.name as string
      session.user.vendorProfile = (token.vendorProfile as any) ?? null

      if (trigger === 'update') {
        session.user.name = user?.name
      }
      return session
    },
  },
})