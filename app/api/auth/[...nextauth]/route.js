import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailLink, PhoneAuthProvider, signInWithCredential, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        phoneNumber: { label: "Phone", type: "tel" },
        uid: { label: "UID", type: "text" },
        type: { label: "Type", type: "text" },
        apiKey: { label: "API Key", type: "text" },
        oobCode: { label: "OOB Code", type: "text" },
      },
      async authorize(credentials, req) {
        console.log("Authorize function called with credentials:", credentials);
        if (credentials.type === 'email') {
          if (credentials.apiKey && credentials.oobCode && credentials.email) {
            try {
              const signInLink = `${process.env.NEXTAUTH_URL}?apiKey=${credentials.apiKey}&oobCode=${credentials.oobCode}&mode=signIn`;
              const methods = await fetchSignInMethodsForEmail(auth, credentials.email);
              
              let userCredential;
              if (methods.length > 0) {
                // User exists, sign in
                userCredential = await signInWithEmailLink(auth, credentials.email, signInLink);
              } else {
                // User doesn't exist, create new account
                userCredential = await signInWithEmailLink(auth, credentials.email, signInLink);
              }
              const user = userCredential.user;
              console.log("User signed in with email link:", user);
              return { id: user.uid, email: user.email };
            } catch (error) {
              console.error("Error signing in with email link:", error);
              throw new Error("Invalid or expired sign-in link");
            }
          }
          console.log("Email credentials incomplete");
          return null;
        } else if (credentials.type === 'phone') {
          if (credentials.phoneNumber && credentials.uid) {
            try {
              // Here we're trusting that the phone authentication was done on the client side
              // and we're just creating a session based on the provided UID
              return { id: credentials.uid, phone: credentials.phoneNumber };
            } catch (error) {
              console.error("Error signing in with phone number:", error);
              throw new Error("Invalid phone authentication");
            }
          }
          console.log("Phone credentials incomplete");
          return null;
        }
        console.log("Authorization failed for credentials:", credentials);
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.phone = user.phone;
      }
      console.log("JWT callback. Token:", token);
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.phone = token.phone;
      console.log("Session callback. Session:", session);
      return session;
    },
  },
  debug: true, // Enable debug mode
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
