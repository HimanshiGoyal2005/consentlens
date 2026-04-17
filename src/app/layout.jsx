import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import PwaRegistration from "@/components/PwaRegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ConsentLens — AI-Powered Patient Consent",
  description:
    "ConsentLens explains surgery risks in Bhojpuri, Hindi, or English via AI video. Patients understand, doctors get C2PA proof.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <PwaRegistration />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
