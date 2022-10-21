import { User } from "models";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  theme: {
    colorScheme: "dark"
  },
  callbacks: {
    async signIn({ profile }): Promise<any> {
      const userExists = await User.find({ email: profile.email }).count();
      if (!userExists) {
        const user = new User({ email: profile.email });
        user.save();
      }
      return true;
    }
  }
});
