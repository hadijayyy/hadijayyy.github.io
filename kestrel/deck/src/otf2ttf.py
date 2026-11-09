# Convert CFF-outline OTF fonts to TrueType-outline TTF (standard fontTools recipe),
# so Chromium embeds them in PDFs as TrueType instead of Type 3.
import sys
from fontTools.ttLib import TTFont, newTable
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

def convert(src, dst, max_err=1.0):
    font = TTFont(src)
    glyph_order = font.getGlyphOrder()
    gs = font.getGlyphSet()
    glyf = newTable('glyf'); glyf.glyphOrder = glyph_order; glyf.glyphs = {}
    for name in glyph_order:
        pen = TTGlyphPen(gs)
        gs[name].draw(Cu2QuPen(pen, max_err, reverse_direction=True))
        glyf[name] = pen.glyph()
    font['glyf'] = glyf
    font['loca'] = newTable('loca')
    font['maxp'] = maxp = newTable('maxp')
    maxp.tableVersion = 0x00010000
    for attr in ('maxZones', 'maxTwilightPoints', 'maxStorage', 'maxFunctionDefs', 'maxInstructionDefs', 'maxStackElements', 'maxSizeOfInstructions', 'maxComponentElements'):
        setattr(maxp, attr, 0)
    maxp.maxZones = 1
    post = font['post']; post.formatType = 2.0; post.extraNames = []; post.mapping = {}; post.glyphOrder = glyph_order
    for t in ('CFF ', 'VORG'):
        if t in font: del font[t]
    font['head'].glyphDataFormat = 0
    font.sfntVersion = '\x00\x01\x00\x00'
    font.save(dst)

for src in sys.argv[2:]:
    import os
    convert(src, os.path.join(sys.argv[1], os.path.basename(src).replace('.otf', '.ttf')))
    print('ok', src)
