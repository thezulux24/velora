'use client';

import React from 'react';
import { CmsField, CmsList, type CmsBlockProps } from '@latinovation/cms-client/react';
import { WallBand, type Wall } from './common';

const SKIP = ['tone', 'anchor', 'columns', 'layout', 'variant', 'imageSide', 'formName', 'source', 'formId', 'notifyEmails', 'webhookUrl', 'redirectTo'];
const TONE: Record<string, Wall> = { default: 'cal', alt: 'maiz', inverse: 'tinta', accent: 'rosa' };

/** Cualquier bloque del catálogo que el equipo agregue desde el portal, pintado en una pared de Velora. */
export function GenericSection({ data }: CmsBlockProps) {
  const keys = Object.keys(data).filter((k) => !k.startsWith('_') && !/Alt$|Focal$/.test(k) && !SKIP.includes(k));
  const scalar = keys.filter((k) => !Array.isArray(data[k]) && typeof data[k] !== 'boolean' && typeof data[k] !== 'number' && data[k] !== '');
  const lists = keys.filter((k) => Array.isArray(data[k]) && data[k].some((x: unknown) => x && typeof x === 'object'));
  return (
    <WallBand wall={TONE[String(data.tone || 'default')] || 'cal'}>
      <div className="generic">
        {scalar.map((k) => (
          <CmsField key={k} f={k} as={k === 'heading' || k === 'headline' || k === 'title' ? 'h2' : 'div'} className={`generic__${k}`} />
        ))}
        {lists.map((k) => (
          <CmsList
            key={k}
            f={k}
            as="ul"
            itemAs="li"
            className="generic__list"
            itemClassName="generic__item"
            renderItem={(it: any) => (
              <>
                {Object.keys(it || {})
                  .filter((sub) => !/Alt$|Focal$/.test(sub) && typeof it[sub] !== 'boolean' && !Array.isArray(it[sub]))
                  .map((sub) => (
                    <CmsField key={sub} f={sub} as="div" />
                  ))}
              </>
            )}
          />
        ))}
      </div>
    </WallBand>
  );
}
