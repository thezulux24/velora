import type { Metadata } from 'next';
import { getPage, mediaUrl, type DeliveryPayload } from '@latinovation/cms-client';
import { CMS_URL, SITE_URL } from './site';

/** Metadatos de una página del CMS (seoTitle/seoImage de la página; SEO global como respaldo). */
export function pageMetadata(payload: DeliveryPayload, pageSlug: string, path = pageSlug): Metadata {
  const page = getPage(payload, pageSlug) as any;
  const seo: any = payload.seo || {};
  const title = page?.seoTitle || page?.title;
  const image = page?.seoImage || seo.ogImage;
  return {
    title: pageSlug === '/' ? { absolute: seo.metaTitle || payload.global?.brandName || 'Velora' } : title,
    description: page?.seoDescription || seo.metaDescription,
    alternates: { canonical: path },
    openGraph: { images: image ? [{ url: mediaUrl(image, CMS_URL) }] : undefined, url: path },
  };
}

export function organizationLd(payload: DeliveryPayload) {
  const g: any = payload.global || {};
  const social = Array.isArray(g.social) ? g.social.map((s: any) => s?.url).filter(Boolean) : [];
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: g.brandName || payload.project.name,
    url: SITE_URL,
    description: (payload.seo as any)?.metaDescription,
    email: g.email || undefined,
    areaServed: 'Worldwide',
    sameAs: social.length ? social : undefined,
  };
}

export const ldScript = (o: unknown) => ({ __html: JSON.stringify(o).replace(/</g, '\u003c') });
