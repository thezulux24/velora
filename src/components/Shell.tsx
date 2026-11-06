'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { CmsGlobalImage, CmsGlobalText, CmsNav, CmsNavText, useCms, useGlobal } from '@latinovation/cms-client/react';

const SOCIAL_NAMES: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', linkedin: 'LinkedIn', youtube: 'YouTube', x: 'X' };

/** Destino del botón de la cabecera (navigationConfig.headerCtaHref). */
function useCtaHref() {
  const { payload } = useCms();
  return String((payload?.navigation as any)?.headerCtaHref || '/#diagnostico');
}

function Brand() {
  const logo = useGlobal<string>('logoUrl', '');
  const name = useGlobal<string>('brandName', 'Velora');
  return (
    <Link href="/" className="brand" aria-label={name}>
      {logo ? (
        <>
          <CmsGlobalImage f="logoUrl" className="brand__logo" alt={name} />
          <CmsGlobalText f="brandName" className="sr-only" />
        </>
      ) : (
        <>
          <span className="brand__dot" aria-hidden="true" />
          <CmsGlobalText f="brandName" />
        </>
      )}
    </Link>
  );
}

export function SkipLink() {
  return (
    <a href="#contenido" className="skip">
      <CmsGlobalText f="skipLabel" />
    </a>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const href = useCtaHref();
  const menuLabel = useGlobal<string>('menuLabel', 'Abrir menú');
  const closeLabel = useGlobal<string>('closeMenuLabel', 'Cerrar menú');
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);
  return (
    <header className="header">
      <div className="wrap header__bar">
        <Brand />
        <CmsNav list="header" as="nav" className="nav" aria-label="Principal" linkClassName="nav__link" />
        <a href={href} className="plaque plaque--rosa header__cta">
          <CmsNavText f="headerCtaText" />
        </a>
        <button type="button" className="menu-btn" aria-expanded={open} aria-controls="menu-movil" aria-label={open ? closeLabel : menuLabel} onClick={() => setOpen((o) => !o)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      <div
        id="menu-movil"
        className="sheet"
        data-open={open}
        inert={!open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setOpen(false);
        }}
      >
        <CmsNav list="header" as="nav" className="sheet__links" aria-label="Menú" linkClassName="sheet__link" />
        <a href={href} className="plaque plaque--rosa">
          <CmsNavText f="headerCtaText" />
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  const href = useCtaHref();
  const social = useGlobal<any[]>('social', []);
  const email = useGlobal<string>('email', '');
  const links = (Array.isArray(social) ? social : []).map((s, i) => ({ ...s, i })).filter((s) => s?.url);
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__cta">
          <CmsGlobalText f="footerCta" as="p" />
          <a href={href} className="plaque plaque--rosa">
            <CmsNavText f="headerCtaText" />
          </a>
        </div>
        <div className="footer__cols">
          <div className="footer__brand">
            <Brand />
            <CmsGlobalText f="tagline" as="p" />
          </div>
          <div>
            <CmsGlobalText f="footerNavHeading" as="h2" className="footer__h" />
            <CmsNav list="footer" as="nav" className="footer__links" aria-label="Pie de página" linkClassName="footer__link" />
          </div>
          <div>
            <CmsGlobalText f="footerContactHeading" as="h2" className="footer__h" />
            <div className="footer__text">
              <CmsGlobalText f="city" />
              <CmsGlobalText f="reach" />
              {email ? (
                <a className="footer__link" href={`mailto:${email}`}>
                  <CmsGlobalText f="email" />
                </a>
              ) : null}
            </div>
          </div>
          {links.length ? (
            <div>
              <CmsGlobalText f="footerSocialHeading" as="h2" className="footer__h" />
              <ul className="footer__links footer__social">
                {links.map((s) => (
                  <li key={s.i}>
                    <a className="footer__link" href={s.url} target="_blank" rel="noopener noreferrer" data-cms-global={`social.${s.i}.url`}>
                      {SOCIAL_NAMES[String(s.network)] || String(s.network || s.url)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <CmsGlobalText f="legalNote" as="p" className="footer__legal" />
      </div>
    </footer>
  );
}
