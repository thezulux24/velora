'use client';

import Link from 'next/link';
import { CmsGlobalText } from '@latinovation/cms-client/react';

export function NotFoundView() {
  return (
    <div className="wall wall--tinta notfound">
      <div className="wrap">
        <div className="sign">
          <span className="neon" data-tube="rosa">
            404
          </span>
        </div>
        <CmsGlobalText f="notFoundTitle" as="h1" />
        <CmsGlobalText f="notFoundBody" as="p" className="lede" />
        <Link href="/" className="plaque plaque--rosa">
          <CmsGlobalText f="notFoundCta" />
        </Link>
      </div>
    </div>
  );
}
