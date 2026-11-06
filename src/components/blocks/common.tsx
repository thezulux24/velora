'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CmsContainer, CmsText, useCms, useCurrentSection } from '@latinovation/cms-client/react';
import { CMS_SLUG, CMS_URL } from '@/lib/site';

export type Wall = 'rosa' | 'cobalt' | 'maiz' | 'cal' | 'tinta';
const WALLS: Wall[] = ['rosa', 'cobalt', 'maiz', 'cal', 'tinta'];

/**
 * Pared pintada (fondo de sección) con su contenedor del CMS (para `contentWidth`).
 * El campo `wall` de la sección (editable en el portal) manda sobre el color por defecto.
 */
export function WallBand({ wall, className = '', children, innerRef }: { wall: Wall; className?: string; children: React.ReactNode; innerRef?: React.Ref<HTMLDivElement> }) {
  const chosen = String(useCurrentSection()?.data?.wall || '') as Wall;
  const w = WALLS.includes(chosen) ? chosen : wall;
  return (
    <div ref={innerRef} className={`wall wall--${w} ${className}`} data-wall={w}>
      <CmsContainer className="wrap">{children}</CmsContainer>
    </div>
  );
}

/** Título h2 + entrada de una sección. */
export function Head({ heading = 'heading', intro = 'intro', className = '' }: { heading?: string; intro?: string; className?: string }) {
  return (
    <div className={`head ${className}`}>
      <CmsText f={heading} as="h2" />
      <CmsText f={intro} as="p" className="lede" />
    </div>
  );
}

/**
 * Marca un elemento como visto la primera vez que entra en pantalla (enciende el neón, pone el sello).
 * En el editor del portal y con movimiento reducido queda encendido desde el inicio.
 */
export function useSeen<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const { isBuilder } = useCms();
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isBuilder || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isBuilder, threshold]);
  return [ref, seen] as const;
}

/**
 * Los estados (enviado, error) se pintan siempre y se muestran con `hidden`: en el editor se ven todos
 * para poder editar sus textos.
 */
export function useReveal() {
  const { isBuilder } = useCms();
  return (cond: boolean) => !(isBuilder || cond);
}

/** Envía un formulario a los leads del CMS (POST /api/public/leads/:slug). */
export async function sendLead(body: Record<string, unknown>) {
  const res = await fetch(`${CMS_URL}/api/public/leads/${CMS_SLUG}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourcePage: typeof window !== 'undefined' ? window.location.href : '', ...body }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data?.message === 'string' ? data.message : 'error');
  }
  return res.json().catch(() => ({}));
}

export const listOf = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.map((x) => String(x).trim()).filter(Boolean)
    : String(v || '')
        .split(/[,\n]/)
        .map((x) => x.trim())
        .filter(Boolean);
