'use client';

import React, { useState } from 'react';
import { BatteryFull, Check, CheckCheck, Pause, Play, SendHorizontal, Signal, Wifi } from 'lucide-react';
import { CmsField, CmsLink, CmsList, CmsText, useCurrentSection, useGlobal } from '@latinovation/cms-client/react';
import { WallBand, useSeen } from './common';

/** Teléfono con la conversación que atiende el agente de WhatsApp (los mensajes son campos del CMS). */
function ChatPhone() {
  const s = useCurrentSection();
  const name = String(s?.data?.phoneName || '');
  return (
    <div className="phone" role="img" aria-label={`Conversación de WhatsApp atendida por un agente de Velora: ${name}`}>
      <div className="phone__screen">
        <span className="phone__island" aria-hidden="true" />
        <div className="phone__status" aria-hidden="true">
          <CmsText f="messages.0.time" />
          <span>
            <Signal />
            <Wifi />
            <BatteryFull />
          </span>
        </div>
        <div className="chat">
          <div className="chat__top">
            <span className="chat__avatar" aria-hidden="true">
              {name.charAt(0) || 'V'}
            </span>
            <span>
              <CmsText f="phoneName" className="chat__name" />
              <CmsText f="phoneStatus" className="chat__agent" />
            </span>
          </div>
          <CmsList
            f="messages"
            as="ol"
            className="chat__thread"
            wrap={false}
            renderItem={(it: any, i: number, h) => {
              const agent = it?.from === 'agente';
              return (
                <li key={h.path} {...h.attrs} className={`bubble bubble--${agent ? 'agente' : 'cliente'}`} style={{ ['--i' as any]: i }}>
                  {h.toolbar}
                  <CmsField f="from" as="span" className="sr-only" />
                  <CmsText f="text" multiline />
                  <span className="bubble__time">
                    <CmsText f="time" />
                    {agent ? <CheckCheck aria-hidden="true" /> : null}
                  </span>
                </li>
              );
            }}
          />
          <div className="chat__compose" aria-hidden="true">
            <CmsText f="phoneInput" className="chat__input" />
            <span className="chat__send">
              <SendHorizontal />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  const [paused, setPaused] = useState(false);
  const pauseLabel = useGlobal<string>('tickerPauseLabel', 'Pausar marquesina');
  const playLabel = useGlobal<string>('tickerPlayLabel', 'Reanudar marquesina');
  const row = (hidden: boolean) => (
    <CmsList f="ticker" as="ul" itemAs="li" className="ticker__list" itemClassName="ticker__item" aria-hidden={hidden || undefined} renderItem={() => <CmsText f="text" />} />
  );
  return (
    <div className="ticker" data-paused={paused}>
      <div className="ticker__track">
        {row(false)}
        {row(true)}
      </div>
      <button type="button" className="ticker__pause" aria-pressed={paused} aria-label={paused ? playLabel : pauseLabel} onClick={() => setPaused((p) => !p)}>
        {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      </button>
    </div>
  );
}

export function Hero() {
  const [ref, lit] = useSeen<HTMLDivElement>(0.1);
  return (
    <>
      <WallBand wall="rosa" className="hero">
        <div className="hero__grid">
          <div className="hero__copy">
            <CmsText f="headline" as="h1" className="lettered" />
            <CmsText f="subheadline" as="p" className="lede" />
            <div className="actions">
              <CmsLink f="primaryCta" className="plaque" />
              <CmsLink f="secondaryCta" className="plaque plaque--ghost" />
            </div>
            <CmsList
              f="highlights"
              as="ul"
              itemAs="li"
              className="facts"
              renderItem={() => (
                <>
                  <Check aria-hidden="true" />
                  <CmsText f="text" />
                </>
              )}
            />
          </div>
          <div className={`hero__stage${lit ? ' is-lit' : ''}`} ref={ref}>
            <div className="hero__sign sign">
              <CmsText f="neonText" className="neon" data-tube="cian" />
            </div>
            <ChatPhone />
          </div>
        </div>
      </WallBand>
      <Ticker />
    </>
  );
}
