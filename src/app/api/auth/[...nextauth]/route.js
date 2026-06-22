import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (
          credentials?.email === "bobbybaliguide@gmail.com" &&
          credentials?.password === "Poiuytrewq123."
        ) {
          return { id: "1", name: "Administrator", email: "bobbybaliguide@gmail.com" };
        }
        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || "p17QYhB+QjV9Rkf3z2ZcT8wZ2qL9mBv5X1M3kN4aG6r",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
