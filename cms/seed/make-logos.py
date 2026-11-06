"""Variantes del logo de Velora a partir de logo-source.png (logo entregado por el cliente).

  python cms/seed/make-logos.py   → cms/seed/logos/*.png  (se suben a la mediateca del CMS)

- velora-logo-oscuro.png / velora-logo-claro.png: logo apilado original (marca + palabra), fondo transparente.
- velora-logo-h-oscuro.png / velora-logo-h-claro.png: versión horizontal (marca a la izquierda) para la cabecera.
- velora-marca-*.png: solo la marca (la V).
- velora-favicon.png: la V sobre un cuadro redondeado blanco, 512 px.
"""
import os
from PIL import Image, ImageDraw

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, 'logos')
os.makedirs(out, exist_ok=True)
raw = Image.open(os.path.join(here, 'logo-source.png'))
src = raw.convert('RGB')
W, H = src.size
PAPER = (246, 244, 238)


def unblend(im):
    """Quita el fondo blanco: alfa = 1 - mín(canal)/255 y color desmultiplicado."""
    px = im.load()
    o = Image.new('RGBA', im.size)
    op = o.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b = px[x, y]
            a = 255 - min(r, g, b)
            if a < 10:
                op[x, y] = (0, 0, 0, 0)
                continue
            f = a / 255
            c = [max(0, min(255, round((v - 255 * (1 - f)) / f))) for v in (r, g, b)]
            op[x, y] = (*c, a)
    return o


def lighten(im):
    """Versión para fondos oscuros: lo neutro oscuro pasa a papel; el anillo verde conserva su color."""
    o = im.copy()
    p = o.load()
    for y in range(o.size[1]):
        for x in range(o.size[0]):
            r, g, b, a = p[x, y]
            if a == 0:
                continue
            sat = max(r, g, b) - min(r, g, b)
            if sat < 28:
                p[x, y] = (*PAPER, a)
            else:  # el anillo: un poco más luminoso para que lea sobre tinta
                p[x, y] = (min(255, r + 40), min(255, g + 40), min(255, b + 30), a)
    return o


# Si el archivo ya trae transparencia se usa tal cual; si no, se quita el fondo blanco.
dark = raw.convert('RGBA') if raw.mode == 'RGBA' and raw.getchannel('A').getextrema()[0] == 0 else unblend(src)
light = lighten(dark)


def bbox(im, box=None):
    region = im.crop(box) if box else im
    b = region.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if box:
        b = (b[0] + box[0], b[1] + box[1], b[2] + box[0], b[3] + box[1])
    return b


# La marca (V, persona y anillo) ocupa la parte superior; la palabra, la inferior.
split = int(H * 0.625)
mark_box = bbox(dark, (0, 0, W, split))
word_box = bbox(dark, (0, split, W, H))
full_box = bbox(dark)


def pad(b, p):
    return (max(0, b[0] - p), max(0, b[1] - p), min(W, b[2] + p), min(H, b[3] + p))


def horizontal(im):
    mark = im.crop(pad(mark_box, 6))
    word = im.crop(pad(word_box, 6))
    mh = mark.size[1]
    target_wh = round(mh * 0.5)  # alto de la palabra ≈ 50 % de la marca
    word = word.resize((round(word.size[0] * target_wh / word.size[1]), target_wh), Image.LANCZOS)
    gap = round(mh * 0.12)
    canvas = Image.new('RGBA', (mark.size[0] + gap + word.size[0], mh), (0, 0, 0, 0))
    canvas.alpha_composite(mark, (0, 0))
    canvas.alpha_composite(word, (mark.size[0] + gap, round(mh * 0.5 - target_wh * 0.46)))
    return canvas


def save(im, name, height=None):
    if height and im.size[1] > height:
        im = im.resize((round(im.size[0] * height / im.size[1]), height), Image.LANCZOS)
    im.save(os.path.join(out, name), optimize=True)
    print(name, im.size)


save(dark.crop(pad(full_box, 12)), 'velora-logo-oscuro.png', 900)
save(light.crop(pad(full_box, 12)), 'velora-logo-claro.png', 900)
save(horizontal(dark), 'velora-logo-h-oscuro.png', 240)
save(horizontal(light), 'velora-logo-h-claro.png', 240)
save(dark.crop(pad(mark_box, 8)), 'velora-marca-oscura.png', 512)
save(light.crop(pad(mark_box, 8)), 'velora-marca-clara.png', 512)

# Favicon: la V sobre cuadro blanco redondeado (se lee en pestañas claras y oscuras)
S = 512
fav = Image.new('RGBA', (S, S), (0, 0, 0, 0))
ImageDraw.Draw(fav).rounded_rectangle((0, 0, S - 1, S - 1), radius=112, fill=(255, 255, 255, 255))
mark = dark.crop(pad(mark_box, 4))
k = (S * 0.8) / max(mark.size)
mark = mark.resize((round(mark.size[0] * k), round(mark.size[1] * k)), Image.LANCZOS)
fav.alpha_composite(mark, ((S - mark.size[0]) // 2, (S - mark.size[1]) // 2))
save(fav, 'velora-favicon.png')
