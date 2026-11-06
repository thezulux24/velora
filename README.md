# Velora · landing

Landing de **Velora**, agencia de marketing operada por agentes de IA y dirigida por estrategas. Next.js 15 headless sobre `@latinovation/cms-client`: todo lo que se ve (textos, fotos, botones, agentes, formulario, menú, pie, colores y tipografías) se edita en el portal de WebProAI CMS, proyecto `velora`.

- Producción: https://velora.webproai.tech
- Portal: https://webproai.tech/portal?project=velora
- Leads del formulario `diagnostico`: Portal → Contactos (o `ltn leads list velora --form-id diagnostico`)

## Dónde vive cada cosa

| En la página | En el CMS |
|---|---|
| Portada, el trabajo en pantalla, proceso, personas, preguntas, diagnóstico | Secciones de la página `/` (borrador → Publicar) |
| Los cuatro agentes | Colección `agentes` (agrega uno y aparece como letrero nuevo) |
| Formulario de diagnóstico | Sección `form.custom` con `formId: diagnostico` |
| Colores, fuentes, radios, espaciado | Design System v2 |
| Menú, botón de la cabecera y pie | Navegación |
| Marca, ciudad, redes, textos del pie y de la 404 | Datos globales |
| Aviso de privacidad | Página `/privacidad` |

## Desarrollo

```bash
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3020
npm run cms:audit      # auditoría de editabilidad (≥ 95 %)
```

El SDK va empaquetado en `vendor/` (`npm pack` de `cms-landings/packages/cms-client`).

## Contenido desde código (solo la primera carga o cambios masivos)

```bash
npm run cms:pull && npm run cms:build && npm run cms:diff && npm run cms:push
```

`cms:push` sobrescribe páginas, globales y navegación con lo que define `cms/seed/build-manifest.mjs`: después de que el equipo edite en el portal, prefiere las ediciones puntuales (`ltn sections field …`).

## Despliegue

Imagen Docker (`Dockerfile`, Next standalone, puerto 3000) en Coolify. Al publicar en el portal, el CMS llama a `/api/revalidate` con `x-cms-webhook-secret` (variable `CMS_WEBHOOK_SECRET` del contenedor).
