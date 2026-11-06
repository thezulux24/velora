#!/usr/bin/env node
/**
 * Modelo de contenido de Velora como código (proyecto `velora` en WebProAI CMS).
 *
 *   npm run cms:pull     # 1. estado actual (lo que el equipo editó en el portal)
 *   npm run cms:build    # 2. reescribe páginas, globales, design system, menú y SEO
 *   npm run cms:diff     # 3. revisa el diff
 *   npm run cms:push     # 4. queda en vivo (con respaldo restaurable)
 *
 * Los agentes viven en la colección `agentes` (se conserva con --skip-collections).
 * Cada sección lleva `schema` para que el inspector del portal muestre todos sus campos.
 * OJO: después de la primera carga el contenido es del cliente: edita en el portal, no aquí.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const snapshotPath = path.join(root, 'cms', 'velora.snapshot.json');
if (!fs.existsSync(snapshotPath)) {
  console.error('Falta cms/velora.snapshot.json. Ejecuta primero: npm run cms:pull');
  process.exit(1);
}
const snap = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

// ───────────── catálogo de bloques (esquemas del portal) ─────────────
const catalogPath = path.resolve(root, '..', 'cms-landings', 'shared', 'blocks.catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const blocks = new Map(catalog.blocks.map((b) => [b.type, b]));
const catalogFields = (type) => {
  const b = blocks.get(type);
  if (!b) throw new Error(`Bloque ${type} no está en shared/blocks.catalog.json`);
  return JSON.parse(JSON.stringify(b.fields));
};

const t = (key, label, extra = {}) => ({ key, type: 'text', label, ...extra });
const ta = (key, label) => ({ key, type: 'textarea', label });
const rt = (key, label) => ({ key, type: 'richtext', label });
const img = (key, label) => ({ key, type: 'image', label });
const link = (key, label) => ({ key, type: 'link', label });
const arr = (key, label, fields) => ({ key, type: 'array', label, fields });
const sel = (key, label, options) => ({ key, type: 'select', label, options: options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)) });

const block = (type, key, name, data, extraSchema = [], style = {}) => {
  const base = catalogFields(type);
  return {
    key,
    name,
    description: '',
    isVisible: true,
    schema: [...base, ...extraSchema.filter((f) => !base.some((c) => c.key === f.key))],
    data: { _block: type, ...data, ...(Object.keys(style).length ? { _style: style } : {}) },
  };
};
const custom = (key, name, schema, data, style = {}) => ({ key, name, description: '', isVisible: true, schema, data: { ...data, ...(Object.keys(style).length ? { _style: style } : {}) } });

// ───────────── fotos (subidas a la mediateca del proyecto) ─────────────
const M = (f) => `/uploads/media/${f}.webp`;
const PH = {
  latte: M('photo-1495474472287-4d71bcdd2085-1794001878372-ux7a'),
  americano: M('photo-1509042239860-f550ce710b93-1794001881051-s3pz'),
  team: M('photo-1522071820081-009f0129c71c-1794001882974-2p5z'),
  highfive: M('photo-1600880292203-757bb62b4baf-1794001884694-de4s'),
};

// ───────────── portada ─────────────
const hero = custom(
  'hero',
  'Portada',
  [
    t('headline', 'Titular'),
    ta('subheadline', 'Bajada'),
    link('primaryCta', 'Botón principal'),
    link('secondaryCta', 'Botón secundario'),
    arr('highlights', 'Datos bajo los botones', [t('text', 'Dato')]),
    t('neonText', 'Letrero de neón sobre el teléfono'),
    t('phoneName', 'Teléfono: nombre del chat'),
    t('phoneStatus', 'Teléfono: estado del agente'),
    arr('messages', 'Teléfono: mensajes', [sel('from', 'Quién escribe', [{ value: 'cliente', label: 'Cliente' }, { value: 'agente', label: 'Agente' }]), ta('text', 'Mensaje'), t('time', 'Hora')]),
    t('phoneInput', 'Teléfono: texto de la caja de escribir'),
    arr('ticker', 'Marquesina de servicios', [t('text', 'Servicio')]),
  ],
  {
    headline: 'La agencia de marketing que no cierra.',
    subheadline: 'Velora pone a trabajar por tu negocio un equipo de agentes de IA: contenido, pauta, WhatsApp y SEO, de día y de noche. Un estratega humano aprueba cada paso.',
    primaryCta: { label: 'Agenda tu diagnóstico', href: '/#diagnostico' },
    secondaryCta: { label: 'Conoce a los agentes', href: '/#agentes' },
    highlights: [{ text: '4 agentes especializados' }, { text: '1 estratega humano por cuenta' }, { text: 'Reporte cada lunes' }],
    neonText: 'Abierto 24/7',
    phoneName: 'Café Altamira',
    phoneStatus: 'Agente Velora · en línea',
    messages: [
      { from: 'cliente', text: 'Hola, ¿tienen mesa para 6 mañana a las 11?', time: '23:47' },
      { from: 'agente', text: '¡Hola, Mariana! Sí: nos queda la mesa larga de la terraza a las 11:00. ¿Te la aparto a tu nombre?', time: '23:47' },
      { from: 'cliente', text: 'Sí, porfa. ¿Tienen opciones sin gluten?', time: '23:48' },
      { from: 'agente', text: 'Lista tu reserva. Tenemos pan y hot cakes sin gluten. Te mando la ubicación y un recordatorio una hora antes.', time: '23:48' },
    ],
    phoneInput: 'Escribe un mensaje',
    ticker: [{ text: 'Contenido y redes' }, { text: 'Pauta en Meta y Google' }, { text: 'Ventas por WhatsApp' }, { text: 'Landings' }, { text: 'SEO' }, { text: 'Reportes semanales' }],
  },
  { anchorId: 'inicio' },
);

const agentes = block(
  'collection.list',
  'agentes',
  'Agentes',
  {
    heading: 'Cuatro agentes, un mismo equipo.',
    intro: 'Cada agente domina un oficio y todos siguen la misma estrategia. Tú ves el trabajo terminado; ellos no se toman vacaciones.',
    source: 'agentes',
    layout: 'cards',
    columns: '2',
    showFilters: false,
    paginate: false,
    tasksLabel: 'Hace',
    deliverableLabel: 'Entrega',
    anchor: 'agentes',
  },
  [t('tasksLabel', 'Rótulo de la lista de tareas'), t('deliverableLabel', 'Rótulo de lo que entrega')],
);

const pantalla = custom(
  'en_pantalla',
  'El trabajo en pantalla',
  [
    t('heading', 'Título'),
    ta('intro', 'Introducción'),
    t('postAccount', 'Post: cuenta'),
    img('postImage', 'Post: foto'),
    t('postImageAlt', 'Post: texto alternativo de la foto'),
    ta('postCaption', 'Post: texto'),
    t('postLikes', 'Post: me gusta'),
    t('postStatus', 'Post: estado'),
    t('webUrl', 'Página: dirección'),
    t('webTitle', 'Página: titular'),
    ta('webBody', 'Página: texto'),
    t('webCta', 'Página: botón'),
    img('webImage', 'Página: foto'),
    t('webImageAlt', 'Página: texto alternativo de la foto'),
    t('adsTitle', 'Pauta: campaña'),
    t('adsPeriod', 'Pauta: periodo'),
    arr('adsMetrics', 'Pauta: cifras', [t('label', 'Métrica'), t('value', 'Valor'), t('delta', 'Cambio')]),
    t('adsNote', 'Pauta: nota del agente'),
    t('reportTitle', 'Reporte: título'),
    t('reportDate', 'Reporte: fecha'),
    arr('reportItems', 'Reporte: puntos', [t('label', 'Tema'), t('value', 'Resultado')]),
    t('reportNote', 'Reporte: firma del estratega'),
  ],
  {
    heading: 'El trabajo se ve en tu teléfono.',
    intro: 'Así luce una semana de Velora para un café de barrio: la publicación del viernes, la página del brunch, la campaña y el reporte del lunes.',
    postAccount: 'cafealtamira',
    postImage: PH.latte,
    postImageAlt: 'Dos capuchinos con arte latte y un café frío sobre una mesa de madera',
    postCaption: 'El domingo se brindaba con café. Brunch de 9 a 2, terraza con sombra y pan recién hecho. Aparta tu mesa por WhatsApp.',
    postLikes: '1.284 Me gusta',
    postStatus: 'Programado · viernes 9:00',
    webUrl: 'cafealtamira.com/brunch',
    webTitle: 'Brunch de domingo en la terraza',
    webBody: 'Pan de masa madre, hot cakes y café de especialidad. Mesas para grupos de hasta 12.',
    webCta: 'Reservar mesa',
    webImage: PH.americano,
    webImageAlt: 'Taza de café americano junto a granos de café tostado',
    adsTitle: 'Brunch de domingo',
    adsPeriod: 'Últimos 7 días',
    adsMetrics: [
      { label: 'Alcance', value: '48.200', delta: '+18 %' },
      { label: 'Clics a WhatsApp', value: '3.140', delta: '+26 %' },
      { label: 'Reservas', value: '212', delta: '+31 %' },
    ],
    adsNote: 'Moví 20 % del presupuesto al anuncio B: trae reservas 31 % más baratas.',
    reportTitle: 'Reporte semanal',
    reportDate: 'Lunes 8:00',
    reportItems: [
      { label: 'Publicaciones', value: '7 de 7 a tiempo' },
      { label: 'Conversaciones', value: '486 atendidas' },
      { label: 'Visitas a la página', value: '5.910' },
      { label: 'Próximo paso', value: 'Probar video del brunch' },
    ],
    reportNote: 'Revisado y aprobado por Andrea, tu estratega',
  },
  { anchorId: 'trabajo' },
);

const proceso = block(
  'steps.process',
  'proceso',
  'Cómo empezamos',
  {
    heading: 'Del diagnóstico a tu primer reporte en dos semanas.',
    intro: 'Sin contratos eternos ni curvas de aprendizaje: tu estratega arma el plan, los agentes lo ejecutan y tú apruebas.',
    items: [
      { title: 'Diagnóstico', body: 'Una llamada de 30 minutos para entender tu negocio, tus clientes y qué ya funciona.' },
      { title: 'Plan aprobado', body: 'Tu estratega propone metas, mensajes y presupuesto. Nada sale sin tu visto bueno.' },
      { title: 'Agentes en marcha', body: 'Los cuatro agentes empiezan a publicar, pautar, atender y medir desde el primer día.' },
      { title: 'Reporte y ajuste', body: 'Cada lunes recibes resultados claros y el siguiente paso, en una sola página.' },
    ],
    stampText: 'Aprobado',
    stampStep: '2',
    anchor: 'proceso',
  },
  [t('stampText', 'Texto del sello'), sel('stampStep', 'Paso que lleva el sello', ['1', '2', '3', '4'])],
);

const humanos = block(
  'content.split',
  'humanos',
  'Personas al mando',
  {
    heading: 'Los agentes ejecutan. Las personas deciden.',
    body: 'Detrás de cada cuenta hay un **estratega de Velora** que conoce tu negocio: define el tono, aprueba cada campaña y te llama cuando algo cambia.\n\nLos agentes hacen el trabajo repetitivo y rápido; las personas cuidan tu marca y tus decisiones.',
    cta: { label: 'Habla con un estratega', href: '/#diagnostico' },
    image: PH.team,
    imageAlt: 'Equipo de estrategas de Velora trabajando con computadoras alrededor de una mesa',
    imageSide: 'left',
    anchor: 'equipo',
  },
);

const preguntas = block('faq.accordion', 'preguntas', 'Preguntas frecuentes', {
  heading: 'Preguntas frecuentes',
  intro: 'Lo que más nos preguntan antes de empezar.',
  items: [
    { question: '¿Los agentes reemplazan a mi equipo?', answer: 'No. Hacen el trabajo operativo (publicar, pautar, responder, medir) para que tu equipo se dedique a vender y atender. Tu estratega de Velora coordina todo contigo.' },
    { question: '¿Quién aprueba lo que se publica?', answer: 'Tú y tu estratega. Los agentes preparan el contenido y las campañas; nada sale sin aprobación, salvo las respuestas de WhatsApp que tú definas como automáticas.' },
    { question: '¿Trabajan con negocios fuera de México?', answer: 'Sí. Somos un equipo mexicano y trabajamos con marcas de toda Latinoamérica, Estados Unidos y España, en español y en inglés.' },
    { question: '¿Cuánto cuesta?', answer: 'Depende de cuántos agentes necesites y de tu inversión en pauta. En el diagnóstico te entregamos una propuesta con precio fijo mensual, sin letra pequeña.' },
    { question: '¿Necesito tener redes o página?', answer: 'No. Si empiezas de cero, el agente de sitios arma tu landing y el de contenido abre y prepara tus redes.' },
    { question: '¿Cómo veo los resultados?', answer: 'Cada lunes recibes un reporte de una página con lo que se hizo, lo que funcionó y el siguiente paso. Además tienes un tablero en vivo cuando quieras revisarlo.' },
  ],
  anchor: 'preguntas',
});

const diagnostico = block(
  'form.custom',
  'diagnostico',
  'Formulario de diagnóstico',
  {
    heading: 'Agenda tu diagnóstico.',
    intro: 'Cuéntanos de tu negocio y un estratega te escribe en menos de un día hábil con una propuesta para tus agentes.',
    formId: 'diagnostico',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Tu nombre', width: 'half' },
      { key: 'email', label: 'Correo', type: 'email', required: true, placeholder: 'tu@empresa.com', width: 'half' },
      { key: 'whatsapp', label: 'WhatsApp', type: 'tel', required: false, placeholder: 'Con código de país', width: 'half' },
      { key: 'empresa', label: 'Empresa', type: 'text', required: true, placeholder: 'Nombre de tu negocio', width: 'half' },
      { key: 'pais', label: 'País', type: 'select', required: true, options: 'México, Colombia, Estados Unidos, España, Argentina, Chile, Perú, Otro', width: 'half' },
      { key: 'interes', label: '¿Qué agente te interesa?', type: 'select', required: true, options: 'Todo el equipo, Contenido y redes, Pauta digital, WhatsApp y ventas, Sitios, SEO y reportes', width: 'half' },
      { key: 'presupuesto', label: 'Inversión mensual en marketing', type: 'select', required: false, options: 'Menos de 500 USD, 500 a 1.500 USD, 1.500 a 5.000 USD, Más de 5.000 USD', width: 'full' },
      { key: 'mensaje', label: '¿Qué te gustaría lograr?', type: 'textarea', required: false, placeholder: 'Más reservas, más ventas en línea, abrir otra ciudad…', width: 'full' },
      { key: 'privacidad', label: 'Acepto el tratamiento de mis datos para recibir la propuesta.', type: 'checkbox', required: true, width: 'full' },
    ],
    submitLabel: 'Quiero mi diagnóstico',
    successMessage: '¡Listo! Recibimos tus datos. Un estratega de Velora te escribe en menos de un día hábil.',
    layout: 'split',
    neonText: 'Abierto',
    asideTitle: 'En el diagnóstico recibes',
    asidePoints: [{ text: 'Una revisión de tus redes, anuncios y página' }, { text: 'Qué agentes te convienen y por qué' }, { text: 'Una propuesta con precio fijo mensual' }],
    privacyLink: { label: 'Aviso de privacidad', href: '/privacidad' },
    sendingLabel: 'Enviando…',
    errorMessage: 'No pudimos enviar tus datos. Revisa los campos marcados e inténtalo de nuevo.',
    anchor: 'diagnostico',
  },
  [
    t('neonText', 'Letrero de neón'),
    t('asideTitle', 'Título de la columna lateral'),
    arr('asidePoints', 'Puntos de la columna lateral', [t('text', 'Punto')]),
    link('privacyLink', 'Enlace al aviso de privacidad'),
    t('sendingLabel', 'Botón mientras envía'),
    t('errorMessage', 'Mensaje de error'),
  ],
);

const home = {
  title: 'Inicio',
  slug: '/',
  description: 'Landing de Velora',
  seoTitle: 'Velora · Agencia de marketing con agentes de IA',
  seoImage: PH.team,
  isPublished: true,
  sections: [hero, agentes, pantalla, proceso, humanos, preguntas, diagnostico],
};

const privacidad = {
  title: 'Aviso de privacidad',
  slug: '/privacidad',
  description: 'Aviso de privacidad de Velora',
  seoTitle: 'Aviso de privacidad',
  isPublished: true,
  sections: [
    block('content.richtext', 'aviso', 'Aviso de privacidad', {
      body: [
        '# Aviso de privacidad',
        'Velora usa los datos que dejas en el formulario de diagnóstico (nombre, correo, WhatsApp, empresa, país y tu mensaje) solo para contactarte y preparar una propuesta de servicios.',
        '## Qué hacemos con tus datos',
        '- Los guardamos en nuestro sistema de contactos.\n- Un estratega los revisa para escribirte.\n- No los vendemos ni los compartimos con terceros para publicidad.',
        '## Tus derechos',
        'Puedes pedir en cualquier momento que corrijamos o borremos tus datos respondiendo al correo con el que te contactemos.',
        '_Última actualización: noviembre de 2026._',
      ].join('\n\n'),
      width: 'narrow',
    }),
  ],
};

const pages = [home, privacidad].map((p, i) => ({ order: i, ...p, sections: p.sections.map((s, j) => ({ order: j, ...s })) }));

// ───────────── globales ─────────────
const g = (key, type, label) => ({ key, type, label });
const globalSchema = [
  g('brandName', 'text', 'Nombre de la marca'),
  g('tagline', 'text', 'Frase de la marca (pie de página)'),
  g('logoUrl', 'image', 'Logo (opcional; si no hay, se usa el nombre)'),
  g('faviconUrl', 'image', 'Ícono de la pestaña (favicon)'),
  g('city', 'text', 'Ciudad o base'),
  g('reach', 'text', 'Alcance (pie de página)'),
  g('email', 'text', 'Correo de contacto (opcional)'),
  {
    key: 'social',
    type: 'array',
    label: 'Redes sociales',
    fields: [
      { key: 'network', type: 'select', label: 'Red', options: ['instagram', 'facebook', 'tiktok', 'linkedin', 'youtube', 'x'].map((v) => ({ value: v, label: v })) },
      { key: 'url', type: 'text', label: 'Enlace' },
    ],
  },
  g('legalNote', 'text', 'Nota legal del pie de página'),
  g('footerNavHeading', 'text', 'Pie: título del menú'),
  g('footerContactHeading', 'text', 'Pie: título de contacto'),
  g('footerSocialHeading', 'text', 'Pie: título de redes'),
  g('footerCta', 'text', 'Pie: llamado final'),
  g('menuLabel', 'text', 'Cabecera: abrir menú (móvil)'),
  g('closeMenuLabel', 'text', 'Cabecera: cerrar menú (móvil)'),
  g('skipLabel', 'text', 'Accesibilidad: saltar al contenido'),
  g('tickerPauseLabel', 'text', 'Marquesina: pausar'),
  g('tickerPlayLabel', 'text', 'Marquesina: reanudar'),
  g('notFoundTitle', 'text', 'Página 404: título'),
  g('notFoundBody', 'text', 'Página 404: texto'),
  g('notFoundCta', 'text', 'Página 404: botón'),
];

const globalData = {
  ...(snap.globalData || {}),
  brandName: 'Velora',
  tagline: 'Agencia de marketing operada por agentes de IA y dirigida por personas.',
  logoUrl: '',
  faviconUrl: '',
  city: 'Ciudad de México',
  reach: 'Clientes en Latinoamérica, Estados Unidos y España',
  email: '',
  phone: '',
  address: '',
  hours: '',
  social: [
    { network: 'instagram', url: 'https://instagram.com/' },
    { network: 'linkedin', url: 'https://linkedin.com/' },
    { network: 'tiktok', url: 'https://tiktok.com/' },
  ],
  legalNote: '© 2026 Velora. Todos los derechos reservados.',
  footerNavHeading: 'Recorrido',
  footerContactHeading: 'Dónde estamos',
  footerSocialHeading: 'Síguenos',
  footerCta: '¿Listo para que tu marketing no cierre nunca?',
  menuLabel: 'Abrir menú',
  closeMenuLabel: 'Cerrar menú',
  skipLabel: 'Ir al contenido',
  tickerPauseLabel: 'Pausar marquesina',
  tickerPlayLabel: 'Reanudar marquesina',
  notFoundTitle: 'Este letrero está apagado.',
  notFoundBody: 'La página que buscas no existe o cambió de dirección.',
  notFoundCta: 'Volver al inicio',
  site: {
    ...((snap.globalData || {}).site || {}),
    cookieBanner: { enabled: false },
    notFound: { title: 'Este letrero está apagado.', body: 'La página que buscas no existe o cambió de dirección.', ctaLabel: 'Volver al inicio', ctaHref: '/' },
  },
  designSystem: {
    version: 2,
    name: 'Rótulo de neón',
    themeMode: 'light',
    colors: {
      background: '#ECEEE8',
      surface: '#FFFFFF',
      surfaceAlt: '#FFC72C',
      text: '#17120F',
      muted: '#4A443D',
      border: '#17120F',
      primary: '#E0007A',
      primaryText: '#FFFFFF',
      secondary: '#1A3BB0',
      secondaryText: '#FFFFFF',
      accent: '#C8102E',
      success: '#1D7A4A',
      danger: '#C8102E',
      custom: [
        { name: 'Tinta', value: '#17120F' },
        { name: 'Neón rosa', value: '#FF5CB8' },
        { name: 'Neón cian', value: '#5CE1FF' },
        { name: 'Neón amarillo', value: '#FFE45C' },
        { name: 'Amarillo maíz', value: '#FFC72C' },
      ],
    },
    typography: {
      headingFont: { family: 'Bungee', source: 'google', weights: [400], category: 'display' },
      bodyFont: { family: 'Schibsted Grotesk', source: 'google', weights: [400, 500, 600, 700], category: 'sans-serif' },
      baseSize: 17,
      scaleRatio: 1.28,
      headingWeight: 400,
      bodyWeight: 400,
      headingCase: 'none',
      headingTracking: -0.01,
      bodyLineHeight: 1.55,
    },
    shape: { radiusSm: 4, radiusMd: 10, radiusLg: 22, radiusFull: 999, borderWidth: 2 },
    shadow: { sm: '0 1px 2px rgb(23 18 15 / .12)', md: '0 10px 28px -12px rgb(23 18 15 / .45)', lg: '0 28px 60px -24px rgb(23 18 15 / .55)' },
    spacing: { sectionY: 120, sectionYMobile: 72, gutter: 24, maxWidth: 1320 },
    buttons: { style: 'solid', shape: 'rounded', case: 'none', weight: 700, paddingY: 16, paddingX: 26 },
    motion: { level: 'subtle', durationMs: 200 },
    header: { variant: 'simple', sticky: true, transparentOnHero: false, showSearch: false, showCart: false },
    footer: { variant: 'columns', showNewsletter: false },
    globalCss: '',
  },
};
delete globalData.designSystem.flat;

const navigationConfig = {
  headerLinks: [
    { id: 'nav-agentes', label: 'Agentes', href: '/#agentes', isVisible: true },
    { id: 'nav-trabajo', label: 'El trabajo', href: '/#trabajo', isVisible: true },
    { id: 'nav-proceso', label: 'Cómo empezamos', href: '/#proceso', isVisible: true },
    { id: 'nav-preguntas', label: 'Preguntas', href: '/#preguntas', isVisible: true },
  ],
  headerCtaText: 'Agenda tu diagnóstico',
  headerCtaHref: '/#diagnostico',
  footerLinks: [
    { id: 'ft-agentes', label: 'Agentes', href: '/#agentes', isVisible: true },
    { id: 'ft-trabajo', label: 'El trabajo', href: '/#trabajo', isVisible: true },
    { id: 'ft-proceso', label: 'Cómo empezamos', href: '/#proceso', isVisible: true },
    { id: 'ft-equipo', label: 'Estrategas', href: '/#equipo', isVisible: true },
    { id: 'ft-preguntas', label: 'Preguntas', href: '/#preguntas', isVisible: true },
    { id: 'ft-diagnostico', label: 'Diagnóstico', href: '/#diagnostico', isVisible: true },
    { id: 'ft-privacidad', label: 'Aviso de privacidad', href: '/privacidad', isVisible: true },
  ],
};

const seoConfig = {
  metaTitle: 'Velora · Agencia de marketing con agentes de IA',
  metaDescription: 'Agentes de IA para contenido, pauta, WhatsApp y SEO, dirigidos por estrategas humanos. Agencia mexicana con clientes en todo el mundo. Agenda tu diagnóstico.',
  ogImage: PH.team,
  robotsIndex: true,
};

const out = { ...snap, globalSchema, globalData, seoConfig, navigationConfig, redirects: [], pages };
fs.writeFileSync(snapshotPath, JSON.stringify(out, null, 2) + '\n');
console.log(`Manifiesto escrito en ${path.relative(root, snapshotPath)}: ${pages.length} páginas, ${pages.reduce((n, p) => n + p.sections.length, 0)} secciones.`);
