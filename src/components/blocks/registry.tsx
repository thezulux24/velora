'use client';

import React from 'react';
import '@latinovation/cms-client/composer/react';
import { CmsPage, defaultRegistry, type CmsRegistry } from '@latinovation/cms-client/react';
import { Hero } from './hero';
import { Agents, Faq, Humans, Process, RichText, Screens } from './sections';
import { LeadForm } from './form';
import { GenericSection } from './generic';

/**
 * Registro de bloques. <CmsPage> busca por clave de sección, luego por tipo de bloque y luego por familia.
 * Los tipos del catálogo permiten que lo que el equipo agregue desde el portal también se vea en el mundo
 * de Velora; lo que no esté registrado cae en GenericSection (nunca desaparece en público).
 */
export const registry: CmsRegistry = {
  ...defaultRegistry,
  hero: Hero,
  en_pantalla: Screens,
  'collection.list': Agents,
  'steps.process': Process,
  'content.split': Humans,
  'faq.accordion': Faq,
  'form.custom': LeadForm,
  'content.richtext': RichText,
};

export function SitePage({ pageSlug }: { pageSlug: string }) {
  return <CmsPage pageSlug={pageSlug} registry={registry} fallback={GenericSection} sectionClassName={(s: any) => `sec sec--${s.key}`} />;
}
