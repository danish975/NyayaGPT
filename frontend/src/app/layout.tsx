import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NyayaGPT — India's laws, explained with citations",
  description:
    "Source-grounded AI for Indian law and public policy. Ask about RTI, PMAY, Article 21, NEP 2020, MGNREGA and the DPDP Act — every answer cites the exact section.",
  authors: [{ name: "NyayaGPT" }],
  openGraph: {
    type: "website",
    title: "NyayaGPT — India's laws, explained with citations",
    description:
      "RAG-powered citizen assistant for Indian government policies, welfare schemes, and constitutional provisions.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('nyayagpt-dark') === 'true' ||
                  (!localStorage.getItem('nyayagpt-dark') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
