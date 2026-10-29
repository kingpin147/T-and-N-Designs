import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import CursorGlow from "@/components/CursorGlow";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tnndesigns.com"),
  title: {
    default: "T & N Designs | Professional Web Design, Wix Studio & Digital Growth Agency",
    template: "%s | T & N Designs",
  },
  description:
    "Award-winning web design and digital growth agency. Bespoke Wix Studio platforms, high-velocity Next.js web applications, WordPress migrations, and high-converting Meta Ads.",
  alternates: {
    canonical: "https://www.tnndesigns.com",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  keywords: [
    "Professional Web Design Agency",
    "Custom Website Development Company",
    "E commerce Website Builder Agency",
    "Hire Website Designers",
    "Small Business Website Design",
    "Wix Studio web design",
    "Wix Velo custom code development",
    "WordPress to Wix migration",
    "WordPress to Next.js migration",
    "Meta Ads marketing agency",
    "Conversion rate optimization CRO",
    "T & N Designs",
  ],
  authors: [{ name: "T & N Designs", url: "https://www.tnndesigns.com" }],
  creator: "T & N Designs",
  publisher: "T & N Designs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "T & N Designs | Professional Web Design, Wix Studio & Digital Growth",
    description:
      "Creating custom, modern websites that attract customers and increase sales through Custom Wix Studio, Next.js, and high-converting Meta Ads.",
    url: "https://www.tnndesigns.com",
    siteName: "T & N Designs",
    images: [
      {
        url: "/portfolio/energt-gurus-online.png",
        width: 1200,
        height: 630,
        alt: "T & N Designs - Professional Web Architecture & Digital Growth Agency",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "T & N Designs | Professional Web Design & Growth Agency",
    description:
      "Custom Wix Studio platforms, Next.js web applications, WordPress migrations, and high-converting Meta Ads.",
    images: ["/portfolio/energt-gurus-online.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Rich Schema.org JSON-LD Structured Data for Google Search & AI Engines
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": "https://www.tnndesigns.com/#organization",
      name: "T & N Designs",
      legalName: "T & N Designs Web Architecture & Digital Growth Agency",
      url: "https://www.tnndesigns.com",
      logo: "https://www.tnndesigns.com/logo.svg",
      image: "https://www.tnndesigns.com/portfolio/energt-gurus-online.png",
      description:
        "T & N Designs is a digital design, engineering, and performance marketing studio specializing in bespoke Wix Studio platforms, full-stack Velo JavaScript, Next.js applications, and WordPress migrations.",
      email: "contact@tnndesigns.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Defence Rd, Phase Block M, DHA Rahbar Phase 2",
        addressLocality: "Lahore",
        addressRegion: "Punjab",
        postalCode: "54000",
        addressCountry: "PK",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "31.3912",
        longitude: "74.2465",
      },
      areaServed: [
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Country", name: "Canada" },
        { "@type": "Country", name: "Australia" },
        { "@type": "Country", name: "Pakistan" },
        { "@type": "AdministrativeArea", name: "Worldwide" },
      ],
      priceRange: "$$",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "25",
        bestRating: "5",
        worstRating: "1",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Web Design & Digital Growth Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Custom Wix Studio & Velo Code Development",
              description: "Award-winning responsive layouts paired with full-stack JavaScript and CMS databases.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Next.js Full-Stack Web Applications",
              description: "High-velocity modern platforms engineered with Next.js, TypeScript, and serverless databases.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "WordPress to Wix Studio & Next.js Migrations",
              description: "Zero-downtime platform migrations preserving 100% of SEO rankings, backlinks, and content.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Meta Ads Performance Campaigns & Media Buying",
              description: "High-ROI paid advertising across Facebook and Instagram with full tracking telemetry.",
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.tnndesigns.com/#website",
      url: "https://www.tnndesigns.com",
      name: "T & N Designs",
      publisher: {
        "@id": "https://www.tnndesigns.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.tnndesigns.com/work?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <CursorGlow />
        <AnalyticsProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AnalyticsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
