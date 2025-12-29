import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url || `https://graph.facebook.com/${profile.id}/picture?type=large&width=200&height=200`,
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        const user = await UserModel.findByEmail(credentials.email);

        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth providers (Google, Facebook)
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          const existingUser = await UserModel.findByEmail(user.email!);
          
          if (!existingUser) {
            // Create new user for OAuth providers
            await UserModel.create({
              email: user.email!,
              name: user.name || user.email?.split('@')[0],
              image: user.image ?? undefined,
              provider: account.provider,
            });
            console.log(`✅ New ${account.provider} user created:`, user.email);
          } else {
            // Update existing user's image if it changed
            if (user.image && existingUser.image !== user.image) {
              await UserModel.updateImage(user.email!, user.image);
              console.log(`✅ Updated ${account.provider} user image:`, user.email);
            }
            console.log(`✅ Existing ${account.provider} user logged in:`, user.email);
          }
        } catch (error) {
          console.error(`❌ Error saving ${account.provider} user:`, error);
          return false; // Deny sign in on error
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && session.user.email) {
        session.user.id = token.sub || "";
        
        // Fetch user data from database to get latest image and name
        try {
          const user = await UserModel.findByEmail(session.user.email);
          if (user) {
            session.user.name = user.name || session.user.name;
            session.user.image = user.image || session.user.image;
          }
        } catch (error) {
          console.error('Error fetching user data for session:', error);
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
