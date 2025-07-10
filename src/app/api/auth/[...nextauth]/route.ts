import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Move your auth config here if not already

const handler = NextAuth(authOptions);

// Export both GET and POST
export { handler as GET, handler as POST };
