import "@styles/globals.css";
import { GeistMono, GeistSans } from "geist/font";
import { IBM_Plex_Mono, Poppins } from "next/font/google";

const ibm_plex_mono = IBM_Plex_Mono({
  weight: ["100", "200", "400", "700"],
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["100", "200", "400", "700", "900"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Osman's Portfolio",
  description: "Osman Sultan's Personal Portfolio Site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
