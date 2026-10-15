"""Export the original geometric icon and store promotion assets.

Optional maintainer tool: Python 3 + Pillow (pip install Pillow).
No image generation service, stock images, or YouTube logo are used.
The canonical vector is extension/icons/mark.svg; keep geometry in sync.
"""
from pathlib import Path
from PIL import Image, ImageDraw, PngImagePlugin

ROOT = Path(__file__).resolve().parents[1]
STORE = ROOT / 'store'
STORE.mkdir(exist_ok=True)

def icon(size):
    scale = 4
    image = Image.new('RGBA', (512, 512))
    draw = ImageDraw.Draw(image)
    def box(bounds, radius, fill):
        draw.rounded_rectangle(tuple(int(v * scale) for v in bounds), radius=radius * scale, fill=fill)
    box((16, 16, 112, 112), 22, '#f04452')
    box((31, 41, 97, 81), 6, '#17191d')
    for x, y, dx, dy in [(38, 48, 10, 10), (90, 48, -10, 10), (38, 74, 10, -10), (90, 74, -10, -10)]:
        points = [(x + dx, y), (x, y), (x, y + dy)]
        draw.line([(a * scale, b * scale) for a, b in points], fill='white', width=3 * scale, joint='curve')
        for a, b in [points[0], points[2]]:
            draw.ellipse(((a - 1.5) * scale, (b - 1.5) * scale, (a + 1.5) * scale, (b + 1.5) * scale), fill='white')
    box((52, 88, 76, 92), 2, '#17191d')
    return image.resize((size, size), Image.Resampling.LANCZOS)

def save(image, path, provenance):
    metadata = PngImagePlugin.PngInfo()
    metadata.add_text('Source', provenance)
    image.save(path, pnginfo=metadata)

for size in [16, 32, 48, 128]:
    save(icon(size), ROOT / 'extension' / 'icons' / f'icon{size}.png',
         'Original geometric widescreen icon; vector source extension/icons/mark.svg; exported with scripts/generate-assets.py.')
save(icon(128), STORE / 'icon128.png', 'Export of extension/icons/mark.svg, an original project icon.')

# A text-free promotional tile: original mark and widening screen geometry.
for width, height, filename in [(440, 280, 'promo-small-440x280.png'), (1400, 560, 'promo-marquee-1400x560.png')]:
    factor = 3
    tile = Image.new('RGB', (width * factor, height * factor), '#17191d')
    d = ImageDraw.Draw(tile)
    cx, cy = width * factor / 2, height * factor / 2
    w, h = width * factor * .72, height * factor * .58
    d.rounded_rectangle((cx-w/2, cy-h/2, cx+w/2, cy+h/2), radius=18*factor, outline='#f04452', width=3*factor)
    mark = icon(round(height * factor * .65))
    tile.paste(mark, (round(cx-mark.width/2), round(cy-mark.height/2)), mark)
    tile = tile.resize((width, height), Image.Resampling.LANCZOS)
    save(tile, STORE / filename, 'Original vector-style promotion art derived from extension/icons/mark.svg; no third-party imagery.')
print('Exported four extension icons, store icon, and two promotional tiles.')
