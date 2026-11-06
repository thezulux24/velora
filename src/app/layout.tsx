import type { Metadata, Viewport } from 'next';
import { Bungee_Hairline, Bungee_Inline } from 'next/font/google';
import { mediaUrl } from '@latinovation/cms-client';
import { CmsProvider } from '@latinovation/cms-client/react';
import './globals.css';
import { CMS_SLUG, CMS_URL, getSite, PORTAL_ORIGINS, SITE_URL } from '@/lib/site';
import { ldScript, organizationLd } from '@/lib/seo';
import { Footer, Header, SkipLink } from '@/components/Shell';

// Capas decorativas del rótulo (tubo de neón y filete interior). Si el equipo cambia la tipografía de títulos
// en el design system, --font-neon / --font-inline caen a ella (ver globals.css).
const neon = Bungee_Hairline({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-neon-face', display: 'swap' });
const inline = Bungee_Inline({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-inline-face', display: 'swap' });

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getSite();
  const seo: any = p.seo || {};
  const g: any = p.global || {};
  const brand = g.brandName || p.project.name || 'Velora';
  const title = seo.metaTitle || brand;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s · ${brand}` },
    description: seo.metaDescription || g.tagline,
    icons: g.faviconUrl
      ? { icon: mediaUrl(g.faviconUrl, CMS_URL), apple: mediaUrl(g.faviconUrl, CMS_URL) }
      : { icon: '/icon.png', apple: '/icon.png' },
    openGraph: {
      title,
      description: seo.metaDescription || g.tagline,
      siteName: brand,
      locale: 'es_MX',
      type: 'website',
      images: seo.ogImage ? [{ url: mediaUrl(seo.ogImage, CMS_URL) }] : undefined,
    },
    robots: seo.robotsIndex === false ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#17120F',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <html lang="es-MX" className={`${neon.variable} ${inline.variable}`}>
      <head>
        <link rel="preconnect" href={CMS_URL} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        {/* El provider detecta ?preview=1&builder=1&previewToken=… del portal; para los visitantes no cambia nada. */}
        <CmsProvider initial={site} slug={CMS_SLUG} cmsUrl={CMS_URL} allowedOrigins={PORTAL_ORIGINS}>
          <SkipLink />
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
        </CmsProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(organizationLd(site))} />
      </body>
    </html>
  );
}
