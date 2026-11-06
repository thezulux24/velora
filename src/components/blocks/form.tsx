'use client';

import React, { useState } from 'react';
import { CircleAlert, CircleCheck, Check } from 'lucide-react';
import { CmsLink, CmsList, CmsText, useCurrentSection, type CmsBlockProps } from '@latinovation/cms-client/react';
import { WallBand, listOf, sendLead, useReveal, useSeen } from './common';

type State = 'idle' | 'sending' | 'done' | 'error';

function Control({ it, id }: { it: any; id: string }) {
  const common = {
    id,
    name: String(it?.key || id),
    required: Boolean(it?.required),
    placeholder: it?.placeholder || undefined,
  };
  switch (it?.type) {
    case 'textarea':
      return <textarea {...common} rows={4} />;
    case 'select':
    case 'radio':
      return (
        <select {...common} defaultValue="">
          <option value="" disabled>
            {it?.placeholder || 'Elige una opción'}
          </option>
          {listOf(it?.options).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case 'email':
      return <input {...common} type="email" autoComplete="email" inputMode="email" spellCheck={false} />;
    case 'tel':
      return <input {...common} type="tel" autoComplete="tel" inputMode="tel" />;
    case 'number':
      return <input {...common} type="number" inputMode="numeric" />;
    case 'date':
      return <input {...common} type="date" />;
    default:
      return <input {...common} type="text" autoComplete={/nombre|name/i.test(common.name) ? 'name' : /empresa|company/i.test(common.name) ? 'organization' : undefined} />;
  }
}

export function LeadForm({ data }: CmsBlockProps) {
  const s = useCurrentSection();
  const reveal = useReveal();
  const [state, setState] = useState<State>('idle');
  const [errorText, setErrorText] = useState('');
  const [ref, lit] = useSeen<HTMLDivElement>(0.3);
  const fields: any[] = Array.isArray(data.fields) ? data.fields : [];
  const formId = String(data.formId || 'diagnostico');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const answers: Record<string, string> = {};
    for (const f of fields) {
      const key = String(f?.key || '');
      if (!key) continue;
      answers[key] = f?.type === 'checkbox' ? (fd.get(key) ? 'Sí' : 'No') : String(fd.get(key) || '').trim();
    }
    setState('sending');
    setErrorText('');
    try {
      await sendLead({ formId, formName: formId, payload: answers, sourceSection: s?.key, website: fd.get('website') });
      setState('done');
      form.reset();
    } catch (err) {
      setErrorText(err instanceof Error && err.message !== 'error' ? err.message : '');
      setState('error');
    }
  }

  return (
    <WallBand wall="rosa">
      <div className="lead">
        <div className={`lead__aside${lit ? ' is-lit' : ''}`} ref={ref}>
          <div className="sign">
            <CmsText f="neonText" className="neon" data-tube="amarillo" />
          </div>
          <CmsText f="heading" as="h2" className="lettered" />
          <CmsText f="intro" as="p" className="lede" />
          <CmsText f="asideTitle" as="h3" />
          <CmsList
            f="asidePoints"
            as="ul"
            itemAs="li"
            className="checks"
            renderItem={() => (
              <>
                <Check aria-hidden="true" />
                <CmsText f="text" />
              </>
            )}
          />
        </div>

        <form className="form" onSubmit={onSubmit} noValidate={false} aria-describedby="lead-status">
          <CmsList
            f="fields"
            className="contents"
            wrap={false}
            renderItem={(it: any, i, h) => {
              const id = `lead-${it?.key || i}`;
              if (it?.type === 'checkbox') {
                return (
                  <div key={h.path} {...h.attrs} className="field field--check">
                    {h.toolbar}
                    <label className="check" htmlFor={id}>
                      <input id={id} type="checkbox" name={String(it?.key || id)} required={Boolean(it?.required)} />
                      <CmsText f="label" />
                    </label>
                  </div>
                );
              }
              return (
                <div key={h.path} {...h.attrs} className={`field${it?.width === 'half' ? '' : ' field--full'}`}>
                  {h.toolbar}
                  <label htmlFor={id}>
                    <CmsText f="label" />
                    {it?.required ? (
                      <span className="field__req" aria-hidden="true">
                        *
                      </span>
                    ) : null}
                  </label>
                  <Control it={it} id={id} />
                  <CmsText f="help" as="small" className="field__help" />
                </div>
              );
            }}
          />
          <div className="hp" aria-hidden="true">
            <label htmlFor="lead-website">Sitio web</label>
            <input id="lead-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <div id="lead-status" className="contents">
            <p className="form-msg" role="status" hidden={reveal(state === 'done')}>
              <CircleCheck aria-hidden="true" />
              <CmsText f="successMessage" />
            </p>
            <p className="form-msg form-msg--error" role="alert" hidden={reveal(state === 'error')}>
              <CircleAlert aria-hidden="true" />
              <span>
                <CmsText f="errorMessage" /> {errorText ? <span>({errorText})</span> : null}
              </span>
            </p>
          </div>
          <div className="form__foot">
            <button type="submit" className="plaque" aria-busy={state === 'sending'} disabled={state === 'sending'}>
              <CmsText f="submitLabel" hidden={state === 'sending'} />
              <CmsText f="sendingLabel" hidden={reveal(state === 'sending')} />
            </button>
            <CmsLink f="privacyLink" />
          </div>
        </form>
      </div>
    </WallBand>
  );
}
