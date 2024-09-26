import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "../components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Concert Access App",
  description: "Manage your concert tickets and access",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
