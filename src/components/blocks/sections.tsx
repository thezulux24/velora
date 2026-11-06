'use client';

import React from 'react';
import {
  BadgeCheck,
  Bookmark,
  CalendarClock,
  Camera,
  ChartColumn,
  Check,
  Globe,
  Heart,
  Info,
  Lock,
  Mail,
  Megaphone,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { getCollection } from '@latinovation/cms-client';
import {
  CmsAddItem,
  CmsImage,
  CmsItem,
  CmsItemText,
  CmsLink,
  CmsList,
  CmsRichText,
  CmsText,
  useCms,
  useCurrentSection,
  type CmsBlockProps,
} from '@latinovation/cms-client/react';
import { Head, WallBand, useSeen } from './common';

// ───────────── agentes: un letrero por ítem de la colección ─────────────

const ICONS: Record<string, React.ComponentType<{ 'aria-hidden'?: boolean }>> = {
  megaphone: Megaphone,
  target: Target,
  message: MessageCircle,
  globe: Globe,
  chart: ChartColumn,
  sparkles: Sparkles,
  camera: Camera,
  mail: Mail,
};

function AgentSign({ item, index, collection }: { item: any; index: number; collection: string }) {
  const Icon = ICONS[String(item.icon || '')] || Sparkles;
  const tasks: any[] = Array.isArray(item.tasks) ? item.tasks : [];
  return (
    <CmsItem item={item} collection={collection} as="li" className="agent" style={{ ['--ignite-delay' as any]: `${index * 160}ms` }}>
      <div className="agent__top">
        <h3 className="agent__name neon" data-tube={item.signColor || 'rosa'}>
          <CmsItemText item={item} f="title" />
        </h3>
        <span className="agent__icon">
          <Icon aria-hidden />
        </span>
      </div>
      <CmsItemText item={item} f="role" as="p" className="agent__role" />
      <CmsItemText item={item} f="summary" as="p" className="agent__summary" multiline />
      {tasks.length ? (
        <ul className="agent__tasks" aria-label={useCurrentSection()?.data?.tasksLabel || undefined}>
          {tasks.map((_, i) => (
            <li key={i}>
              <Check aria-hidden="true" />
              <CmsItemText item={item} f={`tasks.${i}.text`} />
            </li>
          ))}
        </ul>
      ) : null}
      <div className="agent__foot">
        <CmsItemText item={item} f="rhythm" className="agent__rhythm" />
        <span className="agent__deliver">
          <CmsText f="deliverableLabel" />: <CmsItemText item={item} f="deliverable" as="strong" />
        </span>
      </div>
    </CmsItem>
  );
}

export function Agents({ data }: CmsBlockProps) {
  const { payload } = useCms();
  const source = String(data.source || 'agentes');
  const items = getCollection(payload, source);
  const [ref, lit] = useSeen<HTMLUListElement>(0.2);
  return (
    <WallBand wall="cobalt">
      <Head />
      <ul ref={ref} className={`signs${lit ? ' is-lit' : ''}`}>
        {items.map((it, i) => (
          <AgentSign key={it.id} item={it} index={i} collection={source} />
        ))}
      </ul>
      <CmsAddItem collection={source} label="Agregar agente" />
    </WallBand>
  );
}

// ───────────── el trabajo en pantalla ─────────────

function Bars({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="bars" aria-hidden="true">
      {values.map((v, i) => (
        <i key={i} style={{ height: `${Math.max(8, (v / max) * 100)}%` }} />
      ))}
    </div>
  );
}

const num = (v: unknown) => Number(String(v ?? '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;

export function Screens({ data }: CmsBlockProps) {
  const metrics: any[] = Array.isArray(data.adsMetrics) ? data.adsMetrics : [];
  // La gráfica se dibuja con las cifras de la campaña: los últimos días crecen hasta la última cifra.
  const peak = num(metrics[metrics.length - 1]?.value) || 100;
  const series = [0.42, 0.5, 0.47, 0.61, 0.66, 0.78, 1].map((k) => Math.round(peak * k));
  return (
    <WallBand wall="cal">
      <Head />
      <div className="screens">
        <div className="browser">
          <div className="browser__bar" aria-hidden="true">
            <span className="browser__dots">
              <i />
              <i />
              <i />
            </span>
            <span className="browser__url">
              <Lock />
              <CmsText f="webUrl" />
            </span>
          </div>
          <div className="browser__page">
            <div className="browser__copy">
              <CmsText f="webTitle" as="h3" />
              <CmsText f="webBody" as="p" multiline />
              <CmsText f="webCta" className="browser__cta" />
            </div>
            <div className="browser__photo">
              <CmsImage f="webImage" sizes="(max-width: 900px) 100vw, 40vw" />
            </div>
          </div>
        </div>

        <div className="screens__phone">
          <div className="phone">
            <div className="phone__screen">
              <span className="phone__island" aria-hidden="true" />
              <div className="phone__status" aria-hidden="true">
                <span>9:00</span>
              </div>
              <div className="post">
                <div className="post__head">
                  <span className="post__ring" aria-hidden="true">
                    <span>{String(data.postAccount || 'V').charAt(0).toUpperCase()}</span>
                  </span>
                  <CmsText f="postAccount" className="post__account" />
                </div>
                <div className="post__photo">
                  <CmsImage f="postImage" sizes="320px" />
                </div>
                <div className="post__icons" aria-hidden="true">
                  <Heart />
                  <MessageCircle />
                  <Send />
                  <Bookmark />
                </div>
                <CmsText f="postLikes" as="p" className="post__likes" />
                <p className="post__caption">
                  <b>
                    <CmsText f="postAccount" />
                  </b>
                  <CmsText f="postCaption" multiline />
                </p>
                <span className="post__status">
                  <CalendarClock aria-hidden="true" />
                  <CmsText f="postStatus" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel__head">
            <CmsText f="adsTitle" as="h3" className="panel__title" />
            <CmsText f="adsPeriod" className="panel__meta" />
          </div>
          <Bars values={series} />
          <CmsList
            f="adsMetrics"
            as="ul"
            itemAs="li"
            className="metrics"
            itemClassName="metric"
            renderItem={() => (
              <>
                <CmsText f="label" className="metric__label" />
                <CmsText f="value" className="metric__value" />
                <span className="metric__delta">
                  <TrendingUp aria-hidden="true" />
                  <CmsText f="delta" />
                </span>
              </>
            )}
          />
          <p className="note">
            <Sparkles aria-hidden="true" />
            <CmsText f="adsNote" multiline />
          </p>
        </div>

        <div className="panel">
          <div className="panel__head">
            <CmsText f="reportTitle" as="h3" className="panel__title" />
            <CmsText f="reportDate" className="panel__meta" />
          </div>
          <CmsList
            f="reportItems"
            as="dl"
            className="report"
            itemAs="div"
            itemClassName="report__row"
            renderItem={() => (
              <>
                <CmsText f="label" as="dt" />
                <CmsText f="value" as="dd" />
              </>
            )}
          />
          <p className="report__sign">
            <BadgeCheck aria-hidden="true" />
            <CmsText f="reportNote" />
          </p>
        </div>
        <p className="screens__demo">
          <Info aria-hidden="true" />
          <CmsText f="demoLabel" />
        </p>
      </div>
    </WallBand>
  );
}

// ───────────── proceso con el sello del estratega ─────────────

export function Process({ data }: CmsBlockProps) {
  const stampAt = Math.max(0, Number(data.stampStep || 2) - 1);
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);
  return (
    <WallBand wall="maiz">
      <Head />
      <div ref={ref} className={seen ? 'is-in' : undefined}>
      <CmsList
        f="items"
        as="ol"
        className="steps"
        itemAs="li"
        itemClassName="step"
        renderItem={(_, i) => (
          <>
            <CmsText f="title" as="h3" />
            <CmsText f="body" as="p" multiline />
            {i === stampAt ? <CmsText f="/stampText" className="stamp" /> : null}
          </>
        )}
      />
      </div>
    </WallBand>
  );
}

// ───────────── personas al mando ─────────────

export function Humans({ data }: CmsBlockProps) {
  return (
    <WallBand wall="tinta">
      <div className={`split${data.imageSide === 'right' ? ' split--right' : ''}`}>
        <div className="photo-frame">
          <CmsImage f="image" sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
        <div className="split__copy">
          <CmsText f="heading" as="h2" className="lettered" />
          <CmsRichText f="body" className="prose" />
          <div className="actions">
            <CmsLink f="cta" className="plaque plaque--rosa" />
          </div>
        </div>
      </div>
    </WallBand>
  );
}

// ───────────── preguntas ─────────────

export function Faq() {
  return (
    <WallBand wall="cal">
      <div className="faq">
        <Head />
        <CmsList
          f="items"
          as="ul"
          className="qa"
          itemAs="li"
          renderItem={() => (
            <details className="qa__item">
              <summary>
                <CmsText f="question" />
                <span className="qa__icon" aria-hidden="true">
                  <Plus />
                </span>
              </summary>
              <CmsRichText f="answer" className="qa__answer prose" />
            </details>
          )}
        />
      </div>
    </WallBand>
  );
}

// ───────────── texto (aviso de privacidad y similares) ─────────────

export function RichText() {
  return (
    <WallBand wall="cal">
      <CmsRichText f="body" className="prose prose--page" />
    </WallBand>
  );
}
